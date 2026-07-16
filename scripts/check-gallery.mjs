import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";
import { findGalleryIdentityPolicyFailures, findUnresolvedGalleryVariables, runGalleryVariableFixtures } from "./validation/gallery-css-variables.mjs";
import { inspectGalleryAssetGraph, runGalleryOutputFixtures } from "./validation/gallery-output.mjs";
import { runGalleryProductionFixtures, validateGalleryProduction } from "./validation/gallery-production.mjs";
import { resolveGalleryReleaseState } from "./validation/gallery-release-state.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertGalleryBuildArtifacts({ root, commandName: "pnpm gallery:check" });
const galleryDir = join(root, "apps", "gallery", "dist");
const failures = [];
const outputFiles = new Map(
  readdirSync(galleryDir, { recursive: true })
    .filter((path) => typeof path === "string" && statSync(join(galleryDir, path)).isFile())
    .map((path) => [path.replaceAll("\\", "/"), readOutput(path)]),
);
const primitives = await import("../packages/primitives/dist/index.js");
const patterns = await import("../packages/patterns/dist/index.js");
const release = JSON.parse(readFileSync(join(root, "release.json"), "utf8"));
const galleryReleaseState = resolveGalleryReleaseState(release);
const packageEntrypoints = Object.fromEntries(
  ["tokens", "primitives", "patterns"].map((packageName) => {
    const manifest = JSON.parse(readFileSync(join(root, "packages", packageName, "package.json"), "utf8"));
    return [
      manifest.name,
      Object.keys(manifest.exports).map((entrypoint) =>
        entrypoint === "." ? manifest.name : `${manifest.name}/${entrypoint.replace(/^\.\//, "")}`,
      ),
    ];
  }),
);
const staticDocuments = [
  "index.html", "foundations/index.html", "foundations/tokens/index.html", "foundations/typography/index.html", "foundations/motion/index.html",
  "primitives/index.html", "patterns/index.html", "modes/index.html", "modes/complyeaze/index.html", "modes/axal/index.html", "modes/pack/index.html", "modes/tools/index.html", "adoption/index.html",
];
const primitiveDocuments = primitives.primitiveSpecs.map((contract) => `primitives/${contract.name.toLowerCase()}/index.html`);
const patternDocuments = patterns.productPatternContracts.map((contract) => `patterns/${contract.name.toLowerCase()}/index.html`);
const expectedDocumentPaths = [...staticDocuments, ...primitiveDocuments, ...patternDocuments].sort();
const actualDocumentPaths = [...outputFiles.keys()].filter((path) => path.endsWith(".html")).sort();
if (JSON.stringify(actualDocumentPaths) !== JSON.stringify(expectedDocumentPaths)) failures.push(`shipping HTML route set must be exact; expected ${expectedDocumentPaths.length}, found ${actualDocumentPaths.length}`);
for (const contract of patterns.productPatternContracts) {
  const expectedRoute = `/patterns/${contract.name.toLowerCase()}/`;
  const target = `${expectedRoute.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
  if (!outputFiles.has(target)) failures.push(`${contract.name} production detail route is missing shipping output: ${expectedRoute}`);
}

const stylesheetConsumers = new Set();
const inlineScripts = [];
for (const path of actualDocumentPaths) {
  const html = outputFiles.get(path) ?? "";
  const graph = inspectGalleryAssetGraph({ html, outputFiles, allowUnreferencedStylesheets: true, allowedInlineScriptMarkers: ["docs-search", "tool-filter", "site-search-shortcut"] });
  for (const stylesheet of graph.stylesheetPaths) stylesheetConsumers.add(stylesheet);
  for (const failure of graph.failures) failures.push(`${path}: ${failure}`);
  for (const unresolved of findUnresolvedGalleryVariables({ html, copiedCss: graph.stylesheets })) failures.push(`${path} references undefined ${unresolved.variable} in ${unresolved.locations.join(", ")}`);
  validateDocument(path, html);
  validateLinks(path, html);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const marker = match[1].match(/data-sanchika-(?:gallery|pattern)-script="([^"]+)"/)?.[1];
    if (!marker) continue;
    const record = { path, marker, raw: Buffer.byteLength(match[2]), gzip: gzipSync(match[2]).byteLength };
    inlineScripts.push(record);
    if (record.gzip > 6144) failures.push(`${path} ${marker} enhancement exceeds 6 KB gzip: ${record.gzip}`);
  }
}

for (const path of [...outputFiles.keys()].filter((path) => path.endsWith(".css"))) {
  if (!stylesheetConsumers.has(path)) failures.push(`emitted stylesheet ${path} is not referenced by any shipping document`);
}
const landingHtml = outputFiles.get("index.html") ?? "";
const landingGraph = inspectGalleryAssetGraph({ html: landingHtml, outputFiles, allowUnreferencedStylesheets: true, allowedInlineScriptMarkers: ["docs-search", "site-search-shortcut"] });
const landingCss = landingGraph.stylesheetPaths.map((path) => ({ path, raw: Buffer.byteLength(outputFiles.get(path) ?? ""), gzip: gzipSync(outputFiles.get(path) ?? "").byteLength }));
const landingCssGzip = landingCss.reduce((sum, asset) => sum + asset.gzip, 0);
const landingJs = inlineScripts.filter((script) => script.path === "index.html");
const landingJsGzip = landingJs.reduce((sum, script) => sum + script.gzip, 0);
if (landingCssGzip > 70 * 1024) failures.push(`landing CSS exceeds 70 KB gzip: ${landingCssGzip}`);
if (landingJsGzip > 15 * 1024) failures.push(`landing client JavaScript exceeds 15 KB gzip: ${landingJsGzip}`);
const landingWords = visibleText(landingHtml).split(/\s+/).filter(Boolean).length;
if (landingWords > 1800) failures.push(`landing visible copy exceeds 1,800 words: ${landingWords}`);

const productionFailures = validateGalleryProduction({
  outputFiles,
  expectedDocumentPaths,
  stableRelease: galleryReleaseState.currentStable,
  nextRelease: galleryReleaseState.next,
  packageEntrypoints,
});
failures.push(...productionFailures);

const appSources = readdirSync(join(root, "apps/gallery/src"), { recursive: true })
  .filter((path) => typeof path === "string" && statSync(join(root, "apps/gallery/src", path)).isFile())
  .map((path) => [path.replaceAll("\\", "/"), readFileSync(join(root, "apps/gallery/src", path), "utf8")]);
for (const [path, source] of appSources) {
  const isCraftLabRoute = path === "pages/lab/[territory].astro";
  if ((/(^|\/)lab(\/|$)/i.test(path) && !isCraftLabRoute) || /--lab-/.test(source)) failures.push(`retired lab source remains at ${path}`);
  if (isCraftLabRoute && !source.includes('process.env.SANCHIKA_CRAFT_LAB !== "1"')) failures.push("canonical craft lab route must remain environment gated");
  if (path.endsWith(".css")) {
    failures.push(...findGalleryIdentityPolicyFailures({ path, source }));
  }
}

const generatedCss = landingGraph.stylesheets.map(({ css }) => css).join("\n");
if (generatedCss.indexOf("--sk-color-canvas:") > generatedCss.indexOf(".sk-button")) failures.push("generated CSS must load tokens before primitives");
if (generatedCss.includes(":where()")) failures.push("generated CSS must not contain an empty :where() selector");

for (const [label, fixtures] of [
  ["gallery variable", runGalleryVariableFixtures()],
  ["gallery output", runGalleryOutputFixtures()],
  ["gallery production", runGalleryProductionFixtures()],
]) for (const failure of fixtures.failures) failures.push(`${label} fixture ${failure}`);

if (failures.length) {
  console.error("Sanchika gallery artifact check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Sanchika gallery artifact check passed (${expectedDocumentPaths.length} HTML routes; ${landingWords} landing words).`);
console.log(`Sanchika gallery CSS: ${landingCss.map((asset) => `${asset.path} ${asset.raw} raw/${asset.gzip} gzip`).join(", ")}.`);
for (const script of inlineScripts) console.log(`Sanchika client script ${script.path}:${script.marker}: ${script.raw} raw bytes; ${script.gzip} gzip bytes.`);
console.log(`Sanchika gallery production fixtures passed (${runGalleryProductionFixtures().count} cases).`);

function validateDocument(path, html) {
  if ((html.match(/<main\b/g) ?? []).length !== 1) failures.push(`${path} must contain exactly one main`);
  if ((html.match(/<h1\b/g) ?? []).length !== 1) failures.push(`${path} must contain exactly one h1`);
  if (!/<link rel="canonical" href="https:\/\/sanchika\.complyeaze\.com\//.test(html)) failures.push(`${path} must declare a canonical Sanchika URL`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) failures.push(`${path} must not contain duplicate IDs`);
  const headings = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
  for (let index = 1; index < headings.length; index += 1) if (headings[index] > headings[index - 1] + 1) failures.push(`${path} skips heading levels from h${headings[index - 1]} to h${headings[index]}`);
  if (/\/lab\//.test(html)) failures.push(`${path} must not link or refer to retired lab routes`);
}

function validateLinks(path, html) {
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("https://")) continue;
    const url = new URL(href, "https://sanchika.complyeaze.com/");
    if (url.origin !== "https://sanchika.complyeaze.com") continue;
    if (["/sanchika-manifest.json", "/llms.txt", "/sitemap.xml"].includes(url.pathname)) continue;
    const target = url.pathname === "/" ? "index.html" : `${url.pathname.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
    if (!outputFiles.has(target)) failures.push(`${path} links missing shipping target ${href}`);
  }
}

function visibleText(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function readOutput(path) {
  const file = join(galleryDir, path);
  return /\.(?:html|css|js|mjs|cjs|json|txt|xml)$/i.test(path) ? readFileSync(file, "utf8") : readFileSync(file);
}

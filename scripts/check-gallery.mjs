import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findUnresolvedGalleryVariables,
  runGalleryVariableFixtures,
} from "./validation/gallery-css-variables.mjs";
import {
  inspectGalleryAssetGraph,
  runGalleryOutputFixtures,
} from "./validation/gallery-output.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const galleryDir = join(root, "apps", "gallery", "dist");
const indexPath = join(galleryDir, "index.html");
const failures = [];

if (!existsSync(indexPath)) {
  failures.push(`${relative(indexPath)} must exist`);
}

const html = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
const outputFiles = existsSync(galleryDir)
  ? readdirSync(galleryDir, { recursive: true })
      .filter((path) => typeof path === "string" && statSync(join(galleryDir, path)).isFile())
      .map((path) => [path.replaceAll("\\", "/"), readOutputFile(path)])
  : [];
const outputFileMap = new Map(outputFiles);
const htmlOutputs = outputFiles.filter(([path]) => path.endsWith(".html"));
const expectedLabDocuments = [
  "lab/axal-review-desk/index.html",
  "lab/complyeaze-core/index.html",
  "lab/motion-and-assist/index.html",
  "lab/pack-local-proof/index.html",
  "lab/tools-directory/index.html",
];
const stylesheetConsumers = new Set();
let assetGraph = null;

for (const [path, documentHtml] of htmlOutputs) {
  const graph = inspectGalleryAssetGraph({
    html: documentHtml,
    outputFiles: outputFileMap,
    allowUnreferencedStylesheets: true,
    allowedInlineScriptMarker: path === "lab/tools-directory/index.html" ? "tool-filter" : null,
  });
  if (path === "index.html") assetGraph = graph;
  for (const stylesheetPath of graph.stylesheetPaths) stylesheetConsumers.add(stylesheetPath);
  for (const failure of graph.failures) failures.push(`${path}: ${failure}`);
  for (const unresolved of findUnresolvedGalleryVariables({ html: documentHtml, copiedCss: graph.stylesheets })) {
    failures.push(
      `${path} references undefined ${unresolved.variable} in ${unresolved.locations.join(", ")}`,
    );
  }

  if (path.startsWith("lab/") && !documentHtml.includes('<meta name="robots" content="noindex,nofollow">')) {
    failures.push(`${path} must declare noindex,nofollow`);
  }
  if (path === "lab/tools-directory/index.html" && graph.allowedInlineScriptInventory.length !== 1) {
    failures.push(`${path} must contain exactly one named tool-filter enhancement script`);
  }
}

for (const path of expectedLabDocuments) {
  if (!outputFileMap.has(path)) failures.push(`${path} must exist`);
}

for (const [path] of outputFiles.filter(([path]) => path.endsWith(".css"))) {
  if (!stylesheetConsumers.has(path)) failures.push(`emitted stylesheet ${path} is not referenced by any gallery document`);
}

const canonicalHrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)].map((match) => match[1]);
if (expectedLabDocuments.some((path) => canonicalHrefs.includes(`/${path.replace("/index.html", "/")}`))) {
  failures.push("canonical gallery navigation must not link to noindex lab routes");
}

const copiedCss = assetGraph?.stylesheets ?? [];

if (!assetGraph) failures.push("apps/gallery/dist/index.html asset graph must be inspectable");

for (const required of [
  "<!DOCTYPE html>",
  "<title>Sanchika | Design evidence system</title>",
  '<meta name="description"',
  '<link rel="canonical" href="https://sanchika.complyeaze.com/">',
  '<meta property="og:title" content="Sanchika | Design evidence system">',
  '<link rel="stylesheet" href="/_astro/',
  'data-sanchika-gallery-document="primitive"',
  'data-sanchika-gallery="primitive"',
  "Interfaces that survive compliance review.",
  "One design language, different trust boundaries.",
  "Sanchika product adoption map",
  "pnpm build",
  "pnpm gallery:check",
  "pnpm pages:smoke",
  "docs/adoption-complyeaze.md",
  "Read adoption proof plan",
  "Current public evidence ledger",
  "Use Sanchika as evidence, not authority.",
  "Pattern state exemplars",
]) {
  if (!html.includes(required)) {
    failures.push(`apps/gallery/dist/index.html must include ${required}`);
  }
}

if (html.includes("@sanchika/")) {
  failures.push("apps/gallery/dist/index.html must not contain unresolved @sanchika/* CSS hrefs");
}

const generatedCss = copiedCss.map(({ css }) => css).join("\n");
const tokenCssIndex = generatedCss.indexOf("--sk-color-bg-base:");
const primitiveCssIndex = generatedCss.indexOf(".sk-button");
if (tokenCssIndex === -1 || primitiveCssIndex === -1 || tokenCssIndex > primitiveCssIndex) {
  failures.push("apps/gallery generated CSS must load token CSS before primitive CSS");
}

if (generatedCss.includes(":where()")) {
  failures.push("apps/gallery generated CSS must not contain an empty :where() selector");
}
if ((generatedCss.match(/:where\([^)]*\.sk-button\[aria-busy=(?:true|"true")\][^)]*\):{1,2}after/g) ?? []).length < 2) {
  failures.push("apps/gallery generated CSS must preserve loading-button and reduced-motion pseudo-element selectors");
}
if (!/:where\(\.sk-field :is\(input,textarea,select,\[data-sk-control\]\)\):{1,2}placeholder/.test(generatedCss)) {
  failures.push("apps/gallery generated CSS must preserve the field placeholder selector");
}

const variableFixtures = runGalleryVariableFixtures();
for (const failure of variableFixtures.failures) {
  failures.push(`gallery variable fixture ${failure}`);
}

const outputFixtures = runGalleryOutputFixtures();
for (const failure of outputFixtures.failures) {
  failures.push(`gallery output fixture ${failure}`);
}

if (failures.length > 0) {
  console.error("Sanchika gallery artifact check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sanchika gallery artifact check passed.");
console.log(`Sanchika gallery variable fixtures passed (${variableFixtures.count} cases).`);
console.log(`Sanchika gallery output fixtures passed (${outputFixtures.count} cases).`);

function relative(path) {
  return path.replace(`${root}/`, "");
}

function readOutputFile(path) {
  return /\.(?:css|html)$/i.test(path) ? readFileSync(join(galleryDir, path), "utf8") : "";
}

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";
import {
  findUnresolvedGalleryVariables,
  runGalleryVariableFixtures,
} from "./validation/gallery-css-variables.mjs";
import {
  findCanonicalLabRouteLinks,
  inspectGalleryAssetGraph,
  runGalleryOutputFixtures,
} from "./validation/gallery-output.mjs";
import { runGalleryReferenceRuntimeFixtures } from "./validation/gallery-reference-runtime.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertGalleryBuildArtifacts({ root, commandName: "pnpm gallery:check" });
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
const expectedPatternDocuments = [
  "patterns/index.html",
  "patterns/public/index.html",
  "patterns/axal/index.html",
  "patterns/pack/index.html",
  "patterns/tools/index.html",
];
const toolDirectoryDocuments = new Set(["lab/tools-directory/index.html", "patterns/tools/index.html"]);
const tokenProofDocument = "foundations/tokens/index.html";
const primitiveFoundationDocument = "primitives/foundations/index.html";
const s5Document = "primitives/search-state-feedback/index.html";
const motionDocument = "foundations/motion/index.html";
const stylesheetConsumers = new Set();
let assetGraph = null;
const scriptSizes = new Map();

for (const [path, documentHtml] of htmlOutputs) {
  const graph = inspectGalleryAssetGraph({
    html: documentHtml,
    outputFiles: outputFileMap,
    allowUnreferencedStylesheets: true,
    allowedInlineScriptMarker: toolDirectoryDocuments.has(path) ? "tool-filter" : null,
    allowedInlineScriptMarkers: path === s5Document ? ["s5-search-field", "s5-copy-button"] : [],
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
  if (toolDirectoryDocuments.has(path) && graph.allowedInlineScriptInventory.length !== 1) {
    failures.push(`${path} must contain exactly one named tool-filter enhancement script`);
  }
  if (toolDirectoryDocuments.has(path) && graph.allowedInlineScriptInventory.length === 1) {
    const match = /<script[^>]*data-sanchika-pattern-script="tool-filter"[^>]*>([\s\S]*?)<\/script>/i.exec(documentHtml);
    if (match) {
      const raw = Buffer.byteLength(match[1]);
      const gzip = gzipSync(match[1]).byteLength;
      scriptSizes.set(`${path}:tool-filter`, { raw, gzip });
      if (raw > 6144) failures.push(`${path} tool-filter script must stay at or below 6144 raw bytes; found ${raw}`);
    }
  }
  if (path === s5Document) {
    const expectedMarkers = ["s5-search-field", "s5-copy-button"];
    if (JSON.stringify(graph.allowedInlineScriptInventory) !== JSON.stringify(expectedMarkers)) failures.push(`${path} must contain exactly the named S5 SearchField and CopyButton scripts`);
    for (const marker of expectedMarkers) {
      const match = new RegExp(`<script[^>]*data-sanchika-gallery-script="${marker}"[^>]*>([\\s\\S]*?)<\\/script>`, "i").exec(documentHtml);
      if (!match) continue;
      const raw = Buffer.byteLength(match[1]);
      const gzip = gzipSync(match[1]).byteLength;
      scriptSizes.set(`${path}:${marker}`, { raw, gzip });
      if (raw > 6144) failures.push(`${path} ${marker} script must stay at or below 6144 raw bytes; found ${raw}`);
    }
  }
}

for (const path of expectedLabDocuments) {
  if (!outputFileMap.has(path)) failures.push(`${path} must exist`);
}
for (const path of expectedPatternDocuments) {
  if (!outputFileMap.has(path)) failures.push(`${path} must exist`);
}

const patternIndexHtml = outputFileMap.get("patterns/index.html") ?? "";
for (const required of ["20 patterns. Four product modes.", "/patterns/public/", "/patterns/axal/", "/patterns/pack/", "/patterns/tools/"]) {
  if (!patternIndexHtml.includes(required)) failures.push(`patterns/index.html must include ${required}`);
}
for (const [path, required] of [
  ["patterns/public/index.html", ["PublicHero", "ProductRouteMap", "ProofStrip", "TrustBoundary", "SourceProvenanceStrip", "PricingBlock", "FAQAccordion", "ReleaseStatusBanner"]],
  ["patterns/axal/index.html", ["ReviewDeskPreview", "EvidencePanel", "HumanReviewCheckpoint", "AuditTrailPreview", "WorkQueueRow"]],
  ["patterns/pack/index.html", ["LocalArtifactFlow", "PermissionExplainer", "CustodyBoundary"]],
  ["patterns/tools/index.html", ["ToolDirectory", "ToolCard", "LocalBoundaryBanner", "OutputArtifactSummary"]],
]) {
  const documentHtml = outputFileMap.get(path) ?? "";
  for (const patternName of required) {
    if (!documentHtml.includes(`data-pattern-contract="${patternName}"`)) failures.push(`${path} must render package contract ${patternName}`);
  }
}

const tokenProofHtml = outputFileMap.get(tokenProofDocument) ?? "";
if (!tokenProofHtml) {
  failures.push(`${tokenProofDocument} must exist`);
} else {
  for (const required of [
    "<title>Token foundations | Sanchika</title>",
    '<link rel="canonical" href="https://sanchika.complyeaze.com/foundations/tokens/">',
    "One source. Every token decision inspectable.",
    "Extraction is not visual completion.",
    "data-token-type=",
    "--sk-color-canvas",
    "--sk-motion-duration-fast",
  ]) {
    if (!tokenProofHtml.includes(required)) failures.push(`${tokenProofDocument} must include ${required}`);
  }
}

const primitiveFoundationHtml = outputFileMap.get(primitiveFoundationDocument) ?? "";
if (!primitiveFoundationHtml) {
  failures.push(`${primitiveFoundationDocument} must exist`);
} else {
  for (const required of [
    "<title>Foundation primitives | Sanchika</title>",
    '<link rel="canonical" href="https://sanchika.complyeaze.com/primitives/foundations/">',
    'data-sanchika-gallery="foundation-primitives"',
    "Layout is a contract, not a screenshot.",
    "Link is navigation. Button is action.",
    "Never nest interactive controls inside LinkCard.",
    'data-sk-primitive="Container"',
    'data-sk-primitive="VisuallyHidden"',
    'data-sk-primitive="LinkCard"',
  ]) {
    if (!primitiveFoundationHtml.includes(required)) failures.push(`${primitiveFoundationDocument} must include ${required}`);
  }
}

const s5Html = outputFileMap.get(s5Document) ?? "";
if (!s5Html) {
  failures.push(`${s5Document} must exist`);
} else {
  for (const required of [
    "<title>Search, state, and feedback primitives | Sanchika</title>",
    '<link rel="canonical" href="https://sanchika.complyeaze.com/primitives/search-state-feedback/">',
    'data-sanchika-gallery="search-state-feedback"',
    "Make the next state legible.",
    'data-sk-contract="SearchField"',
    'data-sk-contract="TableShell"',
    'type="search"',
    'aria-current="step"',
    '<details class="sk-disclosure"',
    'aria-live="polite"',
    'data-empty-kind="filtered"',
    "PAN and GSTIN helpers group display text only",
  ]) if (!s5Html.includes(required)) failures.push(`${s5Document} must include ${required}`);
}

const motionHtml = outputFileMap.get(motionDocument) ?? "";
if (!motionHtml) {
  failures.push(`${motionDocument} must exist`);
} else {
  for (const required of [
    "<title>Motion and assist foundations | Sanchika</title>",
    '<link rel="canonical" href="https://sanchika.complyeaze.com/foundations/motion/">',
    'data-sanchika-gallery="motion-assist"',
    "Assist the state. Never invent it.",
    'data-motion-utility-count="8"',
    'data-motion-key="focus-feedback"',
    'data-motion-key="skeleton-loading"',
    "The assist is optional; the responsibility is not.",
  ]) if (!motionHtml.includes(required)) failures.push(`${motionDocument} must include ${required}`);
}

const referenceRuntimeFixtures = await runGalleryReferenceRuntimeFixtures({
  searchScript: extractInlineScript(s5Html, "data-sanchika-gallery-script", "s5-search-field"),
  copyScript: extractInlineScript(s5Html, "data-sanchika-gallery-script", "s5-copy-button"),
  toolsScript: extractInlineScript(outputFileMap.get("lab/tools-directory/index.html") ?? "", "data-sanchika-pattern-script", "tool-filter"),
});
for (const failure of referenceRuntimeFixtures.failures) failures.push(`gallery reference runtime fixture ${failure}`);

for (const [path] of outputFiles.filter(([path]) => path.endsWith(".css"))) {
  if (!stylesheetConsumers.has(path)) failures.push(`emitted stylesheet ${path} is not referenced by any gallery document`);
}

if (findCanonicalLabRouteLinks({ html, expectedLabDocuments }).length > 0) {
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
  'href="/foundations/motion/"',
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
if ((generatedCss.match(/:where\([^)]*\.sk-button\[aria-busy=(?:true|"true")\][^)]*\):{1,2}after/g) ?? []).length < 1) {
  failures.push("apps/gallery generated CSS must preserve the static loading-button pseudo-element selector");
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
console.log(`Sanchika gallery reference runtime fixtures passed (${referenceRuntimeFixtures.count} cases).`);
for (const [label, size] of scriptSizes) console.log(`Sanchika client script ${label}: ${size.raw} raw bytes; ${size.gzip} gzip bytes.`);

function relative(path) {
  return path.replace(`${root}/`, "");
}

function readOutputFile(path) {
  return /\.(?:css|html)$/i.test(path) ? readFileSync(join(galleryDir, path), "utf8") : "";
}

function extractInlineScript(html, markerAttribute, marker) {
  return new RegExp(`<script[^>]*${markerAttribute}="${marker}"[^>]*>([\\s\\S]*?)<\\/script>`, "i").exec(html)?.[1] ?? "";
}

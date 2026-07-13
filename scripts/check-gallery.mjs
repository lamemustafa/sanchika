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
const assetGraph = inspectGalleryAssetGraph({ html, outputFiles: new Map(outputFiles) });
const copiedCss = assetGraph.stylesheets;

failures.push(...assetGraph.failures);

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

for (const unresolved of findUnresolvedGalleryVariables({ html, copiedCss })) {
  failures.push(
    `generated gallery references undefined ${unresolved.variable} in ${unresolved.locations.join(", ")}`,
  );
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

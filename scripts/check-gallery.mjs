import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const galleryDir = join(root, "dist", "gallery");
const indexPath = join(galleryDir, "index.html");
const themePath = join(galleryDir, "assets", "theme.css");
const primitivesPath = join(galleryDir, "assets", "primitives.css");
const failures = [];

for (const path of [indexPath, themePath, primitivesPath]) {
  if (!existsSync(path)) {
    failures.push(`${relative(path)} must exist`);
  }
}

const html = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
for (const required of [
  "<!doctype html>",
  "<title>Sanchika | Design evidence system</title>",
  '<meta name="description"',
  '<link rel="canonical" href="https://sanchika.complyeaze.com/">',
  '<meta property="og:title" content="Sanchika | Design evidence system">',
  '<link rel="stylesheet" href="assets/theme.css">',
  '<link rel="stylesheet" href="assets/primitives.css">',
  'data-sanchika-gallery-document="primitive"',
  'data-sanchika-gallery="primitive"',
  "Interfaces that survive compliance review.",
  "Current public evidence ledger",
  "Use Sanchika as evidence, not authority.",
  "Pattern state exemplars",
]) {
  if (!html.includes(required)) {
    failures.push(`dist/gallery/index.html must include ${required}`);
  }
}

if (html.includes("@sanchika/")) {
  failures.push("dist/gallery/index.html must not contain unresolved @sanchika/* CSS hrefs");
}

if (html.indexOf("assets/theme.css") > html.indexOf("assets/primitives.css")) {
  failures.push("dist/gallery/index.html must load token CSS before primitive CSS");
}

if (failures.length > 0) {
  console.error("Sanchika gallery artifact check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sanchika gallery artifact check passed.");

function relative(path) {
  return path.replace(`${root}/`, "");
}

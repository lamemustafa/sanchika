import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tokenCss = read("packages/tokens/src/theme.css");
const tokenSource = read("packages/tokens/src/index.ts");
const primitiveCss = read("packages/primitives/src/styles.css");
const failures = [];

if (/#[0-9a-f]{3,8}\b/i.test(`${tokenSource}\n${tokenCss}\n${primitiveCss}`)) {
  failures.push("package source must not use raw hex color values");
}

if (/oklch\(/.test(tokenSource)) {
  failures.push("token TypeScript metadata must not duplicate raw OKLCH values");
}

const primitiveCssWithoutAllowedMixing = primitiveCss.replace(/color-mix\(in oklch,[^)]+\)/g, "");
if (/oklch\(/.test(primitiveCssWithoutAllowedMixing)) {
  failures.push("primitive CSS must not declare raw OKLCH values outside token CSS");
}

for (const declaration of primitiveCss.matchAll(
  /(?<property>border-radius|box-shadow|font-size|font-weight|line-height|min-block-size|padding):\s*(?<value>[^;]+);/g,
)) {
  const value = declaration.groups.value;
  if (declaration.groups.property === "border-radius" && value.trim() === "50%") {
    continue;
  }
  if (!value.includes("var(--sk-") && !["inherit", "0", "normal", "none"].includes(value.trim())) {
    failures.push(`primitive CSS ${declaration.groups.property} must use a --sk-* token or primitive variable: ${value}`);
  }
}

for (const required of ["--sk-color-bg-base", "--sk-space-4", "--sk-radius-control", "--sk-motion-duration-standard"]) {
  if (!tokenCss.includes(`${required}:`) || !tokenSource.includes(`cssVariable: "${required}"`)) {
    failures.push(`${required} must exist in token CSS and token metadata`);
  }
}

if (failures.length > 0) {
  console.error("Sanchika token integrity check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sanchika token integrity check passed.");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

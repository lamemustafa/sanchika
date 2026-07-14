import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  authoredTokenGroups,
  authoredTokens,
  compatibilityCollections,
} from "../packages/tokens/src/tokens.ts";
import {
  renderTokenArtifacts,
  tokenArtifactPaths,
  validateTokenSource,
  writeTokenArtifacts,
} from "./token-generation.mjs";
import {
  contrastPairs,
  evaluateContrastPairs,
  parseCssCustomProperties,
  resolveCssVariable,
} from "./validation/contrast.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const primitiveCss = [
  "packages/primitives/src/styles.css",
  "packages/primitives/src/foundation.css",
  "packages/primitives/src/typography.css",
  "packages/primitives/src/components.css",
  "packages/primitives/src/search-feedback.css",
  "packages/primitives/src/process-data.css",
  "packages/primitives/src/motion.css",
].map(read).join("\n");
const tokenEntrypoint = read("packages/tokens/src/index.ts");
const failures = validateTokenSource({
  tokens: authoredTokens,
  groups: authoredTokenGroups,
  collections: compatibilityCollections,
});
const artifacts = renderTokenArtifacts({
  tokens: authoredTokens,
  groups: authoredTokenGroups,
  collections: compatibilityCollections,
});
const checkedInArtifacts = Object.fromEntries(
  Object.entries(tokenArtifactPaths).map(([name, relativePath]) => [name, read(relativePath)]),
);

for (const name of staleArtifactNames(checkedInArtifacts, artifacts)) {
  failures.push(`${tokenArtifactPaths[name]} is stale; run pnpm build:tokens`);
}

for (const [name, relativePath] of Object.entries(tokenArtifactPaths)) {
  const actual = checkedInArtifacts[name];
  if (!actual.includes("@generated") || !/do not edit/i.test(actual)) failures.push(`${relativePath} needs a generated-file header`);
  if (/\/Users\/|\\Users\\|\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(actual)) failures.push(`${relativePath} must not contain timestamps or machine-specific paths`);
}

if (!tokenEntrypoint.includes('export * from "./generated.js";') || /oklch\(|cssVariable\s*:/.test(tokenEntrypoint)) {
  failures.push("packages/tokens/src/index.ts must remain a value-free re-export of generated metadata");
}

if (/#[0-9a-f]{3,8}\b/i.test(primitiveCss)) failures.push("primitive CSS must not use raw hex color values");
const primitiveCssWithoutAllowedMixing = primitiveCss.replace(/color-mix\(in oklch,[^)]+\)/g, "");
if (/oklch\(/.test(primitiveCssWithoutAllowedMixing)) failures.push("primitive CSS must not declare raw OKLCH values outside token CSS");

for (const declaration of primitiveCss.matchAll(
  /(?<property>border(?:-(?:top|right|bottom|left|block|inline))?|border-radius|box-shadow|font-family|font-size|font-weight|letter-spacing|line-height|min-block-size|padding):\s*(?<value>[^;]+);/g,
)) {
  const value = declaration.groups.value;
  if (declaration.groups.property === "border-radius" && value.trim() === "50%") continue;
  if (!value.includes("var(--sk-") && !["inherit", "0", "normal", "none", "transparent"].includes(value.trim())) {
    failures.push(`primitive CSS ${declaration.groups.property} must use a --sk-* token or primitive variable: ${value}`);
  }
}

for (const result of evaluateContrastPairs(artifacts.css)) {
  if (result.ratio < result.minimum) failures.push(`${result.name} contrast ${result.ratio.toFixed(2)}:1 is below ${result.minimum}:1`);
}

const fixtures = runFixtures(artifacts);
failures.push(...fixtures.failures);

if (failures.length > 0) {
  console.error("Sanchika token integrity check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Sanchika token integrity fixtures passed (${fixtures.count} cases).`);
for (const result of evaluateContrastPairs(artifacts.css)) {
  console.log(`Contrast: ${result.name} ${result.ratio.toFixed(2)}:1 (minimum ${result.minimum}:1)`);
}
console.log(`Sanchika token integrity check passed (${authoredTokens.length} authored tokens, ${contrastPairs.length} contrast pairs).`);

function runFixtures(productionArtifacts) {
  const fixtureFailures = [];
  let count = 0;
  const run = (name, check) => {
    count += 1;
    try {
      if (!check()) fixtureFailures.push(`fixture ${name} did not detect the expected failure`);
    } catch (error) {
      fixtureFailures.push(`fixture ${name} crashed: ${error.message}`);
    }
  };

  run("duplicate CSS variable", () => {
    const tokens = cloneTokens();
    tokens.push({ ...tokens[0], id: "fixture.duplicate-css-variable", description: "Fixture duplicate." });
    return sourceFailures(tokens).some((failure) => failure.includes("duplicate CSS variable"));
  });
  run("invalid alias target", () => {
    const tokens = cloneTokens();
    tokens.find((token) => token.id === "color.surface-muted").alias = "fixture.missing";
    return sourceFailures(tokens).some((failure) => failure.includes("invalid alias target"));
  });
  run("circular aliases", () => {
    const tokens = cloneTokens();
    tokens.find((token) => token.id === "color.surface-muted").alias = "color.ink-muted";
    tokens.find((token) => token.id === "color.ink-muted").alias = "color.surface-muted";
    return sourceFailures(tokens).some((failure) => failure.includes("circular alias"));
  });
  run("unsupported token type", () => {
    const tokens = cloneTokens();
    tokens[0].type = "rainbow";
    return sourceFailures(tokens).some((failure) => failure.includes("unsupported token type"));
  });
  run("unsupported token value", () => {
    const tokens = cloneTokens();
    tokens.find((token) => token.id === "motion.duration-fast").value = "spring(1)";
    return sourceFailures(tokens).some((failure) => failure.includes("unsupported duration value"));
  });
  run("missing semantic description", () => {
    const tokens = cloneTokens();
    tokens[0].description = "";
    return sourceFailures(tokens).some((failure) => failure.includes("missing semantic description"));
  });
  run("stale generated CSS", () => {
    const staleArtifacts = { ...productionArtifacts, css: `${productionArtifacts.css}\n/* stale fixture */\n` };
    return staleArtifactNames(staleArtifacts, productionArtifacts).includes("css");
  });
  run("stale generated TypeScript", () => {
    const staleArtifacts = { ...productionArtifacts, typescript: `${productionArtifacts.typescript}\n// stale fixture\n` };
    return staleArtifactNames(staleArtifacts, productionArtifacts).includes("typescript");
  });
  run("deterministic repeated render", () => {
    const repeated = renderTokenArtifacts({ tokens: authoredTokens, groups: authoredTokenGroups, collections: compatibilityCollections });
    return Object.keys(productionArtifacts).every((name) => sha256(productionArtifacts[name]) === sha256(repeated[name]));
  });
  run("deliberately failing status contrast", () => {
    const failingCss = productionArtifacts.css.replace(
      /--sk-color-success-fg:[^;]+;/,
      "--sk-color-success-fg: var(--sk-color-success-bg);",
    );
    return evaluateContrastPairs(failingCss).some((result) => result.name.startsWith("success") && result.ratio < result.minimum);
  });
  run("v0.0.2 alias resolution", () => {
    const declarations = parseCssCustomProperties(productionArtifacts.css);
    return [
      ["--sk-color-bg-base", "--sk-color-canvas"],
      ["--sk-color-border-control", "--sk-color-border-default"],
      ["--sk-color-success", "--sk-color-success-fg"],
      ["--sk-radius-card", "--sk-radius-md"],
      ["--sk-elevation-card", "--sk-shadow-card"],
    ].every(([legacyVariable, replacement]) => resolveCssVariable(declarations, legacyVariable) === resolveCssVariable(declarations, replacement));
  });
  run("clean temporary-directory generation", () => {
    const first = mkdtempSync(join(tmpdir(), "sanchika-tokens-first-"));
    const second = mkdtempSync(join(tmpdir(), "sanchika-tokens-second-"));
    try {
      writeTokenArtifacts({ outputRoot: first, tokens: authoredTokens, groups: authoredTokenGroups, collections: compatibilityCollections });
      writeTokenArtifacts({ outputRoot: second, tokens: authoredTokens, groups: authoredTokenGroups, collections: compatibilityCollections });
      return Object.values(tokenArtifactPaths).every((relativePath) => {
        const left = readFileSync(join(first, relativePath), "utf8");
        const right = readFileSync(join(second, relativePath), "utf8");
        return sha256(left) === sha256(right) && !left.includes(first) && !left.includes(second);
      });
    } finally {
      rmSync(first, { recursive: true, force: true });
      rmSync(second, { recursive: true, force: true });
    }
  });

  return { count, failures: fixtureFailures };
}

function cloneTokens() {
  return authoredTokens.map((token) => ({
    ...token,
    legacyAliases: token.legacyAliases?.map((item) => ({ ...item })),
  }));
}

function sourceFailures(tokens) {
  return validateTokenSource({ tokens, groups: authoredTokenGroups, collections: compatibilityCollections });
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function staleArtifactNames(actualArtifacts, expectedArtifacts) {
  return Object.keys(tokenArtifactPaths).filter((name) => actualArtifacts[name] !== expectedArtifacts[name]);
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

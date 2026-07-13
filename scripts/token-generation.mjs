import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const tokenArtifactPaths = {
  css: "packages/tokens/src/theme.css",
  typescript: "packages/tokens/src/generated.ts",
  docs: "docs/tokens.md",
};

const allowedTypes = new Set([
  "color",
  "dimension",
  "duration",
  "easing",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
  "shadow",
]);

export function validateTokenSource({ tokens, groups, collections }) {
  const failures = [];
  const groupIds = new Set();
  const tokenIds = new Set();
  const variables = new Map();

  for (const group of groups) {
    if (!group.id || groupIds.has(group.id)) failures.push(`duplicate or missing token group ${String(group.id)}`);
    if (!group.title || !group.description) failures.push(`token group ${String(group.id)} needs title and description`);
    groupIds.add(group.id);
  }

  for (const token of tokens) {
    if (!token.id || tokenIds.has(token.id)) failures.push(`duplicate or missing token id ${String(token.id)}`);
    tokenIds.add(token.id);
    if (!/^--sk-[a-z0-9-]+$/.test(token.cssVariable ?? "")) failures.push(`${String(token.id)} has invalid CSS variable ${String(token.cssVariable)}`);
    registerVariable(variables, token.cssVariable, token.id, failures);
    if (!allowedTypes.has(token.type)) failures.push(`${token.id} uses unsupported token type ${String(token.type)}`);
    if (!groupIds.has(token.group)) failures.push(`${token.id} references unknown group ${String(token.group)}`);
    for (const field of ["description", "usage", "avoid", "source"]) {
      if (typeof token[field] !== "string" || token[field].trim() === "") failures.push(`${token.id} is missing semantic ${field}`);
    }
    const hasValue = typeof token.value === "string";
    const hasAlias = typeof token.alias === "string";
    if (hasValue === hasAlias) failures.push(`${token.id} must define exactly one of value or alias`);
    if (hasValue && !validValue(token.type, token.value)) failures.push(`${token.id} has unsupported ${token.type} value ${token.value}`);
    if (token.deprecated && !token.replacement) failures.push(`${token.id} is deprecated without a replacement`);
    for (const alias of token.legacyAliases ?? []) {
      if (!alias.note) failures.push(`${token.id} legacy alias ${String(alias.cssVariable)} needs a deprecation note`);
      registerVariable(variables, alias.cssVariable, `${token.id} legacy alias`, failures);
    }
  }

  const byId = new Map(tokens.map((token) => [token.id, token]));
  for (const token of tokens) {
    if (token.alias && !byId.has(token.alias)) failures.push(`${token.id} references invalid alias target ${token.alias}`);
    if (token.replacement && !byId.has(token.replacement)) failures.push(`${token.id} references invalid replacement ${token.replacement}`);
    resolveToken(token.id, byId, failures, []);
  }

  for (const token of tokens) {
    for (const reference of (token.value ?? "").matchAll(/var\((--sk-[a-z0-9-]+)/g)) {
      if (!variables.has(reference[1])) failures.push(`${token.id} value references unknown CSS variable ${reference[1]}`);
    }
  }

  const exportNames = new Set();
  for (const collection of collections) {
    if (exportNames.has(collection.exportName)) failures.push(`duplicate compatibility export ${collection.exportName}`);
    exportNames.add(collection.exportName);
    for (const field of ["keyTypeName", "definitionTypeName", "definitionForTypeName", "definitionsTypeName", "discriminator", "cssVariableTemplate"]) {
      if (!collection[field]) failures.push(`${collection.exportName} is missing ${field}`);
    }
    const keys = new Set();
    for (const item of collection.entries) {
      if (keys.has(item.key)) failures.push(`${collection.exportName} duplicates key ${item.key}`);
      keys.add(item.key);
      if (!byId.has(item.token)) failures.push(`${collection.exportName}.${item.key} references unknown token ${item.token}`);
      const cssVariable = item.cssVariable ?? byId.get(item.token)?.cssVariable;
      if (!variables.has(cssVariable)) failures.push(`${collection.exportName}.${item.key} references unknown CSS variable ${String(cssVariable)}`);
      if (!item.usage) failures.push(`${collection.exportName}.${item.key} is missing compatibility usage`);
    }
  }

  return failures;
}

export function renderTokenArtifacts({ tokens, groups, collections }) {
  const failures = validateTokenSource({ tokens, groups, collections });
  if (failures.length) throw new Error(`Invalid token source:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);

  const byId = new Map(tokens.map((token) => [token.id, token]));
  const metadata = tokens.map((token) => ({
    id: token.id,
    cssVariable: token.cssVariable,
    type: token.type,
    value: token.value ?? null,
    alias: token.alias ?? null,
    resolvedValue: resolveToken(token.id, byId, [], []),
    group: token.group,
    description: token.description,
    usage: token.usage,
    avoid: token.avoid,
    source: token.source,
    deprecated: token.deprecated === true,
    replacement: token.replacement ?? null,
    legacyAliases: token.legacyAliases ?? [],
  }));

  return {
    css: renderCss(tokens, groups, byId),
    typescript: renderTypescript(metadata, groups, collections, byId),
    docs: renderDocs(metadata, groups),
  };
}

export function writeTokenArtifacts({ outputRoot, tokens, groups, collections }) {
  const artifacts = renderTokenArtifacts({ tokens, groups, collections });
  for (const [name, relativePath] of Object.entries(tokenArtifactPaths)) {
    const path = join(outputRoot, relativePath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, artifacts[name]);
  }
  return artifacts;
}

function renderCss(tokens, groups, byId) {
  const lines = ["/* @generated by scripts/build-tokens.mjs from packages/tokens/src/tokens.ts. */", "/* Do not edit this file manually. */", ":root {"];
  for (const group of groups) {
    const groupTokens = tokens.filter((token) => token.group === group.id);
    if (!groupTokens.length) continue;
    lines.push(`  /* ${group.title} */`);
    for (const token of groupTokens) {
      const value = token.alias ? `var(${byId.get(token.alias).cssVariable})` : token.value;
      lines.push(`  ${token.cssVariable}: ${value};`);
    }
    lines.push("");
  }
  const legacyAliases = tokens.flatMap((token) => (token.legacyAliases ?? []).map((item) => ({ ...item, target: token.cssVariable })));
  if (legacyAliases.length) {
    lines.push("  /* Deprecated v0.0.2 aliases: remove only in an explicitly approved breaking release. */");
    for (const item of legacyAliases) lines.push(`  ${item.cssVariable}: var(${item.target});`);
    lines.push("");
  }
  lines.push("}", "");
  return lines.join("\n");
}

function renderTypescript(metadata, groups, collections, byId) {
  const lines = [
    "// @generated by scripts/build-tokens.mjs from packages/tokens/src/tokens.ts.",
    "// Do not edit this file manually.",
    "",
    `export const tokenDefinitions = ${JSON.stringify(metadata, null, 2)} as const;`,
    "",
    `export const tokenGroupDefinitions = ${JSON.stringify(groups, null, 2)} as const;`,
    "",
    "export type TokenDefinition = (typeof tokenDefinitions)[number];",
    "export type TokenId = TokenDefinition[\"id\"];",
    "export type TokenGroupId = (typeof tokenGroupDefinitions)[number][\"id\"];",
    "export function getTokenDefinition(id: TokenId): TokenDefinition {",
    "  const token = tokenDefinitions.find((candidate) => candidate.id === id);",
    "  if (!token) throw new Error(`Unknown Sanchika token ${id}`);",
    "  return token;",
    "}",
    "",
  ];

  for (const collection of collections) {
    const union = collection.entries.map((item) => JSON.stringify(item.key)).join(" | ");
    lines.push(`export type ${collection.keyTypeName} = ${union};`);
    lines.push(`export type ${collection.definitionTypeName} = { cssVariable: \`${collection.cssVariableTemplate}\`; ${collection.discriminator}: ${collection.keyTypeName}; usage: string; };`);
    lines.push(`export type ${collection.definitionForTypeName}<Value extends ${collection.keyTypeName}> = Omit<${collection.definitionTypeName}, \"${collection.discriminator}\"> & { ${collection.discriminator}: Value };`);
    lines.push(`export type ${collection.definitionsTypeName} = { [Value in ${collection.keyTypeName}]: ${collection.definitionForTypeName}<Value> };`);
    lines.push(`export const ${collection.exportName} = {`);
    for (const item of collection.entries) {
      const token = byId.get(item.token);
      lines.push(`  ${JSON.stringify(item.key)}: { cssVariable: ${JSON.stringify(item.cssVariable ?? token.cssVariable)}, ${collection.discriminator}: ${JSON.stringify(item.key)}, usage: ${JSON.stringify(item.usage)} },`);
    }
    lines.push(`} as const satisfies ${collection.definitionsTypeName};`, "");
  }
  return lines.join("\n");
}

function renderDocs(metadata, groups) {
  const lines = [
    "<!-- @generated by scripts/build-tokens.mjs from packages/tokens/src/tokens.ts. Do not edit manually. -->",
    "# Tokens",
    "",
    "Sanchika v0.1 tokens are authored once in `packages/tokens/src/tokens.ts`. `pnpm build:tokens` deterministically generates package CSS, TypeScript metadata, and this reference. `pnpm check:tokens` fails when any generated output is stale.",
    "",
    "The C1 direction is approved, but visual maturity is not complete. Token extraction improves consistency and expressive vocabulary; it does not close the five reservations around brand memorability, emotional impact, product-specific character, real workflow depth, or edge-state completeness.",
    "",
    "## Architecture and usage",
    "",
    "- Import `@sanchika/tokens/theme.css` before `@sanchika/primitives/styles.css`.",
    "- Use semantic roles; do not copy resolved values into consumers.",
    "- OKLCH remains the color source of truth. There is one canonical light theme; dark and high-contrast themes are not part of S3.",
    "- Font stacks are runtime-safe fallbacks. Font binaries and loading are consumer/gallery responsibilities.",
    "- Generated TypeScript exports `tokenDefinitions`, `tokenGroupDefinitions`, `getTokenDefinition`, and the v0.0.2 compatibility collections.",
    "",
    "Standards: [CSS Custom Properties](https://www.w3.org/TR/css-variables-1/) and [W3C Design Tokens Community Group](https://www.w3.org/community/design-tokens/). Sanchika does not claim conformance to an unfinished exchange format.",
    "",
  ];

  for (const group of groups) {
    const groupTokens = metadata.filter((token) => token.group === group.id);
    if (!groupTokens.length) continue;
    lines.push(`## ${group.title}`, "", group.description, "", "| Semantic token | CSS variable | Example / resolved value | Use | Do not use | Legacy alias / deprecation | C1 or compatibility source |", "| --- | --- | --- | --- | --- | --- | --- |");
    for (const token of groupTokens) {
      const legacyText = [
        ...token.legacyAliases.map((item) => `${item.cssVariable}: ${item.note}`),
        ...(token.deprecated ? [`Deprecated; replacement ${token.replacement}`] : []),
      ].join("; ") || "—";
      const example = token.alias ? `alias of ${token.alias}; resolves to ${token.resolvedValue}` : token.resolvedValue;
      lines.push(`| \`${escapeCell(token.id)}\` | \`${escapeCell(token.cssVariable)}\` | \`${escapeCell(example)}\` | ${escapeCell(token.usage)} | ${escapeCell(token.avoid)} | ${escapeCell(legacyText)} | ${escapeCell(token.source)} |`);
    }
    lines.push("");
  }

  lines.push(
    "## Forced colors",
    "",
    "Do not disable system colors blindly. Preserve visible borders and focus, allow status text to remain the semantic signal, and use native forced-color behavior where it is stronger than authored colors. Package tokens do not substitute for consumer-level forced-colors testing.",
    "",
    "## C1 extraction decision",
    "",
    "The source references in the tables point back to the approved C1 foundations, motion decisions, or the v0.0.2 compatibility contract. Product-specific canvases, one-off headline breaks, textures, breakpoints, and pattern composition remain local or deferred to S4–S7.",
    "",
  );
  return lines.join("\n");
}

function registerVariable(variables, variable, owner, failures) {
  if (!/^--sk-[a-z0-9-]+$/.test(variable ?? "")) {
    failures.push(`${owner} has invalid CSS variable ${String(variable)}`);
    return;
  }
  if (variables.has(variable)) failures.push(`duplicate CSS variable ${variable} from ${owner} and ${variables.get(variable)}`);
  variables.set(variable, owner);
}

function resolveToken(id, byId, failures, stack) {
  const token = byId.get(id);
  if (!token) return "";
  if (!token.alias) return token.value;
  if (stack.includes(id)) {
    failures.push(`circular alias ${[...stack, id].join(" -> ")}`);
    return "";
  }
  return resolveToken(token.alias, byId, failures, [...stack, id]);
}

function validValue(type, value) {
  if (typeof value !== "string" || !value.trim() || /\r|\n/.test(value)) return false;
  if (type === "color") return /^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+(?:\s*\/\s*[\d.]+%)?\)$/.test(value);
  if (type === "duration") return /^\d+(?:\.\d+)?ms$/.test(value);
  if (type === "easing") return /^(?:linear|ease-out|cubic-bezier\([\d.,\s]+\))$/.test(value);
  if (type === "font-weight") return /^(?:[1-9]00|650)$/.test(value);
  if (type === "line-height") return /^\d+(?:\.\d+)?$/.test(value);
  if (type === "letter-spacing") return /^(?:0|-?\d+(?:\.\d+)?em)$/.test(value);
  if (type === "dimension" || type === "font-size") return /^(?:\d+(?:\.\d+)?(?:px|rem|em|%)|clamp\([^)]+\))$/.test(value);
  if (type === "font-family") return value.includes(",");
  if (type === "shadow") return !/(?:#[\da-f]{3,8}|\brgb\(|\bhsl\()/i.test(value);
  return false;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

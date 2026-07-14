import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm consumer:check" });
const consumerDir = mkdtempSync(join(tmpdir(), "sanchika-consumer-"));

try {
  writeFileSync(join(consumerDir, "package.json"), `${JSON.stringify({ type: "module", dependencies: {} }, null, 2)}\n`);
  const packageLinks = {
    "@sanchika/tokens": join(root, "packages/tokens"),
    "@sanchika/primitives": join(root, "packages/primitives"),
    "@sanchika/patterns": join(root, "packages/patterns"),
  };

  run("pnpm", [
    "--dir",
    consumerDir,
    "add",
    "--offline",
    ...Object.entries(packageLinks).map(([packageName, packageDir]) => `${packageName}@link:${packageDir}`),
  ]);
  assertLinkDependencies(packageLinks);

  writeFileSync(
    join(consumerDir, "legacy-token.css"),
    '@import "@sanchika/tokens/theme.css";\n.legacy-surface { background: var(--sk-color-bg-base); color: var(--sk-color-ink-primary); border: 1px solid var(--sk-color-border-control); border-radius: var(--sk-radius-card); }\n',
  );

  const probePath = join(consumerDir, "probe.mjs");
  writeFileSync(
    probePath,
    `import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { colorTokens, tokenDefinitions } from "@sanchika/tokens";
import { formatIndianCurrency, formatIndianDate, formatIndianNumber, formatPANDisplay, motionAssistClassName, motionAssistUtilities, primitiveClassName, primitiveSpecs, textClassName } from "@sanchika/primitives";
import { patternSpecs } from "@sanchika/patterns";

const require = createRequire(import.meta.url);
const themePath = require.resolve("@sanchika/tokens/theme.css");
const themeCss = readFileSync(themePath, "utf8");
const legacyCss = readFileSync(new URL("./legacy-token.css", import.meta.url), "utf8");
const legacyColorTokenKeys = ["bgBase", "bgSurface", "inkPrimary", "inkMuted", "borderControl", "brandPrimary", "accent", "success", "warning", "danger", "info"];
const checks = [
  colorTokens.brandPrimary.cssVariable === "--sk-color-brand-primary",
  colorTokens.bgBase.cssVariable === "--sk-color-bg-base",
  JSON.stringify(Object.keys(colorTokens)) === JSON.stringify(legacyColorTokenKeys),
  tokenDefinitions.some((token) => token.id === "color.surface-raised" && token.cssVariable === "--sk-color-surface-raised"),
  primitiveClassName("Button", "brand", "md") === "sk-button sk-tone-brand sk-size-md",
  primitiveClassName("Card", "warning", "lg") === "sk-card sk-tone-warning sk-size-lg",
  primitiveClassName("Container", { width: "wide" }) === "sk-container sk-container-width-wide",
  primitiveClassName("Surface", { variant: "inset", padding: "md" }) === "sk-surface sk-surface-inset sk-surface-pad-md",
  textClassName("data") === "sk-text sk-text-data",
  primitiveSpecs.length === 28,
  primitiveClassName("SearchField", { size: "lg" }) === "sk-search-field sk-size-lg",
  primitiveClassName("CopyButton", { state: "copied", size: "sm" }) === "sk-copy-button sk-copy-button-copied sk-size-sm",
  primitiveClassName("TableShell", { density: "compact", header: "sticky" }) === "sk-table-shell sk-table-shell-compact sk-table-shell-header-sticky",
  motionAssistUtilities.length === 8,
  motionAssistClassName("focus-feedback") === "sk-motion-focus-feedback",
  formatIndianNumber(12345678) === "1,23,45,678",
  formatIndianNumber("1.234567890123456789") === "1.234567890123456789",
  formatIndianCurrency(1234567, { maximumFractionDigits: 0 }) === "₹12,34,567",
  formatIndianDate("2026-07-14") === "14-07-2026",
  formatPANDisplay("abcde1234f") === "ABCDE 1234 F",
  new Set(primitiveSpecs.map((primitive) => primitive.name)).size === primitiveSpecs.length,
  patternSpecs.some((pattern) => pattern.name === "EvidencePanel"),
  themePath.endsWith("/dist/theme.css"),
  require.resolve("@sanchika/primitives/styles.css").endsWith("/dist/styles.css"),
  themeCss.includes("--sk-color-bg-base: var(--sk-color-canvas);"),
  themeCss.includes("--sk-color-border-control: var(--sk-color-border-default);"),
  legacyCss.includes("var(--sk-color-bg-base)"),
  legacyCss.includes("var(--sk-radius-card)"),
];

if (checks.some((check) => !check)) {
  throw new Error("Sanchika local-link consumer probe failed");
}

  try {
    primitiveClassName("Grid", { columns: "12" });
  throw new Error("Unknown Sanchika primitive variant did not fail");
} catch (error) {
    if (!String(error).includes('Unsupported columns "12" for primitive Grid')) throw error;
  }

const inheritedRuntimeKeys = ["toString", "constructor", "__proto__", "prototype", "hasOwnProperty"];
const legacyNames = ["Button", "Card", "Badge", "Field"];
const appendedNames = ["Container", "Section", "Stack", "Cluster", "Grid", "Split", "Surface", "Divider", "VisuallyHidden", "Text", "Link", "LinkCard", "SearchField", "InlineStatus", "Skeleton", "EmptyState", "ErrorState", "Progress", "Stepper", "Disclosure", "CopyButton", "Breadcrumb", "Stat", "TableShell"];
const expectedButtonStandards = [{ id: "WAI-ARIA APG Button Pattern", sourceUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/button/", requirements: ["Prefer native <button> elements for command actions.", 'If a non-button element uses role="button", the consumer must provide Space and Enter activation.', "Toggle buttons use aria-pressed without changing the visible label.", "Consumers must define focus after activation according to the resulting workflow."] }];
if (primitiveSpecs.slice(0, legacyNames.length).map((primitive) => primitive.name).join(",") !== legacyNames.join(",")) {
  throw new Error("Sanchika local-link consumer lost the legacy primitiveSpecs prefix");
}
if (primitiveSpecs.slice(legacyNames.length).map((primitive) => primitive.name).join(",") !== appendedNames.join(",")) {
  throw new Error("Sanchika local-link consumer lost the exact appended S4/S5 primitive inventory");
}
if (!Object.hasOwn(primitiveSpecs[0], "standards") || !Object.keys(primitiveSpecs[0]).includes("standards") || JSON.stringify(primitiveSpecs[0].standards) !== JSON.stringify(expectedButtonStandards)) {
  throw new Error("Button lost its exact legacy standards value");
}
for (const name of legacyNames.slice(1)) {
  const primitive = primitiveSpecs.find((candidate) => candidate.name === name);
  if (!primitive || !Object.hasOwn(primitive, "standards") || !Object.keys(primitive).includes("standards") || primitive.standards.length !== 0) {
    throw new Error(name + " lost its enumerable standards: [] compatibility shape");
  }
}
for (const inheritedKey of inheritedRuntimeKeys) {
  expectInvalid("primitive " + inheritedKey, () => primitiveClassName(inheritedKey));
  expectInvalid("text role " + inheritedKey, () => textClassName(inheritedKey));
  for (const primitive of primitiveSpecs) {
    expectInvalid(primitive.name + " option " + inheritedKey, () => primitiveClassName(primitive.name, JSON.parse('{"' + inheritedKey + '":"fixture"}')));
    for (const variant of primitive.variants) {
      expectInvalid(primitive.name + "." + variant.name + " " + inheritedKey, () => primitiveClassName(primitive.name, { [variant.name]: inheritedKey }));
    }
  }
}
expectInvalid("inherited SearchField size", () => primitiveClassName("SearchField", Object.create({ size: "lg" })));

function expectInvalid(label, operation) {
  try {
    operation();
  } catch (error) {
    if (/Unknown primitive|Unsupported/.test(String(error))) return;
    throw error;
  }
  throw new Error(label + " was accepted");
}
`,
  );
  run(process.execPath, [probePath]);
  runConsumerTypecheck();
} finally {
  rmSync(consumerDir, { recursive: true, force: true });
}

console.log("Sanchika local-link consumer check passed.");

function runConsumerTypecheck() {
  mkdirSync(join(consumerDir, "type-tests"));
  copyFileSync(join(root, "type-tests/package-api.ts"), join(consumerDir, "type-tests/package-api.ts"));
  writeFileSync(
    join(consumerDir, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          noUncheckedIndexedAccess: true,
          exactOptionalPropertyTypes: true,
          verbatimModuleSyntax: true,
        },
        include: ["type-tests/package-api.ts"],
      },
      null,
      2,
    )}\n`,
  );
  run(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.json", "--noEmit"]);
}

function run(command, args) {
  try {
    execFileSync(command, args, {
      cwd: consumerDir,
      env: { ...process.env, npm_config_cache: join(tmpdir(), "sanchika-npm-cache") },
      stdio: "pipe",
    });
  } catch (error) {
    if (error.stdout) {
      process.stdout.write(error.stdout);
    }
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function assertLinkDependencies(packageLinks) {
  const consumerPackage = JSON.parse(readFileSync(join(consumerDir, "package.json"), "utf8"));

  for (const [packageName, packageDir] of Object.entries(packageLinks)) {
    const dependency = consumerPackage.dependencies?.[packageName];
    if (dependency !== `link:${packageDir}`) {
      throw new Error(`Expected ${packageName} to be linked from ${packageDir}, received ${String(dependency)}`);
    }
  }
}

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
import { primitiveClassName } from "@sanchika/primitives";
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
`,
  );
  run(process.execPath, [probePath]);
} finally {
  rmSync(consumerDir, { recursive: true, force: true });
}

console.log("Sanchika local-link consumer check passed.");

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

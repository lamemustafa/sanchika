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
    "@sanchika/gallery": join(root, "packages/gallery"),
  };

  run("pnpm", [
    "--dir",
    consumerDir,
    "add",
    "--offline",
    ...Object.entries(packageLinks).map(([packageName, packageDir]) => `${packageName}@link:${packageDir}`),
  ]);
  assertLinkDependencies(packageLinks);

  const probePath = join(consumerDir, "probe.mjs");
  writeFileSync(
    probePath,
    `import { createRequire } from "node:module";
import { colorTokens } from "@sanchika/tokens";
import { primitiveClassName } from "@sanchika/primitives";
import { patternSpecs } from "@sanchika/patterns";
import { primitiveGalleryCssImports, renderPrimitiveGalleryDocument } from "@sanchika/gallery";

const require = createRequire(import.meta.url);
const checks = [
  colorTokens.brandPrimary.cssVariable === "--sk-color-brand-primary",
  primitiveClassName("Button", "brand", "md") === "sk-button sk-tone-brand sk-size-md",
  patternSpecs.some((pattern) => pattern.name === "EvidencePanel"),
  primitiveGalleryCssImports[0] === "@sanchika/tokens/theme.css",
  renderPrimitiveGalleryDocument().includes('data-sanchika-gallery-document="primitive"'),
  require.resolve("@sanchika/tokens/theme.css").endsWith("/dist/theme.css"),
  require.resolve("@sanchika/primitives/styles.css").endsWith("/dist/styles.css"),
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

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";
import { validatePrimitiveRuntime } from "./validation/primitive-runtime.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm artifact:check" });
const packages = ["tokens", "primitives", "patterns"];
const dependencyFields = ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"];
const failures = [];
let primitiveRuntimeFixtures = null;

for (const packageName of packages) {
  const packageDir = join(root, "packages", packageName);
  const manifest = readJson(join(packageDir, "package.json"));
  const label = manifest.name ?? `packages/${packageName}`;

  requirePackageFile(packageDir, manifest.main, `${label} main`);
  requirePackageFile(packageDir, manifest.types, `${label} types`);

  const rootExport = manifest.exports?.["."];
  requirePackageFile(packageDir, rootExport?.default, `${label} root export default`);
  requirePackageFile(packageDir, rootExport?.types, `${label} root export types`);

  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    if (subpath === ".") continue;
    if (typeof target === "string") {
      requirePackageFile(packageDir, target, `${label} export ${subpath}`);
      continue;
    }

    failures.push(`${label} export ${subpath} must be a string target or root conditional export`);
  }

  const packedFiles = readPackedFiles(packageDir, label);
  const expectedFiles = expectedPackageFiles(manifest);
  if (JSON.stringify(packedFiles) !== JSON.stringify(expectedFiles)) {
    failures.push(`${label} pack files must be exactly ${expectedFiles.join(", ")}; found ${packedFiles.join(", ")}`);
  }

  for (const packedFile of packedFiles) {
    if (packedFile.startsWith("src/")) {
      failures.push(`${label} package must not include source path ${packedFile}`);
    }
    if (packedFile.endsWith(".map")) {
      failures.push(`${label} package must not include source map ${packedFile}`);
    }
  }

  if (manifest.private !== true) {
    validatePublishableManifest(manifest, packedFiles, label);
  }
}

try {
  const { primitiveClassName, primitiveGroups, primitiveSpecs, textClassName } = await import("../packages/primitives/dist/index.js");
  primitiveRuntimeFixtures = validatePrimitiveRuntime({ primitiveClassName, primitiveGroups, primitiveSpecs, textClassName });
  failures.push(...primitiveRuntimeFixtures.failures);
} catch (error) {
  failures.push(`primitive runtime fixtures could not load built package exports: ${String(error)}`);
}

if (failures.length > 0) {
  console.error("Sanchika package artifact check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sanchika package artifact check passed.");
if (primitiveRuntimeFixtures) console.log(`Sanchika primitive runtime fixtures passed (${primitiveRuntimeFixtures.count} cases).`);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function requirePackageFile(packageDir, relativePath, label) {
  if (!relativePath || typeof relativePath !== "string") {
    failures.push(`${label} must declare a file path`);
    return;
  }

  if (!relativePath.startsWith("./")) {
    failures.push(`${label} must use a package-relative ./ path`);
    return;
  }

  if (!existsSync(join(packageDir, relativePath))) {
    failures.push(`${label} target ${relativePath} does not exist`);
  }
}

function readPackedFiles(packageDir, label) {
  try {
    const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: packageDir,
      encoding: "utf8",
      env: { ...process.env, npm_config_cache: join(tmpdir(), "sanchika-npm-cache") },
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(output)[0].files.map((file) => file.path).sort();
  } catch (error) {
    failures.push(`${label} npm pack dry-run failed: ${error.message}`);
    return [];
  }
}

function expectedPackageFiles(manifest) {
  const files = new Set([
    "dist/index.d.ts",
    "dist/index.js",
    "LICENSE",
    "README.md",
    "package.json",
  ]);

  if (manifest.name === "@sanchika/primitives") {
    for (const path of [
      "dist/classes.d.ts",
      "dist/classes.js",
      "dist/contracts/actions.d.ts",
      "dist/contracts/actions.js",
      "dist/contracts/form-status.d.ts",
      "dist/contracts/form-status.js",
      "dist/contracts/layout-core.d.ts",
      "dist/contracts/layout-core.js",
      "dist/contracts/layout-planes.d.ts",
      "dist/contracts/layout-planes.js",
      "dist/contracts/types.d.ts",
      "dist/contracts/types.js",
      "dist/contracts/typography.d.ts",
      "dist/contracts/typography.js",
      "dist/registry.d.ts",
      "dist/registry.js",
    ]) files.add(path);
    files.add("dist/components.css");
    files.add("dist/foundation.css");
    files.add("dist/typography.css");
  }

  for (const target of Object.values(manifest.exports ?? {})) {
    if (typeof target === "string" && target.startsWith("./dist/")) {
      files.add(target.slice(2));
    }
  }

  if (manifest.name === "@sanchika/patterns") {
    files.add("dist/evidence-loop.d.ts");
    files.add("dist/evidence-loop.js");
  }

  if (manifest.name === "@sanchika/tokens") {
    files.add("dist/generated.d.ts");
    files.add("dist/generated.js");
  }

  return [...files].sort();
}

function validatePublishableManifest(manifest, packedFiles, label) {
  for (const dependencyField of dependencyFields) {
    for (const [dependencyName, version] of Object.entries(manifest[dependencyField] ?? {})) {
      if (typeof version === "string" && version.startsWith("workspace:")) {
        failures.push(`${label} publishable ${dependencyField} ${dependencyName} must not use ${version}`);
      }
    }
  }

}

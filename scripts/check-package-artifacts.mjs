import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";
import { validateIndianFormatting, validatePrimitiveRuntime } from "./validation/primitive-runtime.mjs";
import { validateProductPatternContracts } from "./validation/pattern-contracts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm artifact:check" });
const packages = ["tokens", "primitives", "patterns"];
const dependencyFields = ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"];
const failures = [];
let primitiveRuntimeFixtures = null;
let indianFormattingFixtures = null;
let productPatternRuntimeCount = 0;

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
  const primitives = await import("../packages/primitives/dist/index.js");
  const { primitiveClassName, primitiveGroups, primitiveSpecs, textClassName } = primitives;
  primitiveRuntimeFixtures = validatePrimitiveRuntime({ primitiveClassName, primitiveGroups, primitiveSpecs, textClassName });
  failures.push(...primitiveRuntimeFixtures.failures);
  indianFormattingFixtures = validateIndianFormatting(primitives);
  failures.push(...indianFormattingFixtures.failures);
  validateTimezoneProcesses();
} catch (error) {
  failures.push(`primitive runtime fixtures could not load built package exports: ${String(error)}`);
}

try {
  const patterns = await import("../packages/patterns/dist/index.js");
  const patternCss = ["styles.css", "visual-grammar.css", "public.css", "axal.css", "pack.css", "tools.css", "responsive.css"]
    .map((path) => readFileSync(join(root, "packages/patterns/dist", path), "utf8"))
    .join("\n");
  validateProductPatternContracts({
    contracts: patterns.productPatternContracts,
    groups: patterns.productPatternGroups,
    aliases: patterns.patternAliases,
    visualGrammar: patterns.productVisualGrammar,
    retainedLegacyPatternNames: patterns.retainedLegacyPatternNames,
    className: patterns.patternClassName,
    resolve: patterns.resolveProductPatternContract,
    css: patternCss,
    exemplarRoutes: new Set(["/patterns/", "/patterns/public/", "/patterns/axal/", "/patterns/pack/", "/patterns/tools/", "/lab/complyeaze-core/", "/lab/axal-review-desk/", "/lab/pack-local-proof/", "/lab/tools-directory/"]),
    fail: (message) => failures.push(`built pattern runtime ${message}`),
  });
  productPatternRuntimeCount = patterns.productPatternContracts.length;
} catch (error) {
  failures.push(`product pattern runtime fixtures could not load built package exports: ${String(error)}`);
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
if (indianFormattingFixtures) console.log(`Sanchika Indian formatting fixtures passed (${indianFormattingFixtures.count} cases; UTC and Asia/Kolkata process probe).`);
if (productPatternRuntimeCount) console.log(`Sanchika product pattern runtime fixtures passed (${productPatternRuntimeCount} contracts).`);

function validateTimezoneProcesses() {
  const moduleUrl = pathToFileURL(join(root, "packages/primitives/dist/index.js")).href;
  const probe = `import { formatIndianDate, formatIndianDateTime } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify({ date: formatIndianDate("2026-07-14"), instant: formatIndianDateTime("2026-07-13T20:00:00Z", { timeZone: "Asia/Kolkata" }), offsetInstant: formatIndianDateTime("2026-07-14T01:30:00+05:30", { timeZone: "UTC" }) }));`;
  const outputs = ["UTC", "Asia/Kolkata"].map((TZ) => execFileSync(process.execPath, ["--input-type=module", "--eval", probe], { encoding: "utf8", env: { ...process.env, TZ } }).trim());
  if (outputs[0] !== outputs[1]) failures.push("Indian date formatting must be stable across UTC and Asia/Kolkata process timezones when timezone policy is explicit");
}

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
      "dist/contracts/search-feedback.d.ts",
      "dist/contracts/search-feedback.js",
      "dist/contracts/states.d.ts",
      "dist/contracts/states.js",
      "dist/contracts/process.d.ts",
      "dist/contracts/process.js",
      "dist/contracts/navigation-data.d.ts",
      "dist/contracts/navigation-data.js",
      "dist/contracts/layout-core.d.ts",
      "dist/contracts/layout-core.js",
      "dist/contracts/layout-planes.d.ts",
      "dist/contracts/layout-planes.js",
      "dist/contracts/types.d.ts",
      "dist/contracts/types.js",
      "dist/contracts/typography.d.ts",
      "dist/contracts/typography.js",
      "dist/formatting/indian.d.ts",
      "dist/formatting/indian.js",
      "dist/registry.d.ts",
      "dist/registry.js",
    ]) files.add(path);
    files.add("dist/components.css");
    files.add("dist/foundation.css");
    files.add("dist/typography.css");
    files.add("dist/search-feedback.css");
    files.add("dist/motion-assist.d.ts");
    files.add("dist/motion-assist.js");
    files.add("dist/motion.css");
    files.add("dist/process-data.css");
  }

  for (const target of Object.values(manifest.exports ?? {})) {
    if (typeof target === "string" && target.startsWith("./dist/")) {
      files.add(target.slice(2));
    }
  }

  if (manifest.name === "@sanchika/patterns") {
    for (const path of [
      "dist/axal.css",
      "dist/contracts/axal-workspace.d.ts",
      "dist/contracts/axal-workspace.js",
      "dist/contracts/pack-local-utility.d.ts",
      "dist/contracts/pack-local-utility.js",
      "dist/contracts/public-product.d.ts",
      "dist/contracts/public-product.js",
      "dist/contracts/tools-local-artifact.d.ts",
      "dist/contracts/tools-local-artifact.js",
      "dist/evidence-loop.d.ts",
      "dist/evidence-loop.js",
      "dist/pack.css",
      "dist/product-pattern-definition.d.ts",
      "dist/product-pattern-definition.js",
      "dist/product-pattern-registry.d.ts",
      "dist/product-pattern-registry.js",
      "dist/product-pattern-types.d.ts",
      "dist/product-pattern-types.js",
      "dist/public.css",
      "dist/responsive.css",
      "dist/tools.css",
      "dist/visual-grammar.css",
      "dist/visual-grammar.d.ts",
      "dist/visual-grammar.js",
    ]) files.add(path);
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

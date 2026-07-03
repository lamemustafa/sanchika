import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const packages = ["tokens", "primitives", "patterns", "gallery"];
const failures = [];

const rootPackage = readJson("package.json");
if (rootPackage.private !== true) {
  failures.push("root package must remain private for workspace-only orchestration");
}

if (!existsSync(join(root, ".github/workflows/publish.yml"))) {
  failures.push("publish workflow .github/workflows/publish.yml must exist before package publishing");
}

for (const packageName of packages) {
  const packagePath = `packages/${packageName}`;
  const manifest = readJson(`${packagePath}/package.json`);
  const label = manifest.name ?? packagePath;

  if (manifest.private === true) {
    failures.push(`${label} must remove private: true before publish`);
  }

  if (manifest.version === "0.0.0") {
    failures.push(`${label} must set a real semver version before publish`);
  }

  if (manifest.publishConfig?.registry !== "https://registry.npmjs.org/") {
    failures.push(`${label} must declare publishConfig.registry for npm`);
  }

  if (manifest.publishConfig?.access !== "public") {
    failures.push(`${label} must declare publishConfig.access public after scope ownership is confirmed`);
  }

  if (JSON.stringify(manifest.files) !== JSON.stringify(["dist"])) {
    failures.push(`${label} must publish only dist files`);
  }

  for (const [dependencyName, version] of Object.entries(manifest.dependencies ?? {})) {
    if (typeof version === "string" && version.startsWith("workspace:")) {
      failures.push(`${label} dependency ${dependencyName} must not use ${version}`);
    }
  }

  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    if (subpath === ".") continue;
    if (typeof target !== "string" || !target.startsWith("./dist/")) {
      failures.push(`${label} export ${subpath} must point at dist before publish`);
    }
  }

  for (const requiredFile of ["README.md", "LICENSE", "dist/index.js", "dist/index.d.ts"]) {
    if (!existsSync(join(root, packagePath, requiredFile))) {
      failures.push(`${label} is missing ${requiredFile}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Sanchika publish readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sanchika publish readiness check passed.");

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

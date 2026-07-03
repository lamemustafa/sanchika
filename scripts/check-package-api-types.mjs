import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const consumerDir = mkdtempSync(join(tmpdir(), "sanchika-api-types-"));
const packageLinks = {
  "@sanchika/tokens": join(root, "packages/tokens"),
  "@sanchika/primitives": join(root, "packages/primitives"),
  "@sanchika/patterns": join(root, "packages/patterns"),
  "@sanchika/gallery": join(root, "packages/gallery"),
};

try {
  writeFileSync(join(consumerDir, "package.json"), `${JSON.stringify({ type: "module", dependencies: {} }, null, 2)}\n`);
  run("pnpm", [
    "--dir",
    consumerDir,
    "add",
    "--offline",
    ...Object.entries(packageLinks).map(([packageName, packageDir]) => `${packageName}@link:${packageDir}`),
  ]);
  assertLinkDependencies(packageLinks);

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
} finally {
  rmSync(consumerDir, { recursive: true, force: true });
}

console.log("Sanchika package API typecheck passed.");

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

function assertLinkDependencies(expectedLinks) {
  const consumerPackage = JSON.parse(readFileSync(join(consumerDir, "package.json"), "utf8"));

  for (const [packageName, packageDir] of Object.entries(expectedLinks)) {
    const dependency = consumerPackage.dependencies?.[packageName];
    if (dependency !== `link:${packageDir}`) {
      throw new Error(`Expected ${packageName} to be linked from ${packageDir}, received ${String(dependency)}`);
    }
  }
}

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";
import { assertPackedFileList } from "./validation/tarball-contents.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
const strictPublishManifests = args.has("--strict-publish-manifests");
const packages = ["tokens", "primitives", "patterns", "gallery"];
const packageNames = new Set(packages.map((packageName) => `@sanchika/${packageName}`));
const simulatedVersion = "0.0.1-tarball-check.0";
assertBuiltPackageArtifacts({ root, commandName: "pnpm publish:tarball-check", packageNames: packages });
const tempRoot = mkdtempSync(join(tmpdir(), "sanchika-tarball-consumer-"));
const packageRoot = join(tempRoot, "packages");
const tarballRoot = join(tempRoot, "tarballs");
const consumerRoot = join(tempRoot, "consumer");

try {
  mkdirSync(packageRoot);
  mkdirSync(tarballRoot);
  mkdirSync(consumerRoot);

  for (const packageName of packages) {
    preparePackageCopy(packageName);
  }

  const tarballs = packages.map((packageName) => packPackage(packageName));
  printTarballEvidence(tarballs);
  writeConsumerPackage();
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", ...tarballs.map((tarball) => tarball.path)], consumerRoot);
  runConsumerProbe();
  runConsumerTypecheck();
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

console.log("Sanchika packed-tarball consumer check passed.");

function preparePackageCopy(packageName) {
  const sourceDir = join(root, "packages", packageName);
  const targetDir = join(packageRoot, packageName);

  for (const requiredFile of ["dist/index.js", "dist/index.d.ts", "README.md", "LICENSE", "package.json"]) {
    if (!existsSync(join(sourceDir, requiredFile))) {
      throw new Error(`@sanchika/${packageName} is missing ${requiredFile}; run pnpm build before tarball checks`);
    }
  }

  cpSync(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => !source.includes(`${packageName}/node_modules`),
  });

  const manifestPath = join(targetDir, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!strictPublishManifests) {
    manifest.private = false;
    manifest.version = simulatedVersion;
    manifest.publishConfig = {
      registry: "https://registry.npmjs.org/",
      access: "public",
    };
    rewriteInternalDependencySections(manifest);
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function rewriteInternalDependencySections(manifest) {
  for (const dependencyField of ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"]) {
    if (!manifest[dependencyField]) continue;
    manifest[dependencyField] = Object.fromEntries(
      Object.entries(manifest[dependencyField]).map(([dependencyName, version]) => [
        dependencyName,
        packageNames.has(dependencyName) && version === "workspace:*" ? simulatedVersion : version,
      ]),
    );
  }
}

function packPackage(packageName) {
  const output = run("npm", ["pack", "--json", "--pack-destination", tarballRoot], join(packageRoot, packageName));
  const packed = JSON.parse(output)[0];
  assertPackedFileList({ packageName, packed });
  if (strictPublishManifests) assertPackedManifestMatchesSource({ packageName, packed });
  const tarballPath = join(tarballRoot, basename(packed.filename));
  if (!existsSync(tarballPath)) {
    throw new Error(`@sanchika/${packageName} tarball was not created at ${tarballPath}`);
  }
  return {
    packageName: `@sanchika/${packageName}`,
    version: simulatedVersion,
    filename: basename(tarballPath),
    path: tarballPath,
    sha256: sha256File(tarballPath),
  };
}

function assertPackedManifestMatchesSource({ packageName, packed }) {
  const sourceManifest = JSON.parse(readFileSync(join(root, "packages", packageName, "package.json"), "utf8"));
  const packedManifest = packed.files.find((file) => file.path === "package.json");
  if (!packedManifest) {
    throw new Error(`@sanchika/${packageName} strict publish manifest check could not find package.json in npm pack output`);
  }

  const packageCopyManifest = JSON.parse(readFileSync(join(packageRoot, packageName, "package.json"), "utf8"));
  if (JSON.stringify(packageCopyManifest) !== JSON.stringify(sourceManifest)) {
    throw new Error(`@sanchika/${packageName} strict publish manifest check must pack the unmodified source manifest`);
  }
}

function printTarballEvidence(tarballs) {
  console.log("Tarball evidence:");
  for (const tarball of tarballs) {
    console.log(`${tarball.packageName}@${tarball.version} ${tarball.filename} sha256=${tarball.sha256}`);
  }
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function writeConsumerPackage() {
  writeFileSync(
    join(consumerRoot, "package.json"),
    `${JSON.stringify(
      {
        type: "module",
        dependencies: {},
      },
      null,
      2,
    )}\n`,
  );
}

function runConsumerProbe() {
  const probePath = join(consumerRoot, "probe.mjs");
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
  renderPrimitiveGalleryDocument().includes('data-sk-pattern="TrustBoundary" data-sk-state="permission-required"'),
  require.resolve("@sanchika/tokens/theme.css").endsWith("/dist/theme.css"),
  require.resolve("@sanchika/primitives/styles.css").endsWith("/dist/styles.css"),
];

if (checks.some((check) => !check)) {
  throw new Error("Sanchika packed-tarball consumer probe failed");
}
`,
  );
  run(process.execPath, [probePath], consumerRoot);
}

function runConsumerTypecheck() {
  mkdirSync(join(consumerRoot, "type-tests"));
  copyFileSync(join(root, "type-tests/package-api.ts"), join(consumerRoot, "type-tests/package-api.ts"));
  writeFileSync(
    join(consumerRoot, "tsconfig.json"),
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
  run(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.json", "--noEmit"], consumerRoot);
}

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      env: { ...process.env, npm_config_cache: join(tmpdir(), "sanchika-npm-cache") },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (error.stdout) process.stdout.write(error.stdout);
    if (error.stderr) process.stderr.write(error.stderr);
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";
import {
  createReleaseArtifactManifest,
  loadReleaseManifest,
  resolveReleaseVersion,
  sha256File,
} from "./validation/release-manifest.mjs";
import { assertPackedFileList } from "./validation/tarball-contents.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
if (args.has("--release-manifest")) {
  throw new Error("--release-manifest is not supported; stable releases always use root release.json");
}
const strictPublishManifests = args.has("--strict-publish-manifests");
const stableRelease = args.has("--stable-release");
const emitDir = valueAfter("--emit-dir");
const versionOverride = valueAfter("--version");
const releaseManifest = stableRelease ? loadReleaseManifest(join(root, "release.json")) : null;
const artifactVersion = releaseManifest
  ? resolveReleaseVersion({ manifest: releaseManifest, override: versionOverride })
  : versionOverride ?? "0.0.0-tarball-check.0";
assertValidSimulatedVersion(artifactVersion);
const packages = releaseManifest
  ? releaseManifest.packages.map((packageName) => packageName.replace("@sanchika/", ""))
  : ["tokens", "primitives", "patterns"];
const packageNames = new Set(packages.map((packageName) => `@sanchika/${packageName}`));
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
  if (emitDir) writeReleaseArtifacts(tarballs);
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
    manifest.version = artifactVersion;
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
        packageNames.has(dependencyName) && version === "workspace:*" ? artifactVersion : version,
      ]),
    );
  }
}

function packPackage(packageName) {
  const output = run("npm", ["pack", "--json", "--pack-destination", tarballRoot], join(packageRoot, packageName));
  const packed = JSON.parse(output)[0];
  assertPackedFileList({ packageName, packed });
  const tarballPath = join(tarballRoot, basename(packed.filename));
  if (!existsSync(tarballPath)) {
    throw new Error(`@sanchika/${packageName} tarball was not created at ${tarballPath}`);
  }
  if (!strictPublishManifests) assertPackedArtifactVersion({ packageName, packed, tarballPath });
  if (strictPublishManifests) assertPackedManifestMatchesSource({ packageName, packed, tarballPath });
  return {
    packageName: `@sanchika/${packageName}`,
    version: artifactVersion,
    filename: basename(tarballPath),
    path: tarballPath,
    sha256: sha256File(tarballPath),
  };
}

function assertPackedArtifactVersion({ packageName, packed, tarballPath }) {
  if (packed.version !== artifactVersion) {
    throw new Error(`@sanchika/${packageName} npm pack metadata version ${packed.version} must equal ${artifactVersion}`);
  }
  const packedTarManifest = JSON.parse(run("tar", ["-xOf", tarballPath, "package/package.json"], tarballRoot));
  if (packedTarManifest.version !== artifactVersion) {
    throw new Error(`@sanchika/${packageName} packed package.json version must equal ${artifactVersion}`);
  }
  if (!basename(tarballPath).endsWith(`-${artifactVersion}.tgz`)) {
    throw new Error(`@sanchika/${packageName} tarball filename must include version ${artifactVersion}`);
  }
  for (const dependencyField of ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"]) {
    for (const [dependencyName, version] of Object.entries(packedTarManifest[dependencyField] ?? {})) {
      if (packageNames.has(dependencyName) && version !== artifactVersion) {
        throw new Error(`@sanchika/${packageName} packed ${dependencyField} ${dependencyName} must use ${artifactVersion}`);
      }
    }
  }
}

function assertPackedManifestMatchesSource({ packageName, packed, tarballPath }) {
  const sourceManifest = JSON.parse(readFileSync(join(root, "packages", packageName, "package.json"), "utf8"));
  const packedManifest = packed.files.find((file) => file.path === "package.json");
  if (!packedManifest) {
    throw new Error(`@sanchika/${packageName} strict publish manifest check could not find package.json in npm pack output`);
  }

  const packageCopyManifest = JSON.parse(readFileSync(join(packageRoot, packageName, "package.json"), "utf8"));
  if (JSON.stringify(packageCopyManifest) !== JSON.stringify(sourceManifest)) {
    throw new Error(`@sanchika/${packageName} strict publish manifest check must pack the unmodified source manifest`);
  }

  const packedTarManifest = JSON.parse(run("tar", ["-xOf", tarballPath, "package/package.json"], tarballRoot));
  if (JSON.stringify(packedTarManifest) !== JSON.stringify(sourceManifest)) {
    throw new Error(`@sanchika/${packageName} strict publish manifest check must match package/package.json inside the tarball`);
  }
}

function printTarballEvidence(tarballs) {
  console.log("Tarball evidence:");
  for (const tarball of tarballs) {
    console.log(`${tarball.packageName}@${tarball.version} ${tarball.filename} sha256=${tarball.sha256}`);
  }
}

function writeReleaseArtifacts(tarballs) {
  assertCleanGitTree();
  const releaseRoot = releaseRootFrom(emitDir);
  const stagingRoot = `${releaseRoot}.tmp-${process.pid}`;
  const stagingTarballRoot = join(stagingRoot, "tarballs");
  rmSync(stagingRoot, { recursive: true, force: true });

  try {
    mkdirSync(stagingTarballRoot, { recursive: true });
    const emittedTarballs = tarballs.map((tarball) => {
      const targetPath = join(stagingTarballRoot, tarball.filename);
      copyFileSync(tarball.path, targetPath);
      return { ...tarball, path: targetPath, sha256: sha256File(targetPath) };
    });
    const manifest = createReleaseArtifactManifest({
      version: artifactVersion,
      channel: releaseManifest?.channel ?? "prerelease-check",
      source: {
        repository: "https://github.com/lamemustafa/sanchika",
        commit: gitCommit(),
      },
      generatedAt: new Date().toISOString(),
      tarballs: emittedTarballs,
    });

    writeFileSync(join(stagingRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    rmSync(releaseRoot, { recursive: true, force: true });
    renameSync(stagingRoot, releaseRoot);
  } catch (error) {
    rmSync(stagingRoot, { recursive: true, force: true });
    throw error;
  }
  console.log(`Release artifact bundle written to ${emitDir}`);
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
  writeFileSync(
    join(consumerRoot, "legacy-token.css"),
    '@import "@sanchika/tokens/theme.css";\n.legacy-surface { background: var(--sk-color-bg-base); color: var(--sk-color-ink-primary); border: 1px solid var(--sk-color-border-control); border-radius: var(--sk-radius-card); }\n',
  );
}

function runConsumerProbe() {
  const probePath = join(consumerRoot, "probe.mjs");
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
  throw new Error("Sanchika packed-tarball consumer probe failed");
}
`,
  );
  run(process.execPath, [probePath], consumerRoot);
}

function runConsumerTypecheck() {
  mkdirSync(join(consumerRoot, "type-tests"));
  const typeTestPath = join(consumerRoot, "type-tests/package-api.ts");
  writeFileSync(
    typeTestPath,
    `import { colorTokens, getTokenDefinition } from "@sanchika/tokens";
import { primitiveClassName } from "@sanchika/primitives";
import { patternSpecs } from "@sanchika/patterns";

const token: "--sk-color-brand-primary" = colorTokens.brandPrimary.cssVariable;
const newToken = getTokenDefinition("color.surface-raised");
const className: string = primitiveClassName("Button", "brand", "md");
const patternName: string | undefined = patternSpecs[0]?.name;
void token;
void newToken;
void className;
void patternName;
`,
  );
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

function valueAfter(flag) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function assertValidSimulatedVersion(version) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error("--version must be a semantic version; prerelease identifiers are allowed for low-level checks");
  }
}

function releaseRootFrom(value) {
  const normalized = normalize(value);
  if (isAbsolute(normalized) || normalized === "." || normalized === ".." || normalized.startsWith(`..${"/"}`)) {
    throw new Error("--emit-dir must be a relative path inside this repository");
  }
  if (!normalized.startsWith(`dist${"/"}`)) {
    throw new Error("--emit-dir must write under dist/");
  }
  return join(root, normalized);
}

function gitCommit() {
  return run("git", ["rev-parse", "HEAD"], root).trim();
}

function assertCleanGitTree() {
  const status = run("git", ["status", "--porcelain"], root).trim();
  if (status) {
    throw new Error("Refusing to emit release artifacts from a dirty working tree");
  }
}

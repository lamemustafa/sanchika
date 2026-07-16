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
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";
import {
  createReleaseArtifactManifest,
  createReleaseChecksumSummary,
  loadReleaseManifest,
  resolveReleaseVersion,
  sha256File,
} from "./validation/release-manifest.mjs";
import { assertPackedFileList } from "./validation/tarball-contents.mjs";
import { loadStableReleaseScreenshots } from "./validation/release-screenshots.mjs";
import { assertStableReleaseRuntime, resolveBundledNpmCli } from "./validation/release-runtime.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
if (args.has("--release-manifest")) {
  throw new Error("--release-manifest is not supported; stable releases always use root release.json");
}
const strictPublishManifests = args.has("--strict-publish-manifests");
const stableRelease = args.has("--stable-release");
if (stableRelease) {
  assertStableReleaseRuntime();
  if (process.env.SANCHIKA_RELEASE_PROMOTED !== "true") {
    throw new Error("stable release packing requires SANCHIKA_RELEASE_PROMOTED=true; use pnpm release:stable-tarballs");
  }
}
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
const pnpmConsumerRoot = join(tempRoot, "pnpm-consumer");

try {
  mkdirSync(packageRoot);
  mkdirSync(tarballRoot);
  mkdirSync(consumerRoot);
  mkdirSync(pnpmConsumerRoot);

  for (const packageName of packages) {
    preparePackageCopy(packageName);
  }

  const tarballs = packages.map((packageName) => packPackage(packageName));
  printTarballEvidence(tarballs);
  writeConsumerPackage(consumerRoot);
  runNpm(["install", "--ignore-scripts", "--no-audit", "--no-fund", ...tarballs.map((tarball) => tarball.path)], consumerRoot);
  runConsumerProbe(consumerRoot);
  runConsumerTypecheck(consumerRoot);
  console.log("npm packed-tarball consumer install, runtime probe, and typecheck passed.");
  if (!strictPublishManifests) {
    writePnpmConsumerPackage(tarballs);
    run(
      "pnpm",
      [
        "install",
        "--offline",
        "--ignore-scripts",
        "--no-frozen-lockfile",
        "--store-dir",
        join(tempRoot, "pnpm-store"),
        "--cache-dir",
        join(tempRoot, "pnpm-cache"),
      ],
      pnpmConsumerRoot,
    );
    runConsumerProbe(pnpmConsumerRoot);
    runConsumerTypecheck(pnpmConsumerRoot);
    console.log("pnpm offline packed-tarball consumer install, overrides, runtime probe, and typecheck passed.");
  }
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
  const output = runNpm(["pack", "--json", "--pack-destination", tarballRoot], join(packageRoot, packageName));
  const packed = JSON.parse(output)[0];
  const files = assertPackedFileList({ packageName, packed });
  const tarballPath = join(tarballRoot, basename(packed.filename));
  if (!existsSync(tarballPath)) {
    throw new Error(`@sanchika/${packageName} tarball was not created at ${tarballPath}`);
  }
  const internalDependencies = !strictPublishManifests
    ? assertPackedArtifactVersion({ packageName, packed, tarballPath })
    : [];
  if (strictPublishManifests) assertPackedManifestMatchesSource({ packageName, packed, tarballPath });
  return {
    packageName: `@sanchika/${packageName}`,
    version: artifactVersion,
    filename: basename(tarballPath),
    path: tarballPath,
    sha256: sha256File(tarballPath),
    files,
    internalDependencies,
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
  const internalDependencies = [];
  for (const dependencyField of ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"]) {
    for (const [dependencyName, version] of Object.entries(packedTarManifest[dependencyField] ?? {})) {
      if (packageNames.has(dependencyName) && version !== artifactVersion) {
        throw new Error(`@sanchika/${packageName} packed ${dependencyField} ${dependencyName} must use ${artifactVersion}`);
      }
      if (packageNames.has(dependencyName)) {
        internalDependencies.push({ field: dependencyField, name: dependencyName, version });
      }
    }
  }
  return internalDependencies.sort((left, right) => `${left.field}:${left.name}`.localeCompare(`${right.field}:${right.name}`));
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
    const dependencies = tarball.internalDependencies.length
      ? tarball.internalDependencies.map((dependency) => `${dependency.name}@${dependency.version}`).join(",")
      : "none";
    console.log(`${tarball.packageName}@${tarball.version} ${tarball.filename} sha256=${tarball.sha256} files=${tarball.files.length} internal=${dependencies}`);
  }
}

function writeReleaseArtifacts(tarballs) {
  assertCleanGitTree();
  const screenshots = stableRelease ? loadStableReleaseScreenshots({ root }) : [];
  const releaseRoot = releaseRootFrom(emitDir);
  const stagingRoot = `${releaseRoot}.tmp-${process.pid}`;
  rmSync(stagingRoot, { recursive: true, force: true });

  try {
    mkdirSync(stagingRoot, { recursive: true });
    const emittedTarballs = tarballs.map((tarball) => {
      const targetPath = join(stagingRoot, tarball.filename);
      copyFileSync(tarball.path, targetPath);
      return { ...tarball, path: targetPath, sha256: sha256File(targetPath) };
    });
    const emittedScreenshots = screenshots.map((screenshot) => {
      const targetPath = join(stagingRoot, screenshot.file);
      copyFileSync(screenshot.path, targetPath);
      return {
        ...screenshot,
        path: targetPath,
        size: statSync(targetPath).size,
        sha256: sha256File(targetPath),
      };
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
      screenshots: emittedScreenshots,
    });

    writeFileSync(join(stagingRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(join(stagingRoot, "SHA256SUMS"), createReleaseChecksumSummary(manifest));
    rmSync(releaseRoot, { recursive: true, force: true });
    renameSync(stagingRoot, releaseRoot);
  } catch (error) {
    rmSync(stagingRoot, { recursive: true, force: true });
    throw error;
  }
  console.log(`Release artifact bundle written to ${emitDir}`);
}

function writeConsumerPackage(targetRoot, manifest = { type: "module", dependencies: {} }) {
  writeFileSync(
    join(targetRoot, "package.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  writeFileSync(
    join(targetRoot, "legacy-token.css"),
    '@import "@sanchika/tokens/theme.css";\n.legacy-surface { background: var(--sk-color-bg-base); color: var(--sk-color-ink-primary); border: 1px solid var(--sk-color-border-control); border-radius: var(--sk-radius-card); }\n',
  );
}

function writePnpmConsumerPackage(tarballs) {
  const tarballsByPackage = new Map(tarballs.map((tarball) => [tarball.packageName, tarball]));
  const dependencies = Object.fromEntries(
    tarballs.map((tarball) => [tarball.packageName, `file:${tarball.path}`]),
  );
  const overridePackageNames = new Set(
    tarballs.flatMap((tarball) => tarball.internalDependencies.map((dependency) => dependency.name)),
  );
  const overrides = Object.fromEntries(
    tarballs
      .filter((tarball) => overridePackageNames.has(tarball.packageName))
      .map((tarball) => [`${tarball.packageName}@${artifactVersion}`, `file:${tarball.path}`]),
  );
  for (const packageName of overridePackageNames) {
    if (!tarballsByPackage.has(packageName)) {
      throw new Error(`pnpm packed consumer is missing override tarball ${packageName}`);
    }
  }
  writeConsumerPackage(pnpmConsumerRoot, {
    type: "module",
    dependencies,
  });
  writePnpmConsumerWorkspace(overrides);
}

function writePnpmConsumerWorkspace(overrides) {
  const lines = [
    "packages:",
    '  - "."',
    "overrides:",
    ...Object.entries(overrides).map(([selector, target]) =>
      `  ${JSON.stringify(selector)}: ${JSON.stringify(target)}`),
  ];
  writeFileSync(join(pnpmConsumerRoot, "pnpm-workspace.yaml"), `${lines.join("\n")}\n`);
}

function runConsumerProbe(targetRoot) {
  const probePath = join(targetRoot, "probe.mjs");
  writeFileSync(
    probePath,
    `import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { colorTokens, tokenDefinitions } from "@sanchika/tokens";
import { formatGSTINDisplay, formatIndianDateTime, formatIndianNumber, formatPercentage, motionAssistClassName, motionAssistUtilities, primitiveClassName, primitiveSpecs, textClassName } from "@sanchika/primitives";
import { patternAliases, patternClassName, patternSpecs, productPatternContracts, productPatternGroups, productVisualGrammar, resolveProductPatternContract, retainedLegacyPatternNames } from "@sanchika/patterns";

const require = createRequire(import.meta.url);
const themePath = require.resolve("@sanchika/tokens/theme.css");
const themeCss = readFileSync(themePath, "utf8");
const patternCssPath = require.resolve("@sanchika/patterns/styles.css");
const patternCss = readFileSync(patternCssPath, "utf8");
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
  motionAssistUtilities.length === 8,
  motionAssistClassName("skeleton-loading") === "sk-motion-skeleton-loading",
  formatIndianNumber("1.234567890123456789") === "1.234567890123456789",
  formatIndianNumber(10000000, { display: "compact" }) === "1 crore",
  formatPercentage(18, { input: "percent" }) === "18%",
  formatGSTINDisplay("27abcde1234f1z5") === "27 ABCDE 1234 F 1 Z 5",
  formatIndianDateTime("2026-07-14T00:00:00Z", { timeZone: "Asia/Kolkata" }).includes("14 Jul 2026"),
  new Set(primitiveSpecs.map((primitive) => primitive.name)).size === primitiveSpecs.length,
  patternSpecs.some((pattern) => pattern.name === "EvidencePanel"),
  productPatternContracts.length === 20,
  productPatternGroups.length === 4,
  JSON.stringify(Object.keys(patternAliases)) === JSON.stringify(["ProductFamilyRouter"]),
  patternAliases.ProductFamilyRouter === resolveProductPatternContract("ProductRouteMap"),
  resolveProductPatternContract("ProductFamilyRouter") === resolveProductPatternContract("ProductRouteMap"),
  JSON.stringify(retainedLegacyPatternNames) === JSON.stringify(["ProductFamilyRouter", "ServiceSection"]),
  Object.keys(productVisualGrammar).join(",") === "ledgerRail,fileTabLabel,provenanceStrip,evidenceAperture,custodyLine,quietVerifiedSeal",
  patternClassName("ProductFamilyRouter", { variant: "family", state: "default" }) === "sk-pattern-product-route-map sk-pattern-product-route-map--family sk-pattern-product-route-map--state-default",
  themePath.endsWith("/dist/theme.css"),
  require.resolve("@sanchika/primitives/styles.css").endsWith("/dist/styles.css"),
  patternCssPath.endsWith("/dist/styles.css"),
  patternCss.includes('@import "./visual-grammar.css";'),
  patternCss.includes('@import "./public.css";'),
  themeCss.includes("--sk-color-bg-base: var(--sk-color-canvas);"),
  themeCss.includes("--sk-color-border-control: var(--sk-color-border-default);"),
  legacyCss.includes("var(--sk-color-bg-base)"),
  legacyCss.includes("var(--sk-radius-card)"),
];

if (checks.some((check) => !check)) {
  throw new Error("Sanchika packed-tarball consumer probe failed");
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
const expectedLegacyPatternNames = ["EvidencePanel", "TrustBoundary", "ProductFamilyRouter", "ServiceSection"];
const expectedLegacyPatternKeys = ["name", "consumerModes", "purpose", "requiredSlots", "requiredStates", "semanticObligations", "nonGoals"];
if (patternSpecs.map((pattern) => pattern.name).join(",") !== expectedLegacyPatternNames.join(",")) {
  throw new Error("Sanchika packed consumer lost the exact legacy patternSpecs order");
}
if (patternSpecs.some((pattern) => Object.keys(pattern).join(",") !== expectedLegacyPatternKeys.join(","))) {
  throw new Error("Sanchika packed consumer changed the legacy patternSpecs enumerable shape");
}
if (primitiveSpecs.slice(0, legacyNames.length).map((primitive) => primitive.name).join(",") !== legacyNames.join(",")) {
  throw new Error("Sanchika packed consumer lost the legacy primitiveSpecs prefix");
}
if (primitiveSpecs.slice(legacyNames.length).map((primitive) => primitive.name).join(",") !== appendedNames.join(",")) {
  throw new Error("Sanchika packed consumer lost the exact appended S4/S5 primitive inventory");
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
for (const inheritedKey of inheritedRuntimeKeys) {
  expectInvalid("product pattern " + inheritedKey, () => patternClassName(inheritedKey));
  if (resolveProductPatternContract(inheritedKey) !== undefined) throw new Error("Sanchika packed consumer resolved inherited product pattern " + inheritedKey);
}
expectInvalid("inherited PublicHero variant", () => patternClassName("PublicHero", Object.create({ variant: "editorial" })));
expectInvalid("unknown PublicHero variant", () => patternClassName("PublicHero", { variant: "three-pane" }));

function expectInvalid(label, operation) {
  try {
    operation();
  } catch (error) {
    if (/Unknown .+|Unsupported/.test(String(error))) return;
    throw error;
  }
  throw new Error(label + " was accepted");
}
`,
  );
  run(process.execPath, [probePath], targetRoot);
}

function runConsumerTypecheck(targetRoot) {
  mkdirSync(join(targetRoot, "type-tests"));
  copyFileSync(join(root, "type-tests/package-api.ts"), join(targetRoot, "type-tests/package-api.ts"));
  writeFileSync(
    join(targetRoot, "tsconfig.json"),
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
  run(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.json", "--noEmit"], targetRoot);
}

function runNpm(args, cwd) {
  return stableRelease
    ? run(process.execPath, [resolveBundledNpmCli(), ...args], cwd)
    : run("npm", args, cwd);
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

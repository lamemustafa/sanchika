import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const metadataSchemaVersion = 1;
const metadataDirectory = ".sanchika-build";

const requiredArtifactsByPackage = new Map([
  ["tokens", ["dist/index.js", "dist/index.d.ts", "dist/generated.js", "dist/generated.d.ts", "dist/theme.css"]],
  ["primitives", ["dist/index.js", "dist/index.d.ts", "dist/styles.css"]],
  ["patterns", ["dist/index.js", "dist/index.d.ts", "dist/evidence-loop.js", "dist/evidence-loop.d.ts"]],
]);

export function writePackageBuildMetadata({ root, packageName }) {
  requireKnownPackage(packageName);
  assertRequiredPackageArtifacts({ root, packageNames: [packageName], commandName: `@sanchika/${packageName} build` });

  const packageDir = join(root, "packages", packageName);
  const metadata = {
    schemaVersion: metadataSchemaVersion,
    kind: "package",
    packageName,
    sourceFingerprint: fingerprintTree(packageDir, { excludedDirectories: new Set(["dist", "node_modules"]) }),
    artifactFingerprint: fingerprintTree(join(packageDir, "dist")),
  };
  writeMetadata(packageMetadataPath(root, packageName), metadata);
  return metadata;
}

export function assertBuiltPackageArtifacts({ root, commandName, packageNames = [...requiredArtifactsByPackage.keys()] }) {
  assertRequiredPackageArtifacts({ root, commandName, packageNames });
  const metadataByPackage = new Map();

  for (const packageName of packageNames) {
    requireKnownPackage(packageName);
    const packageDir = join(root, "packages", packageName);
    const metadataPath = packageMetadataPath(root, packageName);
    const metadata = readMetadata(metadataPath, `@sanchika/${packageName}`);
    validatePackageMetadataShape(metadata, packageName, metadataPath);

    const sourceFingerprint = fingerprintTree(packageDir, { excludedDirectories: new Set(["dist", "node_modules"]) });
    if (metadata.sourceFingerprint !== sourceFingerprint) {
      throw staleBuildError({
        subject: `@sanchika/${packageName} source`,
        commandName,
        rebuildCommand: "pnpm build",
      });
    }

    const artifactFingerprint = fingerprintTree(join(packageDir, "dist"));
    if (metadata.artifactFingerprint !== artifactFingerprint) {
      throw staleBuildError({
        subject: `@sanchika/${packageName} output`,
        commandName,
        rebuildCommand: "pnpm build",
      });
    }
    metadataByPackage.set(packageName, metadata);
  }

  return metadataByPackage;
}

export function writeGalleryBuildMetadata({ root }) {
  const packageMetadata = assertBuiltPackageArtifacts({ root, commandName: "gallery build metadata" });
  const galleryDir = join(root, "apps", "gallery");
  const indexPath = join(galleryDir, "dist", "index.html");
  if (!existsSync(indexPath)) {
    throw new Error("apps/gallery/dist/index.html is missing before gallery build metadata; run pnpm gallery:build");
  }

  const metadata = {
    schemaVersion: metadataSchemaVersion,
    kind: "gallery",
    sourceFingerprint: fingerprintTree(galleryDir, {
      excludedDirectories: new Set([".astro", "dist", "node_modules"]),
    }),
    artifactFingerprint: fingerprintTree(join(galleryDir, "dist")),
    packages: Object.fromEntries(
      [...packageMetadata].map(([packageName, packageRecord]) => [
        packageName,
        {
          sourceFingerprint: packageRecord.sourceFingerprint,
          artifactFingerprint: packageRecord.artifactFingerprint,
        },
      ]),
    ),
  };
  writeMetadata(galleryMetadataPath(root), metadata);
  return metadata;
}

export function assertGalleryBuildArtifacts({ root, commandName }) {
  const packageMetadata = assertBuiltPackageArtifacts({ root, commandName });
  const galleryDir = join(root, "apps", "gallery");
  const indexPath = join(galleryDir, "dist", "index.html");
  if (!existsSync(indexPath)) {
    throw new Error(`apps/gallery/dist/index.html is missing before ${commandName}; run pnpm build && pnpm gallery:build`);
  }

  const metadataPath = galleryMetadataPath(root);
  const metadata = readMetadata(metadataPath, "gallery");
  validateGalleryMetadataShape(metadata, metadataPath);

  const sourceFingerprint = fingerprintTree(galleryDir, {
    excludedDirectories: new Set([".astro", "dist", "node_modules"]),
  });
  if (metadata.sourceFingerprint !== sourceFingerprint) {
    throw staleBuildError({ subject: "gallery source", commandName, rebuildCommand: "pnpm gallery:build" });
  }

  const artifactFingerprint = fingerprintTree(join(galleryDir, "dist"));
  if (metadata.artifactFingerprint !== artifactFingerprint) {
    throw staleBuildError({ subject: "gallery output", commandName, rebuildCommand: "pnpm gallery:build" });
  }

  for (const [packageName, packageRecord] of packageMetadata) {
    const consumedRecord = metadata.packages[packageName];
    if (
      consumedRecord?.sourceFingerprint !== packageRecord.sourceFingerprint ||
      consumedRecord?.artifactFingerprint !== packageRecord.artifactFingerprint
    ) {
      throw staleBuildError({
        subject: `gallery consumption of @sanchika/${packageName}`,
        commandName,
        rebuildCommand: "pnpm gallery:build",
      });
    }
  }

  return metadata;
}

export function runBuildArtifactFixtures() {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "sanchika-build-artifacts-"));
  const failures = [];
  let count = 0;

  const expectPass = (name, action) => {
    count += 1;
    try {
      action();
    } catch (error) {
      failures.push(`${name} should pass: ${String(error)}`);
    }
  };
  const expectFailure = (name, expectedMessage, action) => {
    count += 1;
    try {
      action();
      failures.push(`${name} should fail`);
    } catch (error) {
      if (!String(error).includes(expectedMessage)) {
        failures.push(`${name} should mention ${expectedMessage}; received ${String(error)}`);
      }
    }
  };

  try {
    createFixtureTree(fixtureRoot);
    for (const packageName of requiredArtifactsByPackage.keys()) writePackageBuildMetadata({ root: fixtureRoot, packageName });
    writeGalleryBuildMetadata({ root: fixtureRoot });

    expectPass("fresh package and gallery output", () =>
      assertGalleryBuildArtifacts({ root: fixtureRoot, commandName: "fixture check" }),
    );

    const firstMetadata = readFileSync(packageMetadataPath(fixtureRoot, "primitives"), "utf8");
    writePackageBuildMetadata({ root: fixtureRoot, packageName: "primitives" });
    expectPass("deterministic package metadata", () => {
      if (readFileSync(packageMetadataPath(fixtureRoot, "primitives"), "utf8") !== firstMetadata) {
        throw new Error("metadata bytes changed without input changes");
      }
    });

    const firstGalleryMetadata = readFileSync(galleryMetadataPath(fixtureRoot), "utf8");
    writeGalleryBuildMetadata({ root: fixtureRoot });
    expectPass("deterministic gallery metadata", () => {
      if (readFileSync(galleryMetadataPath(fixtureRoot), "utf8") !== firstGalleryMetadata) {
        throw new Error("gallery metadata bytes changed without input changes");
      }
    });

    const primitiveSourcePath = join(fixtureRoot, "packages", "primitives", "src", "index.ts");
    writeFileSync(primitiveSourcePath, "export const fixture = 2;\n");
    expectFailure("stale package source", "@sanchika/primitives source", () =>
      assertBuiltPackageArtifacts({ root: fixtureRoot, commandName: "fixture check", packageNames: ["primitives"] }),
    );
    writeFileSync(primitiveSourcePath, "export const fixture = 1;\n");

    const s5ContractPath = join(fixtureRoot, "packages", "primitives", "src", "contracts", "search-feedback.ts");
    writeFileSync(s5ContractPath, "export const fixture = 2;\n");
    expectFailure("stale S5 primitive contract source", "@sanchika/primitives source", () =>
      assertBuiltPackageArtifacts({ root: fixtureRoot, commandName: "fixture check", packageNames: ["primitives"] }),
    );
    writeFileSync(s5ContractPath, "export const fixture = 1;\n");

    const formattingSourcePath = join(fixtureRoot, "packages", "primitives", "src", "formatting", "indian.ts");
    writeFileSync(formattingSourcePath, "export const fixture = 2;\n");
    expectFailure("stale Indian formatting source", "@sanchika/primitives source", () =>
      assertGalleryBuildArtifacts({ root: fixtureRoot, commandName: "fixture check" }),
    );
    writeFileSync(formattingSourcePath, "export const fixture = 1;\n");

    const primitiveOutputPath = join(fixtureRoot, "packages", "primitives", "dist", "index.js");
    writeFileSync(primitiveOutputPath, "export const fixture = 2;\n");
    expectFailure("stale package output", "@sanchika/primitives output", () =>
      assertBuiltPackageArtifacts({ root: fixtureRoot, commandName: "fixture check", packageNames: ["primitives"] }),
    );
    writeFileSync(primitiveOutputPath, "export const fixture = 1;\n");

    const gallerySourcePath = join(fixtureRoot, "apps", "gallery", "src", "index.astro");
    writeFileSync(gallerySourcePath, "<main>changed</main>\n");
    expectFailure("stale gallery source", "gallery source", () =>
      assertGalleryBuildArtifacts({ root: fixtureRoot, commandName: "fixture check" }),
    );
    writeFileSync(gallerySourcePath, "<main>fixture</main>\n");

    const galleryReferencePath = join(fixtureRoot, "apps", "gallery", "src", "components", "S5SearchPanel.astro");
    writeFileSync(galleryReferencePath, "<script>changed</script>\n");
    expectFailure("stale S5 gallery reference behavior", "gallery source", () =>
      assertGalleryBuildArtifacts({ root: fixtureRoot, commandName: "fixture check" }),
    );
    writeFileSync(galleryReferencePath, "<script>fixture</script>\n");

    const galleryOutputPath = join(fixtureRoot, "apps", "gallery", "dist", "index.html");
    writeFileSync(galleryOutputPath, "<main>changed</main>\n");
    expectFailure("stale gallery output", "gallery output", () =>
      assertGalleryBuildArtifacts({ root: fixtureRoot, commandName: "fixture check" }),
    );
    writeFileSync(galleryOutputPath, "<main>fixture</main>\n");

    rmSync(packageMetadataPath(fixtureRoot, "tokens"));
    expectFailure("missing metadata", "build metadata is missing", () =>
      assertBuiltPackageArtifacts({ root: fixtureRoot, commandName: "fixture check", packageNames: ["tokens"] }),
    );
    writePackageBuildMetadata({ root: fixtureRoot, packageName: "tokens" });

    writeFileSync(packageMetadataPath(fixtureRoot, "patterns"), "not json\n");
    expectFailure("malformed metadata", "build metadata is malformed", () =>
      assertBuiltPackageArtifacts({ root: fixtureRoot, commandName: "fixture check", packageNames: ["patterns"] }),
    );
    writePackageBuildMetadata({ root: fixtureRoot, packageName: "patterns" });

    writeFileSync(primitiveOutputPath, "export const fixture = 3;\n");
    writePackageBuildMetadata({ root: fixtureRoot, packageName: "primitives" });
    expectFailure("gallery built against older package output", "gallery consumption of @sanchika/primitives", () =>
      assertGalleryBuildArtifacts({ root: fixtureRoot, commandName: "fixture check" }),
    );

    writeGalleryBuildMetadata({ root: fixtureRoot });
    expectPass("rebuilt metadata restores a fresh check", () =>
      assertGalleryBuildArtifacts({ root: fixtureRoot, commandName: "fixture check" }),
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }

  return { count, failures };
}

function assertRequiredPackageArtifacts({ root, commandName, packageNames }) {
  const missing = [];
  for (const packageName of packageNames) {
    requireKnownPackage(packageName);
    for (const artifact of requiredArtifactsByPackage.get(packageName)) {
      const relativePath = join("packages", packageName, artifact);
      if (!existsSync(join(root, relativePath))) missing.push(relativePath);
    }
  }
  if (missing.length === 0) return;
  throw new Error(
    [
      `Sanchika build artifacts are missing before ${commandName}:`,
      ...missing.map((relativePath) => `- ${relativePath}`),
      `Run pnpm build before ${commandName}.`,
    ].join("\n"),
  );
}

function createFixtureTree(root) {
  for (const [packageName, requiredArtifacts] of requiredArtifactsByPackage) {
    const packageDir = join(root, "packages", packageName);
    mkdirSync(join(packageDir, "src"), { recursive: true });
    writeFileSync(join(packageDir, "src", "index.ts"), "export const fixture = 1;\n");
    writeFileSync(join(packageDir, "package.json"), `${JSON.stringify({ name: `@sanchika/${packageName}` })}\n`);
    if (packageName === "primitives") {
      mkdirSync(join(packageDir, "src", "contracts"), { recursive: true });
      mkdirSync(join(packageDir, "src", "formatting"), { recursive: true });
      writeFileSync(join(packageDir, "src", "contracts", "search-feedback.ts"), "export const fixture = 1;\n");
      writeFileSync(join(packageDir, "src", "formatting", "indian.ts"), "export const fixture = 1;\n");
    }
    for (const artifact of requiredArtifacts) {
      const artifactPath = join(packageDir, artifact);
      mkdirSync(join(artifactPath, ".."), { recursive: true });
      writeFileSync(artifactPath, artifact.endsWith(".css") ? ":root {}\n" : "export const fixture = 1;\n");
    }
  }
  const galleryDir = join(root, "apps", "gallery");
  mkdirSync(join(galleryDir, "src"), { recursive: true });
  mkdirSync(join(galleryDir, "src", "components"), { recursive: true });
  mkdirSync(join(galleryDir, "dist"), { recursive: true });
  writeFileSync(join(galleryDir, "src", "index.astro"), "<main>fixture</main>\n");
  writeFileSync(join(galleryDir, "src", "components", "S5SearchPanel.astro"), "<script>fixture</script>\n");
  writeFileSync(join(galleryDir, "package.json"), `${JSON.stringify({ name: "@sanchika/gallery-app" })}\n`);
  writeFileSync(join(galleryDir, "dist", "index.html"), "<main>fixture</main>\n");
}

function fingerprintTree(directory, { excludedDirectories = new Set() } = {}) {
  const hash = createHash("sha256");
  const files = listFiles(directory, excludedDirectories).sort();
  for (const path of files) {
    const relativePath = relative(directory, path).replaceAll("\\", "/");
    hash.update(relativePath);
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function listFiles(directory, excludedDirectories) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    if (entry.name === ".DS_Store" || entry.name.endsWith(".tsbuildinfo")) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path, excludedDirectories));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function packageMetadataPath(root, packageName) {
  return join(root, metadataDirectory, "packages", `${packageName}.json`);
}

function galleryMetadataPath(root) {
  return join(root, metadataDirectory, "gallery.json");
}

function writeMetadata(path, metadata) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(metadata, null, 2)}\n`);
}

function readMetadata(path, subject) {
  if (!existsSync(path)) {
    throw new Error(`${subject} build metadata is missing at ${path}; rebuild the relevant artifacts`);
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${subject} build metadata is malformed at ${path}: ${String(error)}`);
  }
}

function validatePackageMetadataShape(metadata, packageName, path) {
  if (
    metadata?.schemaVersion !== metadataSchemaVersion ||
    metadata?.kind !== "package" ||
    metadata?.packageName !== packageName ||
    !isFingerprint(metadata?.sourceFingerprint) ||
    !isFingerprint(metadata?.artifactFingerprint)
  ) {
    throw new Error(`@sanchika/${packageName} build metadata is malformed at ${path}`);
  }
}

function validateGalleryMetadataShape(metadata, path) {
  if (
    metadata?.schemaVersion !== metadataSchemaVersion ||
    metadata?.kind !== "gallery" ||
    !isFingerprint(metadata?.sourceFingerprint) ||
    !isFingerprint(metadata?.artifactFingerprint) ||
    typeof metadata?.packages !== "object" ||
    metadata.packages === null
  ) {
    throw new Error(`gallery build metadata is malformed at ${path}`);
  }
  for (const packageName of requiredArtifactsByPackage.keys()) {
    if (
      !isFingerprint(metadata.packages[packageName]?.sourceFingerprint) ||
      !isFingerprint(metadata.packages[packageName]?.artifactFingerprint)
    ) {
      throw new Error(`gallery build metadata is malformed at ${path}: missing @sanchika/${packageName} fingerprint`);
    }
  }
}

function isFingerprint(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function requireKnownPackage(packageName) {
  if (!requiredArtifactsByPackage.has(packageName)) {
    throw new Error(`Unknown Sanchika package ${packageName} in build-artifact preflight`);
  }
}

function staleBuildError({ subject, commandName, rebuildCommand }) {
  return new Error(`${subject} fingerprint is stale before ${commandName}; run ${rebuildCommand}`);
}

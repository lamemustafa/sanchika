import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { assertStableReleaseScreenshotRecords, stableReleaseScreenshotSet } from "./release-screenshots.mjs";

export const stableReleasePackageOrder = [
  "@sanchika/tokens",
  "@sanchika/primitives",
  "@sanchika/patterns",
];

const knownPackages = new Set(stableReleasePackageOrder);

export function loadReleaseManifest(path) {
  if (!existsSync(path)) {
    throw new Error(`release manifest is missing at ${path}`);
  }

  return parseReleaseManifest(readFileSync(path, "utf8"), path);
}

export function parseReleaseManifest(text, source = "release manifest") {
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    throw new Error(`release manifest at ${source} is malformed JSON: ${error.message}`);
  }

  const failures = validateReleaseManifest(manifest);
  if (failures.length > 0) {
    throw new Error(`release manifest at ${source} is invalid:\n- ${failures.join("\n- ")}`);
  }
  return manifest;
}

export function resolveReleaseVersion({ manifest, override }) {
  if (override && override !== manifest.version) {
    throw new Error(`--version ${override} must match release manifest version ${manifest.version}`);
  }
  return manifest.version;
}

export function createReleaseArtifactManifest({ version, channel, source, generatedAt, tarballs, screenshots = [] }) {
  if (
    channel === "stable" &&
    JSON.stringify(tarballs.map((tarball) => tarball.packageName)) !==
      JSON.stringify(stableReleasePackageOrder)
  ) {
    throw new Error(`stable release artifacts must follow ${stableReleasePackageOrder.join(", ")}`);
  }
  for (const tarball of tarballs) {
    if (tarball.version !== version) {
      throw new Error(`${tarball.packageName} artifact version ${tarball.version} must equal release version ${version}`);
    }
    if (!tarball.filename.endsWith(`-${version}.tgz`)) {
      throw new Error(`${tarball.packageName} artifact filename must include release version ${version}`);
    }
    if (!/^[0-9a-f]{64}$/.test(tarball.sha256)) {
      throw new Error(`${tarball.packageName} artifact must include a SHA-256 checksum`);
    }
    if (!tarball.path || sha256File(tarball.path) !== tarball.sha256) {
      throw new Error(`${tarball.packageName} artifact checksum must match the bytes at ${String(tarball.path)}`);
    }
    assertReleaseFileInventory(tarball);
  }
  if (channel === "stable") assertStableReleaseScreenshotRecords(screenshots);
  if (channel !== "stable" && screenshots.length > 0) {
    throw new Error("screenshots are supported only for the stable release artifact bundle");
  }

  return {
    version,
    channel,
    source,
    generatedAt,
    packages: tarballs.map((tarball) => ({
      name: tarball.packageName,
      version: tarball.version,
      file: tarball.filename,
      sha256: tarball.sha256,
      files: tarball.files.map((file) => ({ path: file.path, size: file.size })),
    })),
    screenshots: screenshots.map((screenshot) => ({
      file: screenshot.file,
      sha256: screenshot.sha256,
      size: screenshot.size,
    })),
  };
}

export function createReleaseChecksumSummary(manifest) {
  if (
    !["stable", "prerelease-check"].includes(manifest?.channel) ||
    JSON.stringify(manifest.packages?.map((pkg) => pkg.name)) !== JSON.stringify(stableReleasePackageOrder)
  ) {
    throw new Error(`checksum summary packages must follow ${stableReleasePackageOrder.join(", ")}`);
  }

  const packageLines = manifest.packages.map((pkg) => {
    if (!/^[0-9a-f]{64}$/.test(pkg.sha256 ?? "")) {
      throw new Error(`${pkg.name} checksum summary entry must include a SHA-256 checksum`);
    }
    if (typeof pkg.file !== "string" || !/^[^/]+\.tgz$/.test(pkg.file)) {
      throw new Error(`${pkg.name} checksum summary entry must reference one release tarball`);
    }
    return `${pkg.sha256}  ${pkg.file}`;
  });

  const screenshots = manifest.screenshots ?? [];
  if (manifest.channel === "stable") assertManifestScreenshotRecords(screenshots);
  if (manifest.channel !== "stable" && screenshots.length > 0) {
    throw new Error("prerelease checksum summary must not contain screenshots");
  }
  const screenshotLines = screenshots.map((screenshot) => `${screenshot.sha256}  ${screenshot.file}`);
  return `${[...packageLines, ...screenshotLines].join("\n")}\n`;
}

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function validateReleaseManifest(manifest) {
  const failures = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return ["manifest must be a JSON object"];
  }

  if (manifest.channel !== "stable") {
    failures.push(`channel must be stable; received ${String(manifest.channel)}`);
  }
  if (!isStableSemver(manifest.version)) {
    failures.push("version must be a non-prerelease semantic version other than 0.0.0 for the stable channel");
  }
  if (manifest.previousVersion !== undefined) {
    if (!isStableSemver(manifest.previousVersion)) {
      failures.push("previousVersion must be a non-prerelease semantic version other than 0.0.0");
    } else if (manifest.previousVersion === manifest.version) {
      failures.push("previousVersion must differ from the stable release version");
    } else if (
      isStableSemver(manifest.version) &&
      compareStableSemver(manifest.previousVersion, manifest.version) > 0
    ) {
      failures.push("previousVersion must be older than the stable release version");
    }
  }
  if (!Array.isArray(manifest.packages) || manifest.packages.length === 0) {
    failures.push("packages must be a non-empty array");
    return failures;
  }

  const seen = new Set();
  let previousIndex = -1;
  for (const packageName of manifest.packages) {
    if (typeof packageName !== "string" || !knownPackages.has(packageName)) {
      failures.push(`unknown package ${String(packageName)}`);
      continue;
    }
    if (seen.has(packageName)) {
      failures.push(`duplicate package ${packageName}`);
      continue;
    }
    seen.add(packageName);

    const packageIndex = stableReleasePackageOrder.indexOf(packageName);
    if (packageIndex === -1) {
      failures.push(`${packageName} is not approved for the stable release set`);
      continue;
    }
    if (packageIndex <= previousIndex) {
      failures.push(`packages must follow deterministic order: ${stableReleasePackageOrder.join(", ")}`);
    }
    previousIndex = packageIndex;
  }

  if (JSON.stringify(manifest.packages) !== JSON.stringify(stableReleasePackageOrder)) {
    failures.push(`packages must include exactly ${stableReleasePackageOrder.join(", ")}`);
  }

  return failures;
}

export function releaseManifestFixtureCases() {
  const valid = {
    version: "1.2.3",
    previousVersion: "1.2.2",
    channel: "stable",
    packages: [...stableReleasePackageOrder],
  };
  return [
    { name: "valid stable manifest", manifest: valid, expectedFailure: null },
    { name: "unsupported channel", manifest: { ...valid, channel: "next" }, expectedFailure: "channel must be stable" },
    { name: "duplicate package", manifest: { ...valid, packages: [stableReleasePackageOrder[0], stableReleasePackageOrder[0]] }, expectedFailure: "duplicate package" },
    { name: "unknown package", manifest: { ...valid, packages: ["@sanchika/unknown"] }, expectedFailure: "unknown package" },
    { name: "gallery app is not a release package", manifest: { ...valid, packages: ["@sanchika/gallery-app"] }, expectedFailure: "unknown package" },
    { name: "invalid version", manifest: { ...valid, version: "01.2.3" }, expectedFailure: "non-prerelease semantic version" },
    { name: "prerelease version", manifest: { ...valid, version: "1.2.3-next.1" }, expectedFailure: "non-prerelease semantic version" },
    { name: "invalid previous version", manifest: { ...valid, previousVersion: "1.2.2-next.1" }, expectedFailure: "previousVersion" },
    { name: "duplicate previous version", manifest: { ...valid, previousVersion: valid.version }, expectedFailure: "must differ" },
    { name: "newer previous version", manifest: { ...valid, previousVersion: "1.2.4" }, expectedFailure: "must be older" },
    { name: "non-deterministic order", manifest: { ...valid, packages: [...stableReleasePackageOrder].reverse() }, expectedFailure: "deterministic order" },
    { name: "missing package list", manifest: { version: "1.2.3", channel: "stable" }, expectedFailure: "non-empty array" },
  ];
}

function assertReleaseFileInventory(tarball) {
  if (!Array.isArray(tarball.files) || tarball.files.length === 0) {
    throw new Error(`${tarball.packageName} artifact must include its npm pack file inventory`);
  }
  const paths = tarball.files.map((file) => file?.path);
  if (new Set(paths).size !== paths.length) {
    throw new Error(`${tarball.packageName} artifact file inventory must not contain duplicate paths`);
  }
  if (JSON.stringify(paths) !== JSON.stringify([...paths].sort((left, right) => left.localeCompare(right)))) {
    throw new Error(`${tarball.packageName} artifact file inventory must use deterministic path order`);
  }
  for (const file of tarball.files) {
    if (
      typeof file?.path !== "string" ||
      !file.path ||
      file.path.startsWith("/") ||
      file.path.includes("\\") ||
      file.path.split("/").includes("..")
    ) {
      throw new Error(`${tarball.packageName} artifact file inventory contains an invalid path`);
    }
    if (!Number.isSafeInteger(file.size) || file.size < 0) {
      throw new Error(`${tarball.packageName} artifact file ${file.path} must include a non-negative byte size`);
    }
  }
}

function assertManifestScreenshotRecords(screenshots) {
  const expectedFiles = stableReleaseScreenshotSet.map(({ file }) => file);
  if (JSON.stringify(screenshots.map(({ file }) => file)) !== JSON.stringify(expectedFiles)) {
    throw new Error(`stable release screenshots must include exactly ${expectedFiles.join(", ")}`);
  }
  for (const screenshot of screenshots) {
    if (!/^[0-9a-f]{64}$/.test(screenshot.sha256 ?? "")) {
      throw new Error(`${screenshot.file} checksum summary entry must include a SHA-256 checksum`);
    }
    if (!Number.isSafeInteger(screenshot.size) || screenshot.size <= 0) {
      throw new Error(`${screenshot.file} must include a positive byte size`);
    }
  }
}

function isStableSemver(version) {
  return (
    typeof version === "string" &&
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version) &&
    version !== "0.0.0"
  );
}

function compareStableSemver(left, right) {
  const leftParts = left.split(".").map(BigInt);
  const rightParts = right.split(".").map(BigInt);
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] < rightParts[index]) return -1;
    if (leftParts[index] > rightParts[index]) return 1;
  }
  return 0;
}

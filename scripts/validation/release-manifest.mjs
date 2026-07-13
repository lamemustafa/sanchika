import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

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

export function createReleaseArtifactManifest({ version, channel, source, generatedAt, tarballs }) {
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
  }

  return {
    version,
    channel,
    source,
    generatedAt,
    packages: tarballs.map((tarball) => ({
      name: tarball.packageName,
      version: tarball.version,
      file: `tarballs/${tarball.filename}`,
      sha256: tarball.sha256,
    })),
  };
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
    channel: "stable",
    packages: [...stableReleasePackageOrder],
  };
  return [
    { name: "valid stable manifest", manifest: valid, expectedFailure: null },
    { name: "unsupported channel", manifest: { ...valid, channel: "next" }, expectedFailure: "channel must be stable" },
    { name: "duplicate package", manifest: { ...valid, packages: [stableReleasePackageOrder[0], stableReleasePackageOrder[0]] }, expectedFailure: "duplicate package" },
    { name: "unknown package", manifest: { ...valid, packages: ["@sanchika/unknown"] }, expectedFailure: "unknown package" },
    { name: "gallery app is not a release package", manifest: { ...valid, packages: ["@sanchika/gallery"] }, expectedFailure: "unknown package" },
    { name: "invalid version", manifest: { ...valid, version: "01.2.3" }, expectedFailure: "non-prerelease semantic version" },
    { name: "prerelease version", manifest: { ...valid, version: "1.2.3-next.1" }, expectedFailure: "non-prerelease semantic version" },
    { name: "non-deterministic order", manifest: { ...valid, packages: [...stableReleasePackageOrder].reverse() }, expectedFailure: "deterministic order" },
    { name: "missing package list", manifest: { version: "1.2.3", channel: "stable" }, expectedFailure: "non-empty array" },
  ];
}

function isStableSemver(version) {
  return (
    typeof version === "string" &&
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version) &&
    version !== "0.0.0"
  );
}

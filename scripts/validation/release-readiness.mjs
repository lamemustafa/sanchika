import { createHash } from "node:crypto";
import {
  createReleaseChecksumSummary,
  stableReleasePackageOrder,
} from "./release-manifest.mjs";
import { stableReleaseScreenshotSet } from "./release-screenshots.mjs";

const releaseRepository = "https://github.com/lamemustafa/sanchika";

export function expectedStableReleaseAssetNames(version) {
  return [
    ...stableReleasePackageOrder.map((name) => `${name.replace("@sanchika/", "sanchika-")}-${version}.tgz`),
    "manifest.json",
    "SHA256SUMS",
    ...stableReleaseScreenshotSet.map((entry) => entry.file),
  ];
}

export function validatePublishedStableRelease({ manifest, release }) {
  const failures = [];
  if (release?.tag_name !== `v${manifest.version}`) failures.push(`published release tag must be v${manifest.version}`);
  if (release?.draft !== false) failures.push("published release must not be a draft");
  if (release?.prerelease !== false) failures.push("published stable release must not be a prerelease");
  const expectedAssets = expectedStableReleaseAssetNames(manifest.version).sort();
  const actualAssets = (release?.assets ?? []).map((asset) => asset?.name).sort();
  if (JSON.stringify(actualAssets) !== JSON.stringify(expectedAssets)) {
    failures.push(`published release assets must be exactly ${expectedAssets.join(", ")}`);
  }
  for (const asset of release?.assets ?? []) {
    if (!Number.isSafeInteger(asset?.size) || asset.size <= 0) {
      failures.push(`published release asset ${String(asset?.name)} must have a positive byte size`);
    }
    const expectedUrl = `${releaseRepository}/releases/download/v${manifest.version}/${asset?.name}`;
    if (asset?.browser_download_url !== expectedUrl) {
      failures.push(`published release asset ${String(asset?.name)} must use ${expectedUrl}`);
    }
  }
  return failures;
}

export function validatePublishedStableReleaseArtifacts({
  manifest,
  artifactManifest,
  checksumSummary,
  artifactBytes,
  tagCommit,
}) {
  const failures = [];
  if (!artifactManifest || typeof artifactManifest !== "object" || Array.isArray(artifactManifest)) {
    return ["published manifest.json must contain a JSON object"];
  }

  if (artifactManifest.version !== manifest.version) {
    failures.push(`published manifest version must be ${manifest.version}`);
  }
  if (artifactManifest.channel !== "stable") failures.push("published manifest channel must be stable");
  if (artifactManifest.source?.repository !== releaseRepository) {
    failures.push(`published manifest source repository must be ${releaseRepository}`);
  }
  if (!/^[0-9a-f]{40}$/.test(artifactManifest.source?.commit ?? "")) {
    failures.push("published manifest source commit must be a full Git commit SHA");
  } else if (artifactManifest.source.commit !== tagCommit) {
    failures.push(`published manifest source commit must match tag commit ${tagCommit}`);
  }
  if (
    typeof artifactManifest.generatedAt !== "string" ||
    !artifactManifest.generatedAt ||
    Number.isNaN(Date.parse(artifactManifest.generatedAt))
  ) {
    failures.push("published manifest generatedAt must be a valid timestamp");
  }

  const packages = Array.isArray(artifactManifest.packages) ? artifactManifest.packages : [];
  if (JSON.stringify(packages.map((entry) => entry?.name)) !== JSON.stringify(stableReleasePackageOrder)) {
    failures.push(`published manifest packages must follow ${stableReleasePackageOrder.join(", ")}`);
  }
  for (const [index, packageName] of stableReleasePackageOrder.entries()) {
    const entry = packages[index];
    const expectedFile = `${packageName.replace("@sanchika/", "sanchika-")}-${manifest.version}.tgz`;
    if (entry?.version !== manifest.version) failures.push(`${packageName} published version must be ${manifest.version}`);
    if (entry?.file !== expectedFile) failures.push(`${packageName} published file must be ${expectedFile}`);
    if (!/^[0-9a-f]{64}$/.test(entry?.sha256 ?? "")) failures.push(`${packageName} must include a SHA-256 checksum`);
    validateFileInventory({ packageName, files: entry?.files, failures });
  }

  const screenshots = Array.isArray(artifactManifest.screenshots) ? artifactManifest.screenshots : [];
  const expectedScreenshots = stableReleaseScreenshotSet.map((entry) => entry.file);
  if (JSON.stringify(screenshots.map((entry) => entry?.file)) !== JSON.stringify(expectedScreenshots)) {
    failures.push(`published manifest screenshots must follow ${expectedScreenshots.join(", ")}`);
  }
  for (const [index, file] of expectedScreenshots.entries()) {
    const entry = screenshots[index];
    if (!/^[0-9a-f]{64}$/.test(entry?.sha256 ?? "")) failures.push(`${file} must include a SHA-256 checksum`);
    if (!Number.isSafeInteger(entry?.size) || entry.size <= 0) failures.push(`${file} must include a positive byte size`);
  }

  try {
    const expectedSummary = createReleaseChecksumSummary(artifactManifest);
    if (checksumSummary !== expectedSummary) {
      failures.push("published SHA256SUMS must agree exactly with manifest.json");
    }
  } catch (error) {
    failures.push(`published manifest cannot produce SHA256SUMS: ${error.message}`);
  }

  for (const entry of [...packages, ...screenshots]) {
    if (typeof entry?.file !== "string") continue;
    const bytes = artifactBytes.get(entry.file);
    if (!(bytes instanceof Uint8Array)) {
      failures.push(`published release asset bytes are missing for ${entry.file}`);
      continue;
    }
    const checksum = createHash("sha256").update(bytes).digest("hex");
    if (checksum !== entry.sha256) failures.push(`published release asset ${entry.file} does not match its manifest checksum`);
    if (entry.size !== undefined && bytes.byteLength !== entry.size) {
      failures.push(`published release asset ${entry.file} does not match its manifest byte size`);
    }
  }

  return failures;
}

export function validateLocalStableReleaseMatch({
  publishedArtifactManifest,
  localArtifactManifest,
  publishedArtifactBytes,
  localArtifactBytes,
}) {
  const failures = [];
  const comparablePublishedManifest = packageEvidence(publishedArtifactManifest);
  const comparableLocalManifest = packageEvidence(localArtifactManifest);
  if (JSON.stringify(comparableLocalManifest) !== JSON.stringify(comparablePublishedManifest)) {
    failures.push("published package manifest evidence must match the release regenerated from the tag checkout");
  }
  for (const { file: name } of publishedArtifactManifest.packages ?? []) {
    const publishedBytes = publishedArtifactBytes.get(name);
    const localBytes = localArtifactBytes.get(name);
    if (!(localBytes instanceof Uint8Array) || !Buffer.from(localBytes).equals(Buffer.from(publishedBytes))) {
      failures.push(`published package ${name} must match the bytes regenerated from the tag checkout`);
    }
  }
  return failures;
}

export function validateLocalStableReleaseCheckout({ checkoutCommit, tagCommit }) {
  if (!/^[0-9a-f]{40}$/.test(checkoutCommit ?? "")) {
    return {
      compare: false,
      failures: ["Pages checkout GITHUB_SHA must be a full Git commit SHA"],
    };
  }
  return {
    compare: checkoutCommit === tagCommit,
    failures: [],
  };
}

export function runReleaseReadinessFixtures(manifest) {
  const validEvidence = createValidEvidence(manifest);
  const valid = validEvidence.release;
  const metadataCases = [
    { name: "complete stable release", release: valid, expected: null },
    { name: "wrong tag", release: { ...valid, tag_name: "v9.9.9" }, expected: "published release tag" },
    { name: "draft release", release: { ...valid, draft: true }, expected: "must not be a draft" },
    { name: "prerelease", release: { ...valid, prerelease: true }, expected: "must not be a prerelease" },
    { name: "missing asset", release: { ...valid, assets: valid.assets.slice(1) }, expected: "assets must be exactly" },
    { name: "extra asset", release: { ...valid, assets: [...valid.assets, releaseAsset(manifest.version, "unexpected.tgz", 1)] }, expected: "assets must be exactly" },
    { name: "empty asset", release: { ...valid, assets: valid.assets.map((asset, index) => index === 0 ? { ...asset, size: 0 } : asset) }, expected: "positive byte size" },
    { name: "foreign asset URL", release: { ...valid, assets: valid.assets.map((asset, index) => index === 0 ? { ...asset, browser_download_url: "https://example.com/stale.tgz" } : asset) }, expected: "must use" },
  ];
  const artifactCases = [
    { name: "matching published bytes", mutate: (evidence) => evidence, expected: null },
    { name: "stale package bytes", mutate: (evidence) => ({ ...evidence, artifactBytes: new Map(evidence.artifactBytes).set(evidence.artifactManifest.packages[0].file, Buffer.from("stale")) }), expected: "manifest checksum" },
    { name: "checksum summary drift", mutate: (evidence) => ({ ...evidence, checksumSummary: `${evidence.checksumSummary}invalid\n` }), expected: "agree exactly" },
    { name: "wrong artifact version", mutate: (evidence) => ({ ...evidence, artifactManifest: { ...evidence.artifactManifest, version: "9.9.9" } }), expected: "published manifest version" },
    { name: "wrong source commit", mutate: (evidence) => ({ ...evidence, artifactManifest: { ...evidence.artifactManifest, source: { ...evidence.artifactManifest.source, commit: "b".repeat(40) } } }), expected: "must match tag commit" },
    { name: "missing package inventory", mutate: (evidence) => ({ ...evidence, artifactManifest: { ...evidence.artifactManifest, packages: evidence.artifactManifest.packages.map((entry, index) => index === 0 ? { ...entry, files: [] } : entry) } }), expected: "npm pack file inventory" },
  ];
  const localMatchCases = [
    { name: "matching regenerated release", mutate: (evidence) => evidence, expected: null },
    { name: "regenerated byte mismatch", mutate: (evidence) => ({ ...evidence, localArtifactBytes: new Map(evidence.localArtifactBytes).set(evidence.publishedArtifactManifest.packages[0].file, Buffer.from("different")) }), expected: "regenerated from the tag checkout" },
    { name: "regenerated package manifest mismatch", mutate: (evidence) => ({ ...evidence, localArtifactManifest: { ...evidence.localArtifactManifest, packages: evidence.localArtifactManifest.packages.map((entry, index) => index === 0 ? { ...entry, files: [...entry.files, { path: "unexpected.txt", size: 1 }] } : entry) } }), expected: "package manifest evidence" },
  ];
  const localCheckoutCases = [
    { name: "release tag checkout", checkoutCommit: "a".repeat(40), tagCommit: "a".repeat(40), compare: true, expected: null },
    { name: "later master checkout", checkoutCommit: "b".repeat(40), tagCommit: "a".repeat(40), compare: false, expected: null },
    { name: "missing checkout commit", checkoutCommit: "", tagCommit: "a".repeat(40), compare: false, expected: "GITHUB_SHA" },
  ];
  const failures = [];
  for (const fixture of metadataCases) {
    const findings = validatePublishedStableRelease({ manifest, release: fixture.release });
    const matched = fixture.expected ? findings.some((finding) => finding.includes(fixture.expected)) : findings.length === 0;
    if (!matched) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join("; ") || "success"}`);
  }
  for (const fixture of artifactCases) {
    const evidence = fixture.mutate(createValidEvidence(manifest));
    const findings = validatePublishedStableReleaseArtifacts({ manifest, ...evidence });
    const matched = fixture.expected ? findings.some((finding) => finding.includes(fixture.expected)) : findings.length === 0;
    if (!matched) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join("; ") || "success"}`);
  }
  for (const fixture of localMatchCases) {
    const evidence = fixture.mutate(createValidMatchEvidence(manifest));
    const findings = validateLocalStableReleaseMatch(evidence);
    const matched = fixture.expected ? findings.some((finding) => finding.includes(fixture.expected)) : findings.length === 0;
    if (!matched) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join("; ") || "success"}`);
  }
  for (const fixture of localCheckoutCases) {
    const result = validateLocalStableReleaseCheckout(fixture);
    const matched = fixture.expected
      ? result.failures.some((finding) => finding.includes(fixture.expected))
      : result.failures.length === 0 && result.compare === fixture.compare;
    if (!matched) failures.push(`${fixture.name}: expected ${fixture.expected ?? `compare=${fixture.compare}`}; found ${result.failures.join("; ") || `compare=${result.compare}`}`);
  }
  return { count: metadataCases.length + artifactCases.length + localMatchCases.length + localCheckoutCases.length, failures };
}

function validateFileInventory({ packageName, files, failures }) {
  if (!Array.isArray(files) || files.length === 0) {
    failures.push(`${packageName} must include its npm pack file inventory`);
    return;
  }
  const paths = files.map((file) => file?.path);
  if (new Set(paths).size !== paths.length) failures.push(`${packageName} file inventory must not contain duplicate paths`);
  if (JSON.stringify(paths) !== JSON.stringify([...paths].sort((left, right) => left.localeCompare(right)))) {
    failures.push(`${packageName} file inventory must use deterministic path order`);
  }
  for (const file of files) {
    if (
      typeof file?.path !== "string" ||
      !file.path ||
      file.path.startsWith("/") ||
      file.path.includes("\\") ||
      file.path.split("/").includes("..")
    ) {
      failures.push(`${packageName} file inventory contains an invalid path`);
    }
    if (!Number.isSafeInteger(file?.size) || file.size < 0) {
      failures.push(`${packageName} file inventory contains an invalid byte size`);
    }
  }
}

function createValidEvidence(manifest) {
  const tagCommit = "a".repeat(40);
  const artifactBytes = new Map();
  const packages = stableReleasePackageOrder.map((name) => {
    const file = `${name.replace("@sanchika/", "sanchika-")}-${manifest.version}.tgz`;
    const bytes = Buffer.from(`fixture:${file}`);
    artifactBytes.set(file, bytes);
    return {
      name,
      version: manifest.version,
      file,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      files: [{ path: "LICENSE", size: 1 }, { path: "package.json", size: 1 }],
    };
  });
  const screenshots = stableReleaseScreenshotSet.map(({ file }) => {
    const bytes = Buffer.from(`fixture:${file}`);
    artifactBytes.set(file, bytes);
    return { file, sha256: createHash("sha256").update(bytes).digest("hex"), size: bytes.byteLength };
  });
  const artifactManifest = {
    version: manifest.version,
    channel: "stable",
    source: { repository: releaseRepository, commit: tagCommit },
    generatedAt: "2026-01-01T00:00:00.000Z",
    packages,
    screenshots,
  };
  const checksumSummary = createReleaseChecksumSummary(artifactManifest);
  const manifestBytes = Buffer.from(`${JSON.stringify(artifactManifest, null, 2)}\n`);
  const checksumBytes = Buffer.from(checksumSummary);
  artifactBytes.set("manifest.json", manifestBytes);
  artifactBytes.set("SHA256SUMS", checksumBytes);
  const release = {
    tag_name: `v${manifest.version}`,
    draft: false,
    prerelease: false,
    assets: expectedStableReleaseAssetNames(manifest.version).map((name) =>
      releaseAsset(manifest.version, name, artifactBytes.get(name).byteLength)),
  };
  return { release, artifactManifest, checksumSummary, artifactBytes, tagCommit };
}

function createValidMatchEvidence(manifest) {
  const evidence = createValidEvidence(manifest);
  return {
    publishedArtifactManifest: evidence.artifactManifest,
    localArtifactManifest: { ...evidence.artifactManifest, generatedAt: "2026-01-01T00:00:01.000Z" },
    publishedArtifactBytes: evidence.artifactBytes,
    localArtifactBytes: new Map(evidence.artifactBytes),
  };
}

function packageEvidence(manifest) {
  return {
    version: manifest?.version,
    channel: manifest?.channel,
    source: manifest?.source,
    packages: manifest?.packages,
  };
}

function releaseAsset(version, name, size) {
  return {
    name,
    size,
    browser_download_url: `${releaseRepository}/releases/download/v${version}/${name}`,
  };
}

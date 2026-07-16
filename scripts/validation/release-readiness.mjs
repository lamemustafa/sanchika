import { stableReleasePackageOrder } from "./release-manifest.mjs";
import { stableReleaseScreenshotSet } from "./release-screenshots.mjs";

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
  return failures;
}

export function runReleaseReadinessFixtures(manifest) {
  const assets = expectedStableReleaseAssetNames(manifest.version).map((name) => ({ name }));
  const valid = { tag_name: `v${manifest.version}`, draft: false, prerelease: false, assets };
  const cases = [
    { name: "complete stable release", release: valid, expected: null },
    { name: "wrong tag", release: { ...valid, tag_name: "v9.9.9" }, expected: "published release tag" },
    { name: "draft release", release: { ...valid, draft: true }, expected: "must not be a draft" },
    { name: "prerelease", release: { ...valid, prerelease: true }, expected: "must not be a prerelease" },
    { name: "missing asset", release: { ...valid, assets: assets.slice(1) }, expected: "assets must be exactly" },
    { name: "extra asset", release: { ...valid, assets: [...assets, { name: "unexpected.tgz" }] }, expected: "assets must be exactly" },
  ];
  const failures = [];
  for (const fixture of cases) {
    const findings = validatePublishedStableRelease({ manifest, release: fixture.release });
    const matched = fixture.expected ? findings.some((finding) => finding.includes(fixture.expected)) : findings.length === 0;
    if (!matched) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join("; ") || "success"}`);
  }
  return { count: cases.length, failures };
}

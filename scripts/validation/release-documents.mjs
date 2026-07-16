import { stableReleasePackageOrder } from "./release-manifest.mjs";
import { stableReleaseScreenshotSet } from "./release-screenshots.mjs";

export function validateReleaseDocuments({ manifest, releaseNotes, migrationGuide, releasePolicy, packageReadmes }) {
  const failures = [];
  const normalizedReleaseNotes = normalizeProse(releaseNotes);
  const normalizedMigrationGuide = normalizeProse(migrationGuide);
  const normalizedReleasePolicy = normalizeProse(releasePolicy);
  const version = manifest.version;
  const tag = `v${version}`;
  const packageFiles = stableReleasePackageOrder.map(
    (name) => `${name.replace("@sanchika/", "sanchika-")}-${version}.tgz`,
  );
  const rollbackFiles = stableReleasePackageOrder.map(
    (name) => `${name.replace("@sanchika/", "sanchika-")}-0.0.2.tgz`,
  );
  const requiredReleaseAssets = [
    ...packageFiles,
    "manifest.json",
    "SHA256SUMS",
    ...stableReleaseScreenshotSet.map(({ file }) => file),
  ];

  for (const asset of requiredReleaseAssets) {
    if (!releaseNotes.includes(`\`${asset}\``)) failures.push(`release notes must name stable asset ${asset}`);
  }
  for (const { file, source } of stableReleaseScreenshotSet) {
    if (!releaseNotes.includes(`\`${file}\``) || !releaseNotes.includes(`\`${source}\``)) {
      failures.push(`release notes must map ${file} to ${source}`);
    }
  }
  for (const fragment of [
    "browser/summary.json",
    "current gallery build",
    "SHA256SUMS_FROM_FINAL_RELEASE_ASSET_BYTES",
    "synthetic",
    "not published to npm",
    "No framework runtime adapter",
    "Physical assistive-technology validation",
    "Protected-workspace production depth",
    "pre-1.0 and experimental",
  ]) {
    if (!normalizedReleaseNotes.includes(fragment)) failures.push(`release notes must include ${fragment}`);
  }
  for (const unsafeClaim of ["fully backward compatible", "no breaking changes"]) {
    if (releaseNotes.toLowerCase().includes(unsafeClaim)) failures.push(`release notes must not claim ${unsafeClaim}`);
  }
  if (releaseNotes.includes("SHA256SUMS_FROM_FINAL_TARBALL_BYTES")) {
    failures.push("release notes must not describe SHA256SUMS as tarball-only");
  }

  for (const file of packageFiles) {
    const url = `https://github.com/lamemustafa/sanchika/releases/download/${tag}/${file}`;
    if (!migrationGuide.includes(url)) failures.push(`migration guide must include ${url}`);
  }
  for (const file of rollbackFiles) {
    const url = `https://github.com/lamemustafa/sanchika/releases/download/v0.0.2/${file}`;
    if (!migrationGuide.includes(url)) failures.push(`migration guide must include ${url}`);
  }
  const cssOrder = [
    '@import "@sanchika/tokens/theme.css";',
    '@import "@sanchika/primitives/styles.css";',
    '@import "@sanchika/patterns/styles.css";',
    '@import "./consumer.css";',
  ].map((fragment) => migrationGuide.indexOf(fragment));
  if (cssOrder.some((index) => index === -1) || cssOrder.some((index, position) => position > 0 && index <= cssOrder[position - 1])) {
    failures.push("migration guide CSS imports must be tokens, primitives, patterns, then consumer CSS");
  }
  for (const fragment of [
    "`pnpm-workspace.yaml`",
    "overrides:",
    '"@sanchika/tokens@0.1.0"',
    '"@sanchika/primitives@0.1.0"',
    "pnpm otherwise looks up the packed `0.1.0` dependency ranges on npm",
    "regenerate the lockfile",
    "@sanchika/tokens@0.0.2",
    "@sanchika/primitives@0.0.2",
    "leaving the v0.1.0 selectors would allow the rollback dependencies to fall through to npm",
    "consumer manifest and lockfile rollback together",
    "It does not require a database, DNS, or workspace migration",
    "private deployed application, not a dependency or release package",
    "Source package manifests deliberately remain private at version 0.0.0 with `workspace:*` dependencies",
  ]) {
    if (!normalizedMigrationGuide.includes(fragment)) failures.push(`migration guide must include ${fragment}`);
  }
  for (const [packageName, requiredFragments] of Object.entries({
    primitives: ["`pnpm-workspace.yaml`", "overrides:", '"@sanchika/tokens@0.1.0"', "pnpm install"],
    patterns: ["`pnpm-workspace.yaml`", "overrides:", '"@sanchika/tokens@0.1.0"', '"@sanchika/primitives@0.1.0"', "pnpm install"],
  })) {
    const readme = normalizeProse(packageReadmes?.[packageName] ?? "");
    for (const fragment of requiredFragments) {
      if (!readme.includes(fragment)) failures.push(`${packageName} package README must include ${fragment}`);
    }
  }

  for (const fragment of [
    "exactly eleven flat files",
    "final tarball and screenshot bytes",
    "offline pnpm installation with explicit tarball overrides",
    "check-gallery-release-readiness.mjs",
    "published package tarballs and package manifest evidence must match that clean tagged build",
    "uploads the exact asset set. The Pages workflow is then rerun",
    "rerun the Pages workflow",
    "does not publish to npm",
    "creates no tag",
  ]) {
    if (!normalizedReleasePolicy.includes(fragment)) failures.push(`release policy must include ${fragment}`);
  }
  return failures;
}

function normalizeProse(text) {
  return text.replace(/\s+/g, " ").trim();
}

export function runReleaseDocumentFixtures({ manifest, documents }) {
  const cases = [
    { name: "current documents", documents, expected: null },
    { name: "stale release version", documents: { ...documents, releaseNotes: documents.releaseNotes.replaceAll(manifest.version, "0.1.1") }, expected: "stable asset" },
    { name: "missing screenshot", documents: { ...documents, releaseNotes: documents.releaseNotes.replaceAll(stableReleaseScreenshotSet[0].file, "missing.png") }, expected: "stable asset" },
    { name: "tarball-only checksum wording", documents: { ...documents, releaseNotes: documents.releaseNotes.replace("SHA256SUMS_FROM_FINAL_RELEASE_ASSET_BYTES", "SHA256SUMS_FROM_FINAL_TARBALL_BYTES") }, expected: "tarball-only" },
    { name: "missing pnpm overrides", documents: { ...documents, migrationGuide: documents.migrationGuide.replace("overrides:", "registryFallback:") }, expected: "migration guide must include overrides:" },
    { name: "wrong rollback asset", documents: { ...documents, migrationGuide: documents.migrationGuide.replaceAll("sanchika-tokens-0.0.2.tgz", "sanchika-tokens-0.0.1.tgz") }, expected: "v0.0.2" },
    { name: "missing rollback override selector", documents: { ...documents, migrationGuide: documents.migrationGuide.replace("@sanchika/tokens@0.0.2", "@sanchika/tokens@0.1.0") }, expected: "@sanchika/tokens@0.0.2" },
    { name: "unsafe compatibility claim", documents: { ...documents, releaseNotes: `${documents.releaseNotes}\nFully backward compatible.` }, expected: "fully backward compatible" },
    { name: "missing private source model", documents: { ...documents, migrationGuide: documents.migrationGuide.replace(/Source package manifests deliberately\s+remain private/, "Source manifests remain") }, expected: "Source package manifests" },
  ];
  const failures = [];
  for (const fixture of cases) {
    const findings = validateReleaseDocuments({ manifest, ...fixture.documents });
    const matched = fixture.expected ? findings.some((finding) => finding.includes(fixture.expected)) : findings.length === 0;
    if (!matched) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join("; ") || "success"}`);
  }
  return { count: cases.length, failures };
}

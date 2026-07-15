import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { assertGalleryBuildArtifacts } from "../../../scripts/validation/build-artifacts.mjs";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const evidenceRoot = join(repositoryRoot, "output/playwright/s8-gallery-showcase");
const manifestPath = join(evidenceRoot, "evidence-manifest.json");
const checkOnly = process.argv.includes("--check");
const requiredEvidence = [
  "C2_REVIEW_BRIEF.md",
  "REVIEW_PASSES.md",
  "browser/summary.json",
  "compatibility/local-link.log",
  "compatibility/packed-tarball.log",
  "before/baseline.json",
  "before/live/root-1440x1000.png",
  "before/local/lab-axal-1440x1000.png",
  "before/local/lab-complyeaze-1440x1000.png",
  "before/local/lab-motion-1440x1000.png",
  "before/local/lab-pack-1440x1000.png",
  "before/local/lab-tools-1440x1000.png",
  "before/local/root-390x844.png",
  "before/local/root-768x1024.png",
  "before/local/root-1440x1000.png",
  "after/post-rectification/root-390x844.png",
  "after/post-rectification/root-768x1024.png",
  "after/post-rectification/root-1440x1000.png",
  "after/post-rectification/root-390x844-first-viewport.png",
  "after/post-rectification/root-768x1024-first-viewport.png",
  "after/post-rectification/root-1440x1000-first-viewport.png",
];

for (const path of requiredEvidence) {
  if (!existsSync(join(evidenceRoot, path))) throw new Error(`C2 evidence is missing ${path}`);
}

const galleryBuild = assertGalleryBuildArtifacts({ root: repositoryRoot, commandName: "pnpm evidence:manifest" });
const browserSummary = JSON.parse(readFileSync(join(evidenceRoot, "browser/summary.json"), "utf8"));
if (browserSummary.failures?.length) throw new Error(`Browser evidence contains failures: ${browserSummary.failures.join("; ")}`);
if (
  browserSummary.build?.sourceFingerprint !== galleryBuild.sourceFingerprint ||
  browserSummary.build?.artifactFingerprint !== galleryBuild.artifactFingerprint ||
  JSON.stringify(browserSummary.build?.packages) !== JSON.stringify(galleryBuild.packages)
) {
  throw new Error("Browser evidence fingerprints do not match the current gallery build; rerun pnpm gallery:browser");
}
if (!Array.isArray(browserSummary.evidenceFiles) || browserSummary.evidenceFiles.length === 0) throw new Error("Browser evidence file inventory is missing");
for (const record of browserSummary.evidenceFiles) {
  if (!record?.path || record.path.startsWith("/") || record.path.includes("..")) throw new Error(`Browser evidence path is invalid: ${record?.path ?? "missing"}`);
  const path = join(evidenceRoot, record.path);
  if (!existsSync(path)) throw new Error(`Browser evidence is missing ${record.path}`);
  if (statSync(path).size !== record.bytes || sha256(readFileSync(path)) !== record.sha256) throw new Error(`Browser evidence hash is stale for ${record.path}; rerun pnpm gallery:browser`);
}

const baseCommit = process.env.SANCHIKA_C2_BASE_COMMIT ?? git("merge-base", "HEAD", "origin/master");
const baseline = JSON.parse(readFileSync(join(evidenceRoot, "before/baseline.json"), "utf8"));
if (baseline.schemaVersion !== 1 || baseline.baseCommit !== baseCommit) throw new Error("Baseline evidence does not identify the C2 base commit");
if (!/^[a-f0-9]{64}$/.test(baseline.galleryBuild?.sourceFingerprint ?? "") || !/^[a-f0-9]{64}$/.test(baseline.galleryBuild?.artifactFingerprint ?? "")) throw new Error("Baseline gallery fingerprints are missing or malformed");
if (JSON.stringify(baseline.environment) !== JSON.stringify(browserSummary.environment)) throw new Error("Baseline and final browser environments differ; recapture the baseline with the final evidence browser");
if (JSON.stringify(baseline.captureProfile) !== JSON.stringify(browserSummary.captureProfile)) throw new Error("Baseline and final viewport, DPR, color-scheme, motion, forced-colors, or font conditions differ");
if (!Array.isArray(baseline.screenshots) || baseline.screenshots.length !== 3) throw new Error("Baseline screenshot inventory must contain mobile, tablet, and desktop captures");
for (const record of baseline.screenshots) {
  const path = join(evidenceRoot, record.path);
  if (!existsSync(path) || statSync(path).size !== record.bytes || sha256(readFileSync(path)) !== record.sha256) throw new Error(`Baseline screenshot hash is stale for ${record.path}`);
}

const files = listEvidenceFiles(evidenceRoot)
  .filter((path) => path !== manifestPath && !path.includes(`${join(evidenceRoot, ".playwright-cli")}/`))
  .map((path) => ({
    path: relative(evidenceRoot, path).replaceAll("\\", "/"),
    bytes: statSync(path).size,
    sha256: sha256(readFileSync(path)),
  }));

const manifest = {
  schemaVersion: 1,
  source: {
    baseCommit,
    headCommit: git("rev-parse", "HEAD"),
    branch: git("branch", "--show-current"),
    gallerySourceFingerprint: galleryBuild.sourceFingerprint,
    galleryArtifactFingerprint: galleryBuild.artifactFingerprint,
    packageFingerprints: galleryBuild.packages,
  },
  capture: {
    environment: browserSummary.environment,
    mobileLabProfile: browserSummary.performance?.profile,
    routeViewportCells: browserSummary.routes?.length ?? 0,
    axeRoutes: browserSummary.axe?.length ?? 0,
    axeNegativeControl: browserSummary.axeNegativeControl,
    build: browserSummary.build,
    captureProfile: browserSummary.captureProfile,
    browserEvidenceFiles: browserSummary.evidenceFiles.length,
    baseline,
  },
  compatibility: {
    localLink: "compatibility/local-link.log",
    packedTarball: "compatibility/packed-tarball.log",
  },
  files,
};
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

if (checkOnly) {
  if (!existsSync(manifestPath)) throw new Error("C2 evidence manifest is missing; run pnpm evidence:manifest");
  if (readFileSync(manifestPath, "utf8") !== serialized) throw new Error("C2 evidence manifest is stale; rerun pnpm evidence:manifest");
  console.log(`Sanchika C2 evidence manifest is current (${files.length} hashed files).`);
} else {
  writeFileSync(manifestPath, serialized);
  console.log(`Sanchika C2 evidence manifest written (${files.length} hashed files).`);
}

function git(...args) {
  return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" }).trim();
}

function listEvidenceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listEvidenceFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files.sort();
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

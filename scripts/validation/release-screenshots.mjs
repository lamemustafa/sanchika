import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { assertGalleryBuildArtifacts } from "./build-artifacts.mjs";

export const stableReleaseScreenshotSet = Object.freeze([
  Object.freeze({ file: "sanchika-gallery-landing-1440x1000.png", source: "final-routes/root-1440x1000.png" }),
  Object.freeze({ file: "sanchika-gallery-landing-390x844.png", source: "final-routes/root-390x844.png" }),
  Object.freeze({ file: "sanchika-gallery-axal-1440x1000.png", source: "final-routes/mode-axal-1440x1000.png" }),
  Object.freeze({ file: "sanchika-gallery-pack-1440x1000.png", source: "final-routes/mode-pack-1440x1000.png" }),
  Object.freeze({ file: "sanchika-gallery-tools-1440x1000.png", source: "final-routes/mode-tools-1440x1000.png" }),
  Object.freeze({ file: "sanchika-gallery-forced-colors-768x1024.png", source: "special-modes/forced-colors-focus-768x1024.png" }),
]);

export function loadStableReleaseScreenshots({ root }) {
  const evidenceRoot = join(root, "output/playwright/s8-gallery-showcase");
  const summaryPath = join(evidenceRoot, "browser/summary.json");
  if (!existsSync(summaryPath)) {
    throw new Error("Stable release browser summary is missing; run pnpm gallery:browser");
  }

  const galleryBuild = assertGalleryBuildArtifacts({ root, commandName: "pnpm release:stable-tarballs" });
  const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
  if (summary.failures?.length) {
    throw new Error(`Stable release browser evidence contains failures: ${summary.failures.join("; ")}`);
  }
  if (
    summary.build?.sourceFingerprint !== galleryBuild.sourceFingerprint ||
    summary.build?.artifactFingerprint !== galleryBuild.artifactFingerprint ||
    JSON.stringify(summary.build?.packages) !== JSON.stringify(galleryBuild.packages)
  ) {
    throw new Error("Stable release browser evidence does not match the current gallery build; rerun pnpm gallery:browser");
  }

  const records = new Map((summary.evidenceFiles ?? []).map((record) => [record.path, record]));
  return stableReleaseScreenshotSet.map(({ file, source }) => {
    const record = records.get(source);
    if (!record) throw new Error(`Stable release browser summary is missing ${source}`);
    const sourcePath = join(evidenceRoot, source);
    if (!existsSync(sourcePath)) throw new Error(`Stable release screenshot is missing ${source}`);
    const size = statSync(sourcePath).size;
    const sha256 = sha256File(sourcePath);
    if (record.bytes !== size || record.sha256 !== sha256) {
      throw new Error(`Stable release screenshot is stale for ${source}; rerun pnpm gallery:browser`);
    }
    return { file, source, path: sourcePath, size, sha256 };
  });
}

export function assertStableReleaseScreenshotRecords(screenshots) {
  if (!Array.isArray(screenshots)) throw new Error("stable release screenshots must be an array");
  const expectedFiles = stableReleaseScreenshotSet.map((entry) => entry.file);
  const actualFiles = screenshots.map((entry) => entry?.file);
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error(`stable release screenshots must follow ${expectedFiles.join(", ")}`);
  }
  for (const screenshot of screenshots) {
    if (!/^[0-9a-f]{64}$/.test(screenshot.sha256 ?? "")) {
      throw new Error(`${screenshot.file} must include a SHA-256 checksum`);
    }
    if (!screenshot.path || sha256File(screenshot.path) !== screenshot.sha256) {
      throw new Error(`${screenshot.file} checksum must match its final bytes`);
    }
    if (!Number.isSafeInteger(screenshot.size) || screenshot.size <= 0) {
      throw new Error(`${screenshot.file} must include a positive byte size`);
    }
  }
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

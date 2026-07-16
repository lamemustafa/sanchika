import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { assertGalleryBuildArtifacts } from "./build-artifacts.mjs";

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export const stableReleaseScreenshotSet = Object.freeze([
  Object.freeze({ file: "sanchika-gallery-landing-1440x1000.png", source: "release-routes/landing-1440x1000.png", width: 1440, height: 1000 }),
  Object.freeze({ file: "sanchika-gallery-landing-390x844.png", source: "release-routes/landing-390x844.png", width: 390, height: 844 }),
  Object.freeze({ file: "sanchika-gallery-axal-1440x1000.png", source: "release-routes/axal-1440x1000.png", width: 1440, height: 1000 }),
  Object.freeze({ file: "sanchika-gallery-pack-1440x1000.png", source: "release-routes/pack-1440x1000.png", width: 1440, height: 1000 }),
  Object.freeze({ file: "sanchika-gallery-tools-1440x1000.png", source: "release-routes/tools-1440x1000.png", width: 1440, height: 1000 }),
  Object.freeze({ file: "sanchika-gallery-forced-colors-768x1024.png", source: "release-routes/forced-colors-768x1024.png", width: 768, height: 1024 }),
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
  return stableReleaseScreenshotSet.map(({ file, source, width, height }) => {
    const record = records.get(source);
    if (!record) throw new Error(`Stable release browser summary is missing ${source}`);
    const sourcePath = join(evidenceRoot, source);
    if (!existsSync(sourcePath)) throw new Error(`Stable release screenshot is missing ${source}`);
    const bytes = readFileSync(sourcePath);
    const size = bytes.byteLength;
    const sha256 = sha256Bytes(bytes);
    if (record.bytes !== size || record.sha256 !== sha256) {
      throw new Error(`Stable release screenshot is stale for ${source}; rerun pnpm gallery:browser`);
    }
    assertPngDimensions({ bytes, file, width, height });
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
  for (const [index, screenshot] of screenshots.entries()) {
    const expected = stableReleaseScreenshotSet[index];
    if (screenshot.source !== expected.source) {
      throw new Error(`${screenshot.file} must use stable browser source ${expected.source}`);
    }
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

export function runReleaseScreenshotFixtures() {
  const validPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  const cases = [
    { name: "valid PNG dimensions", bytes: validPng, width: 1, height: 1, expected: null },
    { name: "wrong PNG width", bytes: validPng, width: 2, height: 1, expected: "must be exactly 2x1" },
    { name: "invalid PNG signature", bytes: Buffer.from(validPng).fill(0, 0, 8), width: 1, height: 1, expected: "valid PNG signature" },
    { name: "truncated PNG", bytes: validPng.subarray(0, validPng.length - 12), width: 1, height: 1, expected: "complete IEND chunk" },
  ];
  const failures = [];
  for (const entry of stableReleaseScreenshotSet) {
    if (!entry.file.endsWith(`-${entry.width}x${entry.height}.png`)) {
      failures.push(`${entry.file} must encode its expected ${entry.width}x${entry.height} dimensions`);
    }
  }
  for (const fixture of cases) {
    try {
      assertPngDimensions({ bytes: fixture.bytes, file: fixture.name, width: fixture.width, height: fixture.height });
      if (fixture.expected) failures.push(`${fixture.name}: expected ${fixture.expected}`);
    } catch (error) {
      if (!fixture.expected) failures.push(`${fixture.name}: failed unexpectedly with ${error.message}`);
      else if (!error.message.includes(fixture.expected)) failures.push(`${fixture.name}: expected ${fixture.expected}; received ${error.message}`);
    }
  }
  return { count: cases.length + stableReleaseScreenshotSet.length, failures };
}

function assertPngDimensions({ bytes, file, width, height }) {
  const buffer = bytes instanceof Uint8Array ? Buffer.from(bytes) : null;
  if (!buffer || buffer.byteLength < 45 || !buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error(`${file} must have a valid PNG signature and chunk structure`);
  }
  let offset = 8;
  let dimensions = null;
  let sawIend = false;
  while (offset + 12 <= buffer.byteLength) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const chunkEnd = offset + 12 + length;
    if (chunkEnd > buffer.byteLength) throw new Error(`${file} must have complete PNG chunks`);
    if (offset === 8 && (type !== "IHDR" || length !== 13)) {
      throw new Error(`${file} must start with a valid PNG IHDR chunk`);
    }
    if (type === "IHDR") {
      if (dimensions) throw new Error(`${file} must contain exactly one PNG IHDR chunk`);
      dimensions = {
        width: buffer.readUInt32BE(offset + 8),
        height: buffer.readUInt32BE(offset + 12),
      };
    }
    if (type === "IEND") {
      if (length !== 0 || chunkEnd !== buffer.byteLength) throw new Error(`${file} must end with a complete IEND chunk`);
      sawIend = true;
      break;
    }
    offset = chunkEnd;
  }
  if (!sawIend) throw new Error(`${file} must end with a complete IEND chunk`);
  if (dimensions?.width !== width || dimensions?.height !== height) {
    throw new Error(`${file} must be exactly ${width}x${height} pixels; found ${dimensions?.width ?? 0}x${dimensions?.height ?? 0}`);
  }
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

import { readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadReleaseManifest } from "./validation/release-manifest.mjs";
import {
  expectedStableReleaseAssetNames,
  validateLocalStableReleaseCheckout,
  validateLocalStableReleaseMatch,
  validatePublishedStableRelease,
  validatePublishedStableReleaseArtifacts,
} from "./validation/release-readiness.mjs";

const repositoryApi = "https://api.github.com/repos/lamemustafa/sanchika";
const githubHeaders = {
  accept: "application/vnd.github+json",
  "user-agent": "sanchika-pages-release-gate/1.0",
  "x-github-api-version": "2022-11-28",
};
const localReleaseDir = valueAfter("--local-release-dir");

const isPagesMasterBuild =
  process.env.GITHUB_ACTIONS === "true" &&
  process.env.GITHUB_WORKFLOW === "Pages" &&
  process.env.GITHUB_REF === "refs/heads/master";

if (!isPagesMasterBuild) {
  console.log("Sanchika published-release gate skipped outside the Pages master build.");
} else {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const manifest = loadReleaseManifest(`${root}/release.json`);
  const response = await fetch(`${repositoryApi}/releases/tags/v${manifest.version}`, { headers: githubHeaders });
  if (!response.ok) {
    throw new Error(`Refusing to deploy gallery status for v${manifest.version}: published GitHub release returned HTTP ${response.status}`);
  }
  const release = await response.json();
  const failures = validatePublishedStableRelease({ manifest, release });
  if (failures.length === 0) {
    try {
      const artifactBytes = await downloadReleaseAssets(release.assets);
      const artifactManifest = parseArtifactManifest(artifactBytes.get("manifest.json"));
      const checksumSummary = decodeText(artifactBytes.get("SHA256SUMS"), "SHA256SUMS");
      const tagCommit = await resolveTagCommit(release.tag_name);
      failures.push(...validatePublishedStableReleaseArtifacts({
        manifest,
        artifactManifest,
        checksumSummary,
        artifactBytes,
        tagCommit,
      }));
      if (localReleaseDir) {
        const localArtifactBytes = loadLocalReleaseAssets({
          root,
          relativeDir: localReleaseDir,
          expectedNames: expectedStableReleaseAssetNames(manifest.version),
        });
        const localArtifactManifest = parseArtifactManifest(localArtifactBytes.get("manifest.json"));
        const localChecksumSummary = decodeText(localArtifactBytes.get("SHA256SUMS"), "local SHA256SUMS");
        const localCheckout = validateLocalStableReleaseCheckout({
          checkoutCommit: process.env.GITHUB_SHA,
          tagCommit,
        });
        failures.push(...localCheckout.failures);
        if (localCheckout.compare) {
          failures.push(...validatePublishedStableReleaseArtifacts({
            manifest,
            artifactManifest: localArtifactManifest,
            checksumSummary: localChecksumSummary,
            artifactBytes: localArtifactBytes,
            tagCommit,
          }));
          failures.push(...validateLocalStableReleaseMatch({
            publishedArtifactManifest: artifactManifest,
            localArtifactManifest,
            publishedArtifactBytes: artifactBytes,
            localArtifactBytes,
          }));
        } else {
          console.log(`Sanchika local package-byte comparison skipped: Pages checkout ${process.env.GITHUB_SHA ?? "unknown"} is not release tag commit ${tagCommit}.`);
        }
      }
    } catch (error) {
      failures.push(error.message);
    }
  }
  if (failures.length) {
    throw new Error(`Refusing to deploy gallery status for v${manifest.version}:\n- ${failures.join("\n- ")}`);
  }
  console.log(`Sanchika published-release gate passed for v${manifest.version}.`);
}

async function downloadReleaseAssets(assets) {
  const entries = await Promise.all(assets.map(async (asset) => {
    const response = await fetch(asset.browser_download_url, { headers: githubHeaders });
    if (!response.ok) throw new Error(`published release asset ${asset.name} returned HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength !== asset.size) {
      throw new Error(`published release asset ${asset.name} downloaded ${bytes.byteLength} bytes; expected ${asset.size}`);
    }
    return [asset.name, bytes];
  }));
  return new Map(entries);
}

function parseArtifactManifest(bytes) {
  const text = decodeText(bytes, "manifest.json");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`published manifest.json is malformed JSON: ${error.message}`);
  }
}

function decodeText(bytes, name) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new Error(`published ${name} is not valid UTF-8: ${error.message}`);
  }
}

async function resolveTagCommit(tagName) {
  let object = await fetchGithubObject(`${repositoryApi}/git/ref/tags/${encodeURIComponent(tagName)}`, "tag reference");
  object = object.object;
  for (let depth = 0; depth < 5; depth += 1) {
    if (object?.type === "commit" && /^[0-9a-f]{40}$/.test(object.sha ?? "")) return object.sha;
    if (object?.type !== "tag" || !/^[0-9a-f]{40}$/.test(object.sha ?? "")) break;
    const tag = await fetchGithubObject(`${repositoryApi}/git/tags/${object.sha}`, "annotated tag");
    object = tag.object;
  }
  throw new Error(`published release tag ${tagName} does not resolve to a Git commit`);
}

async function fetchGithubObject(url, label) {
  const response = await fetch(url, { headers: githubHeaders });
  if (!response.ok) throw new Error(`published release ${label} returned HTTP ${response.status}`);
  return response.json();
}

function loadLocalReleaseAssets({ root, relativeDir, expectedNames }) {
  const normalized = normalize(relativeDir);
  if (isAbsolute(normalized) || normalized !== join("dist", "release")) {
    throw new Error("--local-release-dir must be dist/release");
  }
  const releaseRoot = join(root, normalized);
  const actualNames = readdirSync(releaseRoot).sort();
  if (JSON.stringify(actualNames) !== JSON.stringify([...expectedNames].sort())) {
    throw new Error(`local release assets must be exactly ${expectedNames.join(", ")}`);
  }
  return new Map(actualNames.map((name) => [name, new Uint8Array(readFileSync(join(releaseRoot, name)))]));
}

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

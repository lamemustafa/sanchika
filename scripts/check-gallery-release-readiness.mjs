import { fileURLToPath } from "node:url";
import { loadReleaseManifest } from "./validation/release-manifest.mjs";
import { validatePublishedStableRelease } from "./validation/release-readiness.mjs";

const isPagesMasterBuild =
  process.env.GITHUB_ACTIONS === "true" &&
  process.env.GITHUB_WORKFLOW === "Pages" &&
  process.env.GITHUB_REF === "refs/heads/master";

if (!isPagesMasterBuild) {
  console.log("Sanchika published-release gate skipped outside the Pages master build.");
} else {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const manifest = loadReleaseManifest(`${root}/release.json`);
  const response = await fetch(`https://api.github.com/repos/lamemustafa/sanchika/releases/tags/v${manifest.version}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "sanchika-pages-release-gate/1.0",
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`Refusing to deploy gallery status for v${manifest.version}: published GitHub release returned HTTP ${response.status}`);
  }
  const failures = validatePublishedStableRelease({ manifest, release: await response.json() });
  if (failures.length) {
    throw new Error(`Refusing to deploy gallery status for v${manifest.version}:\n- ${failures.join("\n- ")}`);
  }
  console.log(`Sanchika published-release gate passed for v${manifest.version}.`);
}

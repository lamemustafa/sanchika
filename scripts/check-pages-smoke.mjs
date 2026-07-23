const defaultUrl = "https://sanchika.complyeaze.com/";
const targetUrl = process.env.SANCHIKA_PAGES_URL || defaultUrl;
const expectedReleaseVersion = process.env.SANCHIKA_EXPECTED_RELEASE_VERSION;
const githubToken = process.env.GITHUB_TOKEN;
const timeoutMs = Number.parseInt(process.env.SANCHIKA_PAGES_TIMEOUT_MS || "15000", 10);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

const requiredFragments = [
  '<html lang="en" data-sanchika-gallery-document="production">',
  "<title>Sanchika | Interface contracts that show their work</title>",
  '<meta name="description"',
  '<link rel="canonical" href="https://sanchika.complyeaze.com/">',
  "Make regulated interfaces that show their work.",
  "Sanchika gives coding agents and engineers a repeatable way to turn source, uncertainty, and human review into clear, accessible product UI.",
  "It supplies contracts and a review loop—not compliance judgment, customer evidence, or an application runtime.",
  "Leave room for the human who must decide.",
  "One grammar. Four working conditions.",
  "Contracts first. Craft loop clearly labelled.",
  "Pilot-stage craft loop",
  "Useful, bounded, and still in review.",
  "No next package release is currently announced.",
  'href="/sanchika-manifest.json"',
  'href="/llms.txt"',
  '<link rel="stylesheet" href="/_astro/',
];

const staleFragments = [
  "<h1 id=\"gallery-title\">Sanchika Primitive Gallery</h1>",
  "<p class=\"sk-gallery-section-kicker\">Harness loop</p>",
  "11 color roles loaded.",
  "Package contracts are visible. Product readiness still requires consumer evidence.",
  "/lab/",
];

try {
  const response = await fetch(targetUrl, {
    headers: {
      "user-agent": "sanchika-pages-smoke/1.0",
    },
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`Expected HTTP 2xx from ${targetUrl}, received ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error(`Expected text/html from ${targetUrl}, received ${contentType || "no content-type"}`);
  }

  const body = await response.text();
  const missingFragments = requiredFragments.filter((fragment) => !body.includes(fragment));
  if (missingFragments.length > 0) {
    throw new Error(`Sanchika Pages response is missing fragments: ${missingFragments.join(", ")}`);
  }

  const staleMatches = staleFragments.filter((fragment) => body.includes(fragment));
  if (staleMatches.length > 0) {
    throw new Error(`Sanchika Pages response still contains stale fragments: ${staleMatches.join(", ")}`);
  }

  const origin = new URL(targetUrl).origin;
  const releaseMetadataUrl = expectedReleaseVersion
    ? `https://api.github.com/repos/lamemustafa/sanchika/releases/tags/v${expectedReleaseVersion}`
    : "https://api.github.com/repos/lamemustafa/sanchika/releases/latest";
  const [manifestResponse, llmsResponse, releaseMetadataResponse] = await Promise.all([
    fetch(`${origin}/sanchika-manifest.json`, { signal: controller.signal }),
    fetch(`${origin}/llms.txt`, { signal: controller.signal }),
    fetch(releaseMetadataUrl, {
      headers: {
        accept: "application/vnd.github+json",
        ...(githubToken ? { authorization: `Bearer ${githubToken}` } : {}),
        "user-agent": "sanchika-pages-smoke/1.0",
      },
      signal: controller.signal,
    }),
  ]);
  if (!manifestResponse.ok || !llmsResponse.ok) throw new Error("Expected generated manifest and llms.txt endpoints to return HTTP 2xx");
  const manifest = await manifestResponse.json();
  const llms = await llmsResponse.text();
  const liveReleaseVersion = manifest.releases?.currentStable?.version;
  if (!/^\d+\.\d+\.\d+$/.test(liveReleaseVersion ?? "") || manifest.releases?.currentStable?.status !== "released-current" || manifest.releases?.currentStable?.url !== `https://github.com/lamemustafa/sanchika/releases/tag/v${liveReleaseVersion}` || manifest.releases?.next !== null || manifest.releases?.nextAnnouncement !== "No next package release is currently announced." || Object.hasOwn(manifest.releases ?? {}, "planned")) throw new Error("Generated manifest release state is not truthful");
  if (!releaseMetadataResponse.ok) throw new Error(`Expected GitHub release metadata to return HTTP 2xx; received ${releaseMetadataResponse.status}`);
  const publishedRelease = await releaseMetadataResponse.json();
  if (publishedRelease.draft || publishedRelease.prerelease || !/^v\d+\.\d+\.\d+$/.test(publishedRelease.tag_name ?? "")) throw new Error("GitHub release metadata is not one published stable semantic version");
  const authoritativeReleaseVersion = expectedReleaseVersion ?? publishedRelease.tag_name.slice(1);
  if (publishedRelease.tag_name !== `v${authoritativeReleaseVersion}`) throw new Error(`Expected GitHub release v${authoritativeReleaseVersion}, received ${String(publishedRelease.tag_name)}`);
  if (liveReleaseVersion !== authoritativeReleaseVersion) throw new Error(`Expected live stable release v${authoritativeReleaseVersion}, received v${String(liveReleaseVersion)}`);
  if (!body.includes(`href="https://github.com/lamemustafa/sanchika/releases/tag/v${liveReleaseVersion}"`) || !body.includes("Tokens, primitives, and patterns are the stable package set.")) throw new Error("Landing release status does not agree with the generated manifest");
  if (!llms.includes(`Current stable release: v${liveReleaseVersion}. GitHub release artifacts; not published to npm.`) || !llms.includes("No next package release is currently announced.")) throw new Error("Generated llms.txt release boundary is missing");

  console.log(`Sanchika Pages smoke check passed for ${targetUrl}`);
} catch (error) {
  console.error("Sanchika Pages smoke check failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}

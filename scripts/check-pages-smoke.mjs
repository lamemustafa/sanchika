const defaultUrl = "https://sanchika.complyeaze.com/";
const targetUrl = process.env.SANCHIKA_PAGES_URL || defaultUrl;
const timeoutMs = Number.parseInt(process.env.SANCHIKA_PAGES_TIMEOUT_MS || "15000", 10);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

const requiredFragments = [
  '<html lang="en" data-sanchika-gallery-document="production">',
  "<title>Sanchika | Evidence-first interface contracts</title>",
  '<meta name="description"',
  '<link rel="canonical" href="https://sanchika.complyeaze.com/">',
  "Build compliance interfaces that show their evidence.",
  "Composed package proof",
  "Related by evidence. Different by work.",
  "Find the contract behind the interface.",
  "Proven, limited, current.",
  "Current stable release: v0.1.0",
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
  const [manifestResponse, llmsResponse] = await Promise.all([
    fetch(`${origin}/sanchika-manifest.json`, { signal: controller.signal }),
    fetch(`${origin}/llms.txt`, { signal: controller.signal }),
  ]);
  if (!manifestResponse.ok || !llmsResponse.ok) throw new Error("Expected generated manifest and llms.txt endpoints to return HTTP 2xx");
  const manifest = await manifestResponse.json();
  const llms = await llmsResponse.text();
  if (manifest.releases?.currentStable?.version !== "0.1.0" || manifest.releases?.currentStable?.status !== "released-current" || manifest.releases?.next !== null || Object.hasOwn(manifest.releases ?? {}, "planned")) throw new Error("Generated manifest release state is not truthful");
  if (!llms.includes("Current stable release: v0.1.0. GitHub release artifacts; not published to npm.") || !llms.includes("No next package release is currently announced.")) throw new Error("Generated llms.txt release boundary is missing");

  console.log(`Sanchika Pages smoke check passed for ${targetUrl}`);
} catch (error) {
  console.error("Sanchika Pages smoke check failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}

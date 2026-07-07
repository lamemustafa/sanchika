const defaultUrl = "https://sanchika.complyeaze.com/";
const targetUrl = process.env.SANCHIKA_PAGES_URL || defaultUrl;
const timeoutMs = Number.parseInt(process.env.SANCHIKA_PAGES_TIMEOUT_MS || "15000", 10);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

const requiredFragments = [
  '<html lang="en" data-sanchika-gallery-document="primitive">',
  "<title>Sanchika | Design evidence system</title>",
  '<meta name="description"',
  '<link rel="canonical" href="https://sanchika.complyeaze.com/">',
  "data-sanchika-gallery=\"primitive\"",
  "data-sk-synthetic-disclaimer",
  "Interfaces that survive compliance review.",
  "A design system that can defend itself.",
  "Current public evidence ledger",
  "Static HTML, CSS, and package contracts",
  "Use Sanchika as evidence, not authority.",
  "assets/theme.css",
  "assets/primitives.css",
];

const staleFragments = [
  "<h1 id=\"gallery-title\">Sanchika Primitive Gallery</h1>",
  "<p class=\"sk-gallery-section-kicker\">Harness loop</p>",
  "11 color roles loaded.",
  "Package contracts are visible. Product readiness still requires consumer evidence.",
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

  console.log(`Sanchika Pages smoke check passed for ${targetUrl}`);
} catch (error) {
  console.error("Sanchika Pages smoke check failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}

const defaultUrl = "https://lamemustafa.github.io/sanchika/";
const targetUrl = process.env.SANCHIKA_PAGES_URL || defaultUrl;
const timeoutMs = Number.parseInt(process.env.SANCHIKA_PAGES_TIMEOUT_MS || "15000", 10);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

const requiredFragments = [
  '<html lang="en" data-sanchika-gallery-document="primitive">',
  "<title>Sanchika Primitive Gallery</title>",
  "data-sanchika-gallery=\"primitive\"",
  "data-sk-synthetic-disclaimer",
  "assets/theme.css",
  "assets/primitives.css",
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

  console.log(`Sanchika Pages smoke check passed for ${targetUrl}`);
} catch (error) {
  console.error("Sanchika Pages smoke check failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}

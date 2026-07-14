import { posix } from "node:path";

const executableExtensions = new Set([".js", ".mjs", ".cjs"]);
const metadataScriptTypes = new Set(["application/ld+json", "application/json"]);
const galleryOrigin = "https://sanchika.complyeaze.com";

export function inspectGalleryAssetGraph({
  html,
  outputFiles,
  allowUnreferencedStylesheets = false,
  allowedInlineScriptMarker = null,
  allowedInlineScriptMarkers = [],
}) {
  const failures = [];
  const activeHtml = html.replace(/<!--[\s\S]*?-->/g, "");
  const stylesheetPaths = [];
  const seenStylesheets = new Set();
  const allowedScriptMarkers = new Set([allowedInlineScriptMarker, ...allowedInlineScriptMarkers].filter(Boolean));

  for (const match of activeHtml.matchAll(/<link\b([^>]*)>/gi)) {
    const attributes = parseAttributes(match[1]);
    const rel = attributes.get("rel")?.toLowerCase().split(/\s+/) ?? [];
    if (!rel.includes("stylesheet")) continue;

    const href = attributes.get("href");
    if (!href) {
      failures.push("stylesheet link must declare href");
      continue;
    }

    const resolved = resolveOutputHref(href);
    if (!resolved.path) {
      failures.push(resolved.failure);
      continue;
    }
    if (seenStylesheets.has(resolved.path)) {
      failures.push(`stylesheet ${resolved.path} must be referenced exactly once`);
      continue;
    }
    seenStylesheets.add(resolved.path);

    if (!outputFiles.has(resolved.path)) {
      failures.push(`referenced stylesheet ${resolved.path} is missing from gallery output`);
      continue;
    }
    stylesheetPaths.push(resolved.path);
  }

  const emittedCss = [...outputFiles.keys()].filter((path) => path.endsWith(".css")).sort();
  for (const path of emittedCss) {
    if (!allowUnreferencedStylesheets && !seenStylesheets.has(path)) {
      failures.push(`emitted stylesheet ${path} is not referenced by index.html`);
    }
  }
  if (stylesheetPaths.length === 0) failures.push("index.html must reference generated CSS");

  const clientJavaScriptInventory = [...outputFiles.keys()]
    .filter((path) => executableExtensions.has(posix.extname(path).toLowerCase()))
    .sort();
  for (const path of clientJavaScriptInventory) {
    failures.push(`gallery output must not emit client JavaScript file ${path}`);
  }

  let scriptIndex = 0;
  const allowedInlineScriptInventory = [];
  for (const match of activeHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    scriptIndex += 1;
    const attributes = parseAttributes(match[1]);
    const type = attributes.get("type")?.toLowerCase() ?? "";
    const src = attributes.get("src");
    if (metadataScriptTypes.has(type) && !src) continue;
    const marker = attributes.get("data-sanchika-gallery-script") ?? attributes.get("data-sanchika-lab-script");
    if (!src && allowedScriptMarkers.has(marker)) {
      allowedInlineScriptInventory.push(marker);
      continue;
    }
    failures.push(
      src
        ? `index.html script #${scriptIndex} must not load client JavaScript from ${src}`
        : `index.html script #${scriptIndex} must be non-executable metadata`,
    );
  }

  return {
    failures,
    stylesheetPaths,
    stylesheets: stylesheetPaths.map((path) => ({ name: path, css: outputFiles.get(path) ?? "" })),
    clientJavaScriptInventory,
    allowedInlineScriptInventory,
  };
}

export function findCanonicalLabRouteLinks({ html, expectedLabDocuments }) {
  const expectedPaths = new Set(expectedLabDocuments.flatMap((path) => labRoutePathVariants(path)));
  const activeHtml = html.replace(/<!--[\s\S]*?-->/g, "");
  const matches = [];

  for (const match of activeHtml.matchAll(/<a\b([^>]*)>/gi)) {
    const href = parseAttributes(match[1]).get("href");
    if (!href) continue;

    let url;
    try {
      url = new URL(href, `${galleryOrigin}/`);
    } catch {
      continue;
    }
    if (url.origin !== galleryOrigin) continue;

    let pathname;
    try {
      pathname = normalizeRoutePath(url.pathname);
    } catch {
      continue;
    }
    if (expectedPaths.has(pathname)) matches.push(href);
  }

  return matches;
}

export function runGalleryOutputFixtures() {
  const validHtml = '<link rel="stylesheet" href="/_astro/current.css"><script type="application/ld+json">{"name":"Sanchika"}</script>';
  const validFiles = new Map([
    ["index.html", validHtml],
    ["_astro/current.css", ":root { --sk-ink: black; }"],
  ]);
  const fixtures = [
    { name: "referenced stylesheet and JSON-LD metadata", html: validHtml, files: validFiles, expected: null },
    {
      name: "named lab enhancement may be explicitly allowed",
      html: '<link rel="stylesheet" href="/_astro/current.css"><script data-sanchika-lab-script="tool-filter">document.documentElement.dataset.enhanced = "true";</script>',
      files: validFiles,
      options: { allowedInlineScriptMarker: "tool-filter" },
      expected: null,
    },
    {
      name: "missing referenced stylesheet",
      html: '<link rel="stylesheet" href="/_astro/missing.css">',
      files: new Map([["index.html", ""]]),
      expected: "referenced stylesheet _astro/missing.css is missing",
    },
    {
      name: "unreferenced CSS cannot mask the referenced asset",
      html: '<link rel="stylesheet" href="/_astro/current.css">',
      files: new Map([...validFiles, ["_astro/stale.css", ":root { --sk-missing: red; }"]]),
      expected: "emitted stylesheet _astro/stale.css is not referenced",
    },
    {
      name: "unreferenced JavaScript chunk",
      html: validHtml,
      files: new Map([...validFiles, ["_astro/island.js", "export {};" ]]),
      expected: "must not emit client JavaScript file _astro/island.js",
    },
    {
      name: "executable inline script",
      html: '<link rel="stylesheet" href="/_astro/current.css"><script>window.boot = true;</script>',
      files: validFiles,
      expected: "must be non-executable metadata",
    },
    {
      name: "external stylesheet",
      html: '<link rel="stylesheet" href="https://example.com/theme.css">',
      files: validFiles,
      expected: "must stay on https://sanchika.complyeaze.com",
    },
  ];

  const failures = [];
  for (const fixture of fixtures) {
    const findings = inspectGalleryAssetGraph({
      html: fixture.html,
      outputFiles: fixture.files,
      ...fixture.options,
    }).failures;
    const matched = fixture.expected
      ? findings.some((finding) => finding.includes(fixture.expected))
      : findings.length === 0;
    if (!matched) {
      failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join(", ") || "success"}`);
    }
  }

  const expectedLabDocuments = ["lab/tools-directory/index.html"];
  const labLinkFixtures = [
    { name: "relative lab route", href: "/lab/tools-directory/", expected: true },
    {
      name: "absolute lab route with query and hash",
      href: "https://sanchika.complyeaze.com/lab/tools-directory/?view=all#results",
      expected: true,
    },
    { name: "lab route without trailing slash", href: "/lab/tools-directory", expected: true },
    { name: "lab output document path", href: "/lab/tools-directory/index.html", expected: true },
    { name: "external lookalike route", href: "https://example.com/lab/tools-directory/", expected: false },
    { name: "malformed encoded route", href: "/lab/%E0%A4%A", expected: false },
  ];

  for (const fixture of labLinkFixtures) {
    const matches = findCanonicalLabRouteLinks({
      html: `<a href="${fixture.href}">Reference</a>`,
      expectedLabDocuments,
    });
    if ((matches.length > 0) !== fixture.expected) {
      failures.push(`${fixture.name}: expected lab link match ${fixture.expected}; found ${matches.length > 0}`);
    }
  }

  return { count: fixtures.length + labLinkFixtures.length, failures };
}

function labRoutePathVariants(path) {
  const documentPath = normalizeRoutePath(`/${path}`);
  const routePath = normalizeRoutePath(`/${path.replace(/index\.html$/i, "")}`);
  return [documentPath, routePath];
}

function normalizeRoutePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = posix.normalize(decoded.startsWith("/") ? decoded : `/${decoded}`);
  return normalized === "/" ? normalized : normalized.replace(/\/$/, "");
}

function resolveOutputHref(href) {
  let url;
  try {
    url = new URL(href, `${galleryOrigin}/`);
  } catch {
    return { path: null, failure: `stylesheet href ${href} must be a valid URL` };
  }
  if (url.origin !== galleryOrigin) {
    return { path: null, failure: `stylesheet href ${href} must stay on ${galleryOrigin}` };
  }

  const path = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  if (!path || path.split("/").includes("..") || !path.endsWith(".css")) {
    return { path: null, failure: `stylesheet href ${href} must resolve to a CSS file inside gallery output` };
  }
  return { path: posix.normalize(path), failure: null };
}

function parseAttributes(source) {
  const attributes = new Map();
  for (const match of source.matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

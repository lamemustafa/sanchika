import { posix } from "node:path";

const executableExtensions = new Set([".js", ".mjs", ".cjs"]);
const metadataScriptTypes = new Set(["application/ld+json", "application/json"]);
const galleryOrigin = "https://sanchika.complyeaze.com";

export function inspectGalleryAssetGraph({ html, outputFiles }) {
  const failures = [];
  const activeHtml = html.replace(/<!--[\s\S]*?-->/g, "");
  const stylesheetPaths = [];
  const seenStylesheets = new Set();

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
    if (!seenStylesheets.has(path)) failures.push(`emitted stylesheet ${path} is not referenced by index.html`);
  }
  if (stylesheetPaths.length === 0) failures.push("index.html must reference generated CSS");

  const clientJavaScriptInventory = [...outputFiles.keys()]
    .filter((path) => executableExtensions.has(posix.extname(path).toLowerCase()))
    .sort();
  for (const path of clientJavaScriptInventory) {
    failures.push(`gallery output must not emit client JavaScript file ${path}`);
  }

  let scriptIndex = 0;
  for (const match of activeHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    scriptIndex += 1;
    const attributes = parseAttributes(match[1]);
    const type = attributes.get("type")?.toLowerCase() ?? "";
    const src = attributes.get("src");
    if (metadataScriptTypes.has(type) && !src) continue;
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
  };
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
    const findings = inspectGalleryAssetGraph({ html: fixture.html, outputFiles: fixture.files }).failures;
    const matched = fixture.expected
      ? findings.some((finding) => finding.includes(fixture.expected))
      : findings.length === 0;
    if (!matched) {
      failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join(", ") || "success"}`);
    }
  }
  return { count: fixtures.length, failures };
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

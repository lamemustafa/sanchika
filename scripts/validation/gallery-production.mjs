const canonicalOrigin = "https://sanchika.complyeaze.com";

export function validateGalleryProduction({ outputFiles, expectedDocumentPaths, stableRelease, packageEntrypoints }) {
  const failures = [];
  const fail = (message) => failures.push(message);
  const index = outputFiles.get("index.html") ?? "";
  const manifestText = outputFiles.get("sanchika-manifest.json") ?? "";
  const llms = outputFiles.get("llms.txt") ?? "";
  const sitemap = outputFiles.get("sitemap.xml") ?? "";
  let manifest;

  for (const path of expectedDocumentPaths) {
    if (!outputFiles.has(path)) fail(`shipping route output is missing ${path}`);
  }
  for (const path of outputFiles.keys()) {
    if (/(^|\/)lab(\/|$)/i.test(path)) fail(`lab route entered shipping output: ${path}`);
  }

  try { manifest = JSON.parse(manifestText); }
  catch { fail("sanchika-manifest.json must be valid JSON"); }
  if (manifest) {
    if (manifest.schemaVersion !== "1.0.0" || manifest.project !== "Sanchika") fail("manifest schema and project identity must remain explicit");
    if (manifest.sourceRepository !== "https://github.com/lamemustafa/sanchika") fail("manifest source repository must remain public and canonical");
    if (manifest.releases?.currentStable?.version !== stableRelease || manifest.releases?.currentStable?.status !== "released") fail("manifest current stable release must match release.json");
    if (manifest.releases?.planned?.version === "0.1.0" && manifest.releases?.planned?.status === "released") fail("manifest must not claim v0.1.0 is released");
    const actualPackageNames = (manifest.packages ?? []).map((pkg) => pkg.name).sort();
    const canonicalPackageNames = Object.keys(packageEntrypoints).sort();
    if (JSON.stringify(actualPackageNames) !== JSON.stringify(canonicalPackageNames)) fail("manifest packages must match the canonical package set");
    for (const pkg of manifest.packages ?? []) {
      const expectedEntrypoints = packageEntrypoints[pkg.name];
      const actualEntrypoints = Array.isArray(pkg.entrypoints) ? [...pkg.entrypoints] : [];
      if (!expectedEntrypoints || JSON.stringify(actualEntrypoints) !== JSON.stringify(expectedEntrypoints)) {
        fail(`invalid manifest package entrypoint for ${pkg.name ?? "unknown package"}`);
      }
    }
    const manifestRoutes = (manifest.routes ?? []).map((entry) => new URL(entry.url, canonicalOrigin).pathname);
    if (new Set(manifestRoutes).size !== manifestRoutes.length) fail("manifest routes must not contain duplicates");
    if (manifestRoutes.some((route) => route.startsWith("/lab/"))) fail("manifest routes must not contain lab routes");
    for (const path of expectedDocumentPaths) {
      const route = documentPathToRoute(path);
      if (!manifestRoutes.includes(route)) fail(`manifest route inventory is missing ${route}`);
    }
  }

  const searchRoutes = [...index.matchAll(/<a\b(?=[^>]*\bdata-docs-search-item\b)[^>]*\bhref="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  if (searchRoutes.length === 0) fail("landing search index must contain generated route entries");
  if (new Set(searchRoutes).size !== searchRoutes.length) fail("duplicate route in search index");
  for (const route of searchRoutes) {
    if (route.startsWith("/lab/")) fail(`deleted route still in search: ${route}`);
    const target = routeToDocumentPath(route);
    if (!outputFiles.has(target)) fail(`search target is missing shipping output: ${route}`);
  }
  if (manifest && searchRoutes.length !== manifest.routes.length) fail("search index and manifest route inventories must have equal coverage");

  for (const path of expectedDocumentPaths.filter((path) => /^(?:patterns|primitives)\/.+\/index\.html$/.test(path))) {
    if (!(outputFiles.get(path) ?? "").includes("Composed synthetic exemplar")) fail(`missing detail-page exemplar in ${path}`);
  }

  for (const [path, content] of outputFiles) {
    if (!path.endsWith(".html")) continue;
    if (/\b(?:S\d+|C\d+|North Star(?:s)?)\b/.test(content)) fail(`${path} must not expose internal planning vocabulary`);
    if (/https:\/\/github\.com\/lamemustafa\/sanchika\/blob\/master\/apps\/gallery\/src\//.test(content)) fail(`${path} must not link to an unmerged gallery source path on master`);
  }

  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  for (const path of expectedDocumentPaths) {
    const url = `${canonicalOrigin}${documentPathToRoute(path)}`;
    if (!sitemapLocations.includes(url)) fail(`sitemap is missing ${url}`);
  }
  if (sitemapLocations.some((url) => new URL(url).pathname.startsWith("/lab/"))) fail("sitemap must not contain lab routes");

  if (!llms.includes(`Current stable release: v${stableRelease}.`)) fail("llms.txt must be generated from the current stable release");
  if (!llms.includes("https://github.com/lamemustafa/sanchika")) fail("llms.txt must cite the canonical source repository");
  if (manifest) {
    const expectedLlmsFacts = [
      ...(manifest.documentation ?? []).map((entry) => `- ${entry.label}: ${entry.url}`),
      ...(manifest.productModes ?? []).map((mode) => `- ${mode.label}: ${mode.purpose} — ${mode.route}`),
      ...(manifest.trustAndAccessibilityRules ?? []).map((rule) => `- ${rule}`),
      ...(manifest.limitations ?? []).map((limitation) => `- ${limitation}`),
      ...(manifest.preferredSources ?? []).map((source) => `- ${source.label}: ${source.url}`),
    ];
    if (!manifest.documentation?.length || !manifest.productModes?.length || !manifest.trustAndAccessibilityRules?.length || !manifest.limitations?.length || !manifest.preferredSources?.length) {
      fail("manifest must expose canonical llms.txt source metadata");
    }
    for (const fact of expectedLlmsFacts) if (!llms.includes(fact)) fail(`llms.txt diverged from canonical metadata: ${fact}`);
  }
  if (/\/Users\/|\.worktrees|\bS8\b|\bS9\b|\bC2\b|\bNorth Star(?:s)?\b/.test(llms)) fail("llms.txt must not expose private paths or internal planning vocabulary");
  if (/v0\.1\.0\s+(?:is\s+)?released/i.test(llms)) fail("llms.txt must not claim v0.1.0 is released");
  if (!index.includes("Build compliance interfaces that show their evidence.")) fail("landing source must render the S8 outcome-first hero");
  if (!index.includes("Related by evidence. Different by work.")) fail("landing must render the four-mode comparison");
  if (!index.includes("Proven, limited, planned.")) fail("landing must expose honest status treatment");

  for (const [path, content] of outputFiles) {
    if (/\/Users\/|\.worktrees/.test(content)) fail(`${path} must not expose a local private path`);
  }
  return failures;
}

export function runGalleryProductionFixtures() {
  const expectedDocumentPaths = ["index.html", "patterns/reviewdeskpreview/index.html"];
  const manifest = {
    schemaVersion: "1.0.0",
    project: "Sanchika",
    sourceRepository: "https://github.com/lamemustafa/sanchika",
    releases: { currentStable: { version: "0.0.2", status: "released" }, planned: { version: "0.1.0", status: "planned-not-released" } },
    packages: [{ name: "@sanchika/tokens", entrypoints: ["@sanchika/tokens", "@sanchika/tokens/theme.css"] }],
    routes: [
      { url: `${canonicalOrigin}/`, kind: "overview", label: "Sanchika" },
      { url: `${canonicalOrigin}/patterns/reviewdeskpreview/`, kind: "pattern", label: "ReviewDeskPreview" },
    ],
    documentation: [{ label: "Patterns", url: `${canonicalOrigin}/patterns/` }],
    productModes: [{ id: "axal", label: "Axal / workspace", purpose: "Keep evidence and judgment together.", route: `${canonicalOrigin}/modes/axal/` }],
    trustAndAccessibilityRules: ["Keep human judgment explicit."],
    limitations: ["Physical assistive-technology testing remains necessary."],
    preferredSources: [{ label: "Source", url: "https://github.com/lamemustafa/sanchika" }],
  };
  const validIndex = '<main><h1>Build compliance interfaces that show their evidence.</h1><h2>Related by evidence. Different by work.</h2><h2>Proven, limited, planned.</h2><a href="/" data-docs-search-item>Home</a><a href="/patterns/reviewdeskpreview/" data-docs-search-item>ReviewDeskPreview</a></main>';
  const validLlms = [
    "# Sanchika",
    "Current stable release: v0.0.2.",
    "- Patterns: https://sanchika.complyeaze.com/patterns/",
    "- Axal / workspace: Keep evidence and judgment together. — https://sanchika.complyeaze.com/modes/axal/",
    "- Keep human judgment explicit.",
    "- Physical assistive-technology testing remains necessary.",
    "- Source: https://github.com/lamemustafa/sanchika",
    "",
  ].join("\n");
  const valid = new Map([
    ["index.html", validIndex],
    ["patterns/reviewdeskpreview/index.html", "<main><h1>ReviewDeskPreview</h1><h2>Composed synthetic exemplar</h2></main>"],
    ["sanchika-manifest.json", `${JSON.stringify(manifest)}\n`],
    ["llms.txt", validLlms],
    ["sitemap.xml", `<urlset><url><loc>${canonicalOrigin}/</loc></url><url><loc>${canonicalOrigin}/patterns/reviewdeskpreview/</loc></url></urlset>`],
  ]);
  const cases = [
    { name: "valid generated production gallery", mutate: (files) => files, expected: null },
    { name: "deleted route still in search", mutate: (files) => replace(files, "index.html", "</main>", '<a href="/lab/retired/" data-docs-search-item>Retired</a></main>'), expected: "deleted route still in search" },
    { name: "duplicate route in search", mutate: (files) => replace(files, "index.html", "</main>", '<a href="/" data-docs-search-item>Duplicate</a></main>'), expected: "duplicate route in search" },
    { name: "lab route entering shipping output", mutate: (files) => new Map([...files, ["lab/retired/index.html", "<main><h1>Retired</h1></main>"]]), expected: "lab route entered shipping output" },
    { name: "prefix-valid nonexistent manifest package entrypoint", mutate: (files) => mutateManifest(files, (value) => { value.packages[0].entrypoints = ["@sanchika/tokens", "@sanchika/tokens/missing.css"]; }), expected: "invalid manifest package entrypoint" },
    { name: "manifest claiming released v0.1.0", mutate: (files) => mutateManifest(files, (value) => { value.releases.planned.status = "released"; }), expected: "must not claim v0.1.0 is released" },
    { name: "manually divergent llms content", mutate: (files) => new Map([...files].map(([path, content]) => [path, path === "llms.txt" ? content.replace("v0.0.2", "v9.9.9") : content])), expected: "llms.txt must be generated" },
    { name: "llms mode fact diverging from canonical metadata", mutate: (files) => replace(files, "llms.txt", "Axal / workspace", "Axal / stale mode"), expected: "llms.txt diverged from canonical metadata" },
    { name: "llms documentation route diverging from canonical metadata", mutate: (files) => replace(files, "llms.txt", "/patterns/", "/stale-patterns/"), expected: "llms.txt diverged from canonical metadata" },
    { name: "llms trust rule diverging from canonical metadata", mutate: (files) => replace(files, "llms.txt", "Keep human judgment explicit.", "Trust automation."), expected: "llms.txt diverged from canonical metadata" },
    { name: "missing detail-page exemplar", mutate: (files) => replace(files, "patterns/reviewdeskpreview/index.html", "Composed synthetic exemplar", "Contract"), expected: "missing detail-page exemplar" },
    { name: "public HTML exposing phase vocabulary", mutate: (files) => replace(files, "index.html", "</main>", "<p>pending C2</p></main>"), expected: "must not expose internal planning vocabulary" },
    { name: "public HTML exposing programme vocabulary", mutate: (files) => replace(files, "index.html", "</main>", "<p>Four North Star references</p></main>"), expected: "must not expose internal planning vocabulary" },
    { name: "gallery source link that cannot exist before merge", mutate: (files) => replace(files, "index.html", "</main>", '<a href="https://github.com/lamemustafa/sanchika/blob/master/apps/gallery/src/content/showcase.ts">source</a></main>'), expected: "must not link to an unmerged gallery source path" },
  ];
  const failures = [];
  for (const fixture of cases) {
    const findings = validateGalleryProduction({
      outputFiles: fixture.mutate(new Map(valid)),
      expectedDocumentPaths,
      stableRelease: "0.0.2",
      packageEntrypoints: { "@sanchika/tokens": ["@sanchika/tokens", "@sanchika/tokens/theme.css"] },
    });
    const matched = fixture.expected ? findings.some((finding) => finding.includes(fixture.expected)) : findings.length === 0;
    if (!matched) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join("; ") || "success"}`);
  }
  return { count: cases.length, failures };
}

function replace(files, path, before, after) {
  const copy = new Map(files);
  copy.set(path, (copy.get(path) ?? "").replace(before, after));
  return copy;
}

function mutateManifest(files, mutate) {
  const copy = new Map(files);
  const manifest = JSON.parse(copy.get("sanchika-manifest.json"));
  mutate(manifest);
  copy.set("sanchika-manifest.json", `${JSON.stringify(manifest)}\n`);
  return copy;
}

function routeToDocumentPath(route) {
  if (route === "/") return "index.html";
  return `${route.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
}

function documentPathToRoute(path) {
  if (path === "index.html") return "/";
  return `/${path.replace(/index\.html$/, "")}`;
}

function visibleText(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim();
}

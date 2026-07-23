const canonicalOrigin = "https://sanchika.complyeaze.com";

export function validateGalleryProduction({ outputFiles, expectedDocumentPaths, stableRelease, nextRelease = null, packageEntrypoints }) {
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
    if (manifest.releases?.currentStable?.version !== stableRelease || manifest.releases?.currentStable?.status !== "released-current") fail("manifest current stable release must match release.json as released-current");
    if (manifest.releases?.currentStable?.url !== `https://github.com/lamemustafa/sanchika/releases/tag/v${stableRelease}`) fail("manifest current stable release must link to its GitHub release");
    if (Object.hasOwn(manifest.releases ?? {}, "planned")) fail("manifest must not retain the legacy planned release field");
    if (manifest.releases?.next) {
      if (manifest.releases.next.version === stableRelease) fail("manifest current and next release versions must not duplicate");
      if (manifest.releases.next.version !== nextRelease) fail("manifest next release must match the declared stable artifact candidate");
      if (manifest.releases.next.status !== "planned-not-released") fail("manifest next release must remain planned-not-released");
    } else if (manifest.releases?.next !== null || manifest.releases?.nextAnnouncement !== "No next package release is currently announced.") {
      fail("manifest must state that no next package release is currently announced");
    } else if (nextRelease !== null) {
      fail("manifest must expose the declared stable artifact candidate as next before promotion");
    }
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

  if (!llms.includes(`Current stable release: v${stableRelease}. GitHub release artifacts; not published to npm.`)) fail("llms.txt must be generated from the current stable release");
  const nextReleaseStatement = manifest?.releases?.next
    ? `Next announced package release: v${manifest.releases.next.version}. ${manifest.releases.next.announcement}`
    : "No next package release is currently announced.";
  const landingNextReleaseStatement = manifest?.releases?.next?.announcement ?? nextReleaseStatement;
  if (!llms.includes(nextReleaseStatement)) fail("llms.txt must use the canonical optional next-release status");
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
  if (!index.includes("Make regulated interfaces that show their work.")) fail("landing must render the approved S10 promise");
  if (!index.includes("Sanchika gives coding agents and engineers a repeatable way to turn source, uncertainty, and human review into clear, accessible product UI.")) fail("landing must render the approved S10 first-viewport deck");
  if (!index.includes("It supplies contracts and a review loop—not compliance judgment, customer evidence, or an application runtime.")) fail("landing must render the explicit S10 boundary");
  if (!index.includes("Leave room for the human who must decide.")) fail("landing must render the AX-031 human decision proof");
  if (!index.includes("One grammar. Four working conditions.")) fail("landing must render the four-mode comparison");
  if (!index.includes("Contracts first. Craft loop clearly labelled.")) fail("landing must label the pilot-stage craft method");
  if (!index.includes("Useful, bounded, and still in review.")) fail("landing must expose honest status treatment");
  if (!index.includes('property="og:image" content="https://sanchika.complyeaze.com/og-witness-joint.png"')) fail("landing must publish a raster Open Graph image");
  if (!index.includes('name="twitter:image" content="https://sanchika.complyeaze.com/og-witness-joint.png"')) fail("landing must publish a raster Twitter image");
  if (!index.includes(`releases/tag/v${stableRelease}`)) fail("landing must show and link the current stable release");
  if (!index.includes(landingNextReleaseStatement)) fail("landing must state the canonical optional next-release status");
  if (new RegExp(`v${stableRelease}[^<]{0,80}(?:planned|unreleased)`, "i").test(index)) fail("landing must not duplicate the current stable version as planned");

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
    releases: {
      currentStable: {
        version: "0.1.0",
        status: "released-current",
        url: "https://github.com/lamemustafa/sanchika/releases/tag/v0.1.0",
        distribution: "GitHub release artifacts; not published to npm",
      },
      next: null,
      nextAnnouncement: "No next package release is currently announced.",
    },
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
  const validIndex = '<meta property="og:image" content="https://sanchika.complyeaze.com/og-witness-joint.png"><meta name="twitter:image" content="https://sanchika.complyeaze.com/og-witness-joint.png"><main><h1>Make regulated interfaces that show their work.</h1><p>Sanchika gives coding agents and engineers a repeatable way to turn source, uncertainty, and human review into clear, accessible product UI.</p><p>It supplies contracts and a review loop—not compliance judgment, customer evidence, or an application runtime.</p><h2>Leave room for the human who must decide.</h2><h2>One grammar. Four working conditions.</h2><h2>Contracts first. Craft loop clearly labelled.</h2><h2>Useful, bounded, and still in review.</h2><p>No next package release is currently announced.</p><a href="https://github.com/lamemustafa/sanchika/releases/tag/v0.1.0">Release evidence</a><a href="/" data-docs-search-item>Home</a><a href="/patterns/reviewdeskpreview/" data-docs-search-item>ReviewDeskPreview</a></main>';
  const validLlms = [
    "# Sanchika",
    "Current stable release: v0.1.0. GitHub release artifacts; not published to npm.",
    "No next package release is currently announced.",
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
    { name: "stale manually edited manifest release", mutate: (files) => mutateManifest(files, (value) => { value.releases.currentStable.version = "9.9.9"; }), expected: "current stable release must match" },
    { name: "legacy planned release field", mutate: (files) => mutateManifest(files, (value) => { value.releases.planned = { version: "0.1.0", status: "planned-not-released" }; }), expected: "must not retain the legacy planned release field" },
    { name: "duplicate current and next release version", mutate: (files) => mutateManifest(files, (value) => { value.releases.next = { version: "0.1.0", status: "planned-not-released", announcement: "Planned." }; }), expected: "must not duplicate" },
    { name: "missing no-next-release announcement", mutate: (files) => mutateManifest(files, (value) => { value.releases.nextAnnouncement = ""; }), expected: "no next package release" },
    { name: "manually divergent llms content", mutate: (files) => new Map([...files].map(([path, content]) => [path, path === "llms.txt" ? content.replace("v0.1.0", "v9.9.9") : content])), expected: "llms.txt must be generated" },
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
      stableRelease: "0.1.0",
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

export function findUnresolvedGalleryVariables({ html, copiedCss }) {
  const cssSources = [
    ...extractHtmlCss(html),
    ...copiedCss.map(({ name, css }) => ({ name, css: stripCssComments(css) })),
  ];
  const definitions = new Set();
  const references = new Map();

  for (const source of cssSources) {
    for (const match of source.css.matchAll(/(--sk-[\w-]+)\s*:/g)) {
      definitions.add(match[1]);
    }
    for (const match of source.css.matchAll(/var\(\s*(--sk-[\w-]+)/g)) {
      const variable = match[1];
      const locations = references.get(variable) ?? new Set();
      locations.add(source.name);
      references.set(variable, locations);
    }
  }

  return [...references.entries()]
    .filter(([variable]) => !definitions.has(variable))
    .map(([variable, locations]) => ({ variable, locations: [...locations].sort() }))
    .sort((left, right) => left.variable.localeCompare(right.variable));
}

export function findGalleryIdentityPolicyFailures({ path, source }) {
  const failures = [];
  const activeSource = decodeCssEscapes(stripCssComments(source));
  const isIdentityLayer = path.replaceAll("\\", "/") === "styles/identity.css";
  if (/--lab-/.test(activeSource)) failures.push(`${path} must not contain retired lab variables`);
  if (/--sk-[a-z0-9-]+\s*:/.test(activeSource)) failures.push(`${path} must not author --sk-* variables`);
  if (!isIdentityLayer && /--gallery-brand-[a-z0-9-]+\s*:/.test(activeSource)) failures.push(`${path} must not define gallery identity variables outside styles/identity.css`);
  const colorSource = isIdentityLayer ? activeSource.replace(/--gallery-brand-[a-z0-9-]+\s*:\s*[^;]+;/gi, "") : activeSource;
  if (/oklch\(\s*(?:\d|\.)|#[0-9a-f]{3,8}\b/i.test(colorSource)) failures.push(`${path} must not contain raw colors outside gallery identity declarations`);
  if (isIdentityLayer && (/\.sk-[a-z0-9-]+/i.test(activeSource) || /\[\s*class\b[^\]]*sk-/i.test(activeSource))) failures.push("styles/identity.css must not style package selectors");
  if (isIdentityLayer && containsExternalCssOrigin(activeSource)) failures.push("styles/identity.css must not load external font or image origins");
  for (const match of activeSource.matchAll(/font-family\s*:\s*([^;]+)/gi)) {
    if (!isIdentityLayer && !match[1].trim().startsWith("var(")) failures.push(`${path} must use package or gallery identity typography variables`);
  }
  for (const match of activeSource.matchAll(/box-shadow\s*:\s*([^;]+)/gi)) if (!match[1].trim().startsWith("var(")) failures.push(`${path} must use package elevation tokens`);
  return failures;
}

export function runGalleryVariableFixtures() {
  const fixtures = [
    {
      name: "all variables resolved and prose ignored",
      html: '<p>Documentation may mention var(--sk-prose-only).</p><style>:root { --sk-gap: 1rem; } .card { gap: var(--sk-gap); }</style>',
      copiedCss: [],
      expected: [],
    },
    {
      name: "one unresolved variable",
      html: '<style>.card { gap: var(--sk-missing); }</style>',
      copiedCss: [],
      expected: ["--sk-missing"],
    },
    {
      name: "commented fake definition",
      html: '<style>/* :root { --sk-missing: 1rem; } */ .card { gap: var(--sk-missing); }</style>',
      copiedCss: [],
      expected: ["--sk-missing"],
    },
    {
      name: "commented fake reference",
      html: '<style>/* .card { gap: var(--sk-missing); } */</style>',
      copiedCss: [],
      expected: [],
    },
    {
      name: "nested var usage",
      html: '<style>:root { --sk-ink: black; --sk-fallback: gray; } .card { color: var(--sk-ink, var(--sk-fallback)); }</style>',
      copiedCss: [],
      expected: [],
    },
    {
      name: "generated HTML inline style block",
      html: '<style>.card { color: var(--sk-ink); }</style>',
      copiedCss: [{ name: "assets/theme.css", css: ":root { --sk-ink: black; }" }],
      expected: [],
    },
    {
      name: "copied gallery CSS reference",
      html: '<style>:root { --sk-gap: 1rem; }</style>',
      copiedCss: [{ name: "assets/primitives.css", css: ".card { gap: var(--sk-gap); }" }],
      expected: [],
    },
  ];

  const failures = [];
  for (const fixture of fixtures) {
    const actual = findUnresolvedGalleryVariables(fixture).map(({ variable }) => variable);
    if (JSON.stringify(actual) !== JSON.stringify(fixture.expected)) {
      failures.push(`${fixture.name}: expected ${fixture.expected.join(", ") || "none"}; found ${actual.join(", ") || "none"}`);
    }
  }

  const identityFixtures = [
    {
      name: "relative identity asset",
      source: '@font-face { src: url("../assets/font.woff2"); }',
      blocked: false,
    },
    {
      name: "absolute URL function",
      source: '@font-face { src: url("https://fonts.example/font.woff2"); }',
      blocked: true,
    },
    {
      name: "protocol-relative URL function",
      source: "@font-face { src: url(//cdn.example/font.woff2); }",
      blocked: true,
    },
    {
      name: "scheme URL without slashes",
      source: "@font-face { src: url(https:fonts.example/font.woff2); }",
      blocked: true,
    },
    {
      name: "embedded data URL",
      source: "@font-face { src: url(data:font/woff2;base64,AA==); }",
      blocked: false,
    },
    {
      name: "quoted external import",
      source: '@import "https://fonts.example/style.css";',
      blocked: true,
    },
    {
      name: "escaped external import",
      source: '@import "\\68 ttps://fonts.example/style.css";',
      blocked: true,
    },
    {
      name: "escaped external URL function",
      source: '@font-face { src: url(\\68 ttps://fonts.example/font.woff2); }',
      blocked: true,
    },
    {
      name: "protocol-relative import",
      source: '@import url("//fonts.example/style.css");',
      blocked: true,
    },
    {
      name: "external image-set string",
      source: 'background-image: image-set("https://cdn.example/identity.webp" 1x);',
      blocked: true,
    },
    {
      name: "local image-set string",
      source: 'background-image: image-set("../assets/identity.webp" 1x);',
      blocked: false,
    },
  ];
  for (const fixture of identityFixtures) {
    const blocked = findGalleryIdentityPolicyFailures({
      path: "styles/identity.css",
      source: fixture.source,
    }).some((failure) => failure.includes("external font or image origins"));
    if (blocked !== fixture.blocked)
      failures.push(
        `${fixture.name}: expected external origin blocked=${fixture.blocked}; found ${blocked}`,
      );
  }

  const selectorFixtures = [
    { source: '.sk-button { color: var(--gallery-brand-ink); }', blocked: true },
    { source: '.\\73 k-button { color: var(--gallery-brand-ink); }', blocked: true },
    { source: '[class~="sk-button"] { color: var(--gallery-brand-ink); }', blocked: true },
    { source: '[class^="sk-"] { color: var(--gallery-brand-ink); }', blocked: true },
    { source: '.craft-button { color: var(--gallery-brand-ink); }', blocked: false },
  ];
  for (const fixture of selectorFixtures) {
    const blocked = findGalleryIdentityPolicyFailures({
      path: "styles/identity.css",
      source: fixture.source,
    }).some((failure) => failure.includes("package selectors"));
    if (blocked !== fixture.blocked)
      failures.push(
        `identity selector ${fixture.source}: expected blocked=${fixture.blocked}; found ${blocked}`,
      );
  }

  const nestedIdentityFailures = findGalleryIdentityPolicyFailures({
    path: "components/styles/identity.css",
    source: ":root { --gallery-brand-ink: oklch(0.2 0.1 40); }",
  });
  if (
    !nestedIdentityFailures.some((failure) =>
      failure.includes("outside styles/identity.css"),
    )
  )
    failures.push(
      "nested identity stylesheet must not receive canonical identity privileges",
    );

  return {
    count: fixtures.length + identityFixtures.length + selectorFixtures.length + 1,
    failures,
  };
}

function containsExternalCssOrigin(source) {
  const active = stripCssComments(source);
  return (
    /url\(\s*["']?\s*(?:(?!data:|blob:)[a-z][a-z0-9+.-]*:|\/\/)/i.test(active) ||
    /@import\s+(?:url\(\s*)?["']?\s*(?:(?!data:|blob:)[a-z][a-z0-9+.-]*:|\/\/)/i.test(active) ||
    /(?:-webkit-)?image-set\([^)]*["']\s*(?:(?!data:|blob:)[a-z][a-z0-9+.-]*:|\/\/)/i.test(active)
  );
}

function decodeCssEscapes(source) {
  return source
    .replace(/\\(?:\r\n|[\n\r\f])/g, "")
    .replace(/\\([0-9a-f]{1,6})[\t\n\f\r ]?/gi, (_match, hex) => {
      const codePoint = Number.parseInt(hex, 16);
      if (
        codePoint === 0 ||
        codePoint > 0x10ffff ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)
      )
        return "\ufffd";
      return String.fromCodePoint(codePoint);
    })
    .replace(/\\([^\n\r\f0-9a-f])/gi, "$1");
}

function extractHtmlCss(html) {
  const activeHtml = html.replace(/<!--[\s\S]*?-->/g, "");
  const sources = [];
  let styleBlockIndex = 0;
  let inlineStyleIndex = 0;

  for (const match of activeHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    styleBlockIndex += 1;
    sources.push({ name: `index.html <style> #${styleBlockIndex}`, css: stripCssComments(match[1]) });
  }

  for (const match of activeHtml.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    inlineStyleIndex += 1;
    sources.push({
      name: `index.html style attribute #${inlineStyleIndex}`,
      css: stripCssComments(match[1] ?? match[2] ?? ""),
    });
  }

  return sources;
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

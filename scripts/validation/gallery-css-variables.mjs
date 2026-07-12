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

  return { count: fixtures.length, failures };
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

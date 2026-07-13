export const productSections = [
  "## Users",
  "## Product Purpose",
  "## Brand Personality",
  "## Anti-references",
  "## Design Principles",
  "## Accessibility & Inclusion",
];

export const requiredMotionVariables = [
  "--sk-motion-duration-instant",
  "--sk-motion-duration-fast",
  "--sk-motion-duration-standard",
  "--sk-motion-duration-slow",
  "--sk-motion-easing-standard",
  "--sk-motion-easing-enter",
  "--sk-motion-easing-exit",
  "--sk-motion-easing-emphasized",
];

export const requiredPrimitiveContracts = ["stateEvidence", "attributes", "selectors", "notes"];

export const requiredPatternContracts = [
  "requiredSlots",
  "requiredStates",
  "requiredVisibleSignals",
  "a11yChecks",
  "semanticObligations",
];

export const contrastPairs = [
  ["ink-primary on canvas", "--sk-color-ink-primary", "--sk-color-canvas", 4.5],
  ["ink-primary on surface", "--sk-color-ink-primary", "--sk-color-surface", 4.5],
  ["ink-muted on canvas", "--sk-color-ink-muted", "--sk-color-canvas", 4.5],
  ["inverse ink on brand-primary", "--sk-color-ink-inverse", "--sk-color-brand-primary", 4.5],
  ["link on canvas", "--sk-color-link", "--sk-color-canvas", 4.5],
  ["link on surface", "--sk-color-link", "--sk-color-surface", 4.5],
  ["selection text on selection background", "--sk-color-selection-text", "--sk-color-selection-bg", 4.5],
  ["success foreground on background", "--sk-color-success-fg", "--sk-color-success-bg", 4.5],
  ["warning foreground on background", "--sk-color-warning-fg", "--sk-color-warning-bg", 4.5],
  ["danger foreground on background", "--sk-color-danger-fg", "--sk-color-danger-bg", 4.5],
  ["info foreground on background", "--sk-color-info-fg", "--sk-color-info-bg", 4.5],
  ["neutral foreground on background", "--sk-color-neutral-fg", "--sk-color-neutral-bg", 4.5],
  ["focus on canvas", "--sk-color-focus", "--sk-color-canvas", 3],
  ["focus on surface", "--sk-color-focus", "--sk-color-surface", 3],
  ["default border on canvas", "--sk-color-border-default", "--sk-color-canvas", 3],
  ["default border on surface", "--sk-color-border-default", "--sk-color-surface", 3],
];

export function evaluateContrastPairs(css, pairs = contrastPairs) {
  const declarations = parseCssCustomProperties(css);
  return pairs.map(([name, foreground, background, minimum]) => ({
    name,
    foreground,
    background,
    minimum,
    ratio: contrastRatio(resolveOklchVariable(declarations, foreground), resolveOklchVariable(declarations, background)),
  }));
}

export function parseCssCustomProperties(css) {
  return new Map(
    [...css.matchAll(/(--sk-[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]),
  );
}

export function resolveCssVariable(declarations, variable, stack = []) {
  const value = declarations.get(variable);
  if (!value) throw new Error(`Missing generated CSS variable ${variable}`);
  const alias = value.match(/^var\((--sk-[\w-]+)\)$/);
  if (!alias) return value;
  if (stack.includes(variable)) throw new Error(`Circular generated CSS alias ${[...stack, variable].join(" -> ")}`);
  return resolveCssVariable(declarations, alias[1], [...stack, variable]);
}

export function resolveOklchVariable(declarations, variable) {
  const value = resolveCssVariable(declarations, variable);
  const color = parseOklch(value);
  if (!color) throw new Error(`${variable} must resolve to an opaque OKLCH color; received ${value}`);
  return color;
}

export function parseOklch(value) {
  const match = value.match(/^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/);
  if (!match) return null;

  return {
    l: Number(match[1]) / 100,
    c: Number(match[2]),
    h: Number(match[3]),
  };
}

export function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(oklchToSrgb(foreground));
  const backgroundLuminance = relativeLuminance(oklchToSrgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function oklchToSrgb({ l, c, h }) {
  const hueRadians = (h * Math.PI) / 180;
  const a = Math.cos(hueRadians) * c;
  const b = Math.sin(hueRadians) * c;

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const lmsL = lPrime ** 3;
  const lmsM = mPrime ** 3;
  const lmsS = sPrime ** 3;

  return [
    linearToSrgb(4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS),
    linearToSrgb(-1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS),
    linearToSrgb(-0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.707614701 * lmsS),
  ];
}

function relativeLuminance([r, g, b]) {
  const [linearR, linearG, linearB] = [r, g, b].map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

function linearToSrgb(value) {
  const channel = Math.min(1, Math.max(0, value));
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

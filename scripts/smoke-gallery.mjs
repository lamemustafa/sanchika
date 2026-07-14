import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";
import { validateGalleryExemplars } from "./validation/gallery-exemplars.mjs";
import { validateS5GalleryExemplars } from "./validation/s5-gallery-exemplars.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertGalleryBuildArtifacts({ root, commandName: "pnpm smoke:check" });

const { colorTokens } = await import("../packages/tokens/dist/index.js");
const { primitiveClassName, primitiveGroups, primitiveSpecs } = await import("../packages/primitives/dist/index.js");
const { patternSpecs } = await import("../packages/patterns/dist/index.js");

const documentMarkup = readFileSync(new URL("../apps/gallery/dist/index.html", import.meta.url), "utf8");
const foundationMarkup = readFileSync(new URL("../apps/gallery/dist/primitives/foundations/index.html", import.meta.url), "utf8");
const s5Markup = readFileSync(new URL("../apps/gallery/dist/primitives/search-state-feedback/index.html", import.meta.url), "utf8");
const markup = `${documentMarkup}\n${foundationMarkup}\n${s5Markup}`;
const normalizedMarkup = markup.replaceAll("&#39;", "'");
const primitiveCss = ["styles.css", "foundation.css", "typography.css", "components.css", "search-feedback.css", "process-data.css"]
  .map((path) => readFileSync(new URL(`../packages/primitives/src/${path}`, import.meta.url), "utf8"))
  .join("\n");
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const tokenDocs = readFileSync(new URL("../docs/tokens.md", import.meta.url), "utf8");

const requiredFragments = [
  'data-sanchika-gallery="primitive"',
  "Interfaces that survive compliance review.",
  "A design system that can defend itself.",
  "One design language, different trust boundaries.",
  "From prompt to proof without losing the boundary.",
  "Browser evidence",
  "Adoption decision",
  "Current public evidence ledger",
  "pnpm build",
  "pnpm gallery:check",
  "pnpm pages:smoke",
  "docs/adoption-complyeaze.md",
  "Read adoption proof plan",
  "Accessibility evidence",
  "Consumer adoption",
  "Use Sanchika as evidence, not authority.",
  `${Object.keys(colorTokens).length} color roles`,
  "Button",
  "Field",
  'class="sk-button sk-tone-brand sk-size-md"',
  'aria-busy="true"',
  "disabled",
  'for="filing-period"',
  'aria-invalid="true"',
  'aria-describedby="filing-period-hint filing-period-error"',
  'data-sk-error',
  "Warning status",
  "Evidence required",
  "EvidencePanel",
  "TrustBoundary",
  "ServiceSection",
];

const requiredDocumentFragments = [
  "<!DOCTYPE html>",
  "<title>Sanchika | Design evidence system</title>",
  '<meta name="description"',
  '<link rel="canonical" href="https://sanchika.complyeaze.com/">',
  "https://sanchika.complyeaze.com/",
  '<link rel="stylesheet" href="/_astro/',
  'data-sanchika-gallery-document="primitive"',
  documentMarkup,
];

assertBefore(readme, '@sanchika/tokens/theme.css', '@sanchika/primitives/styles.css', "README CSS import order");
assertBefore(tokenDocs, '@sanchika/tokens/theme.css', '@sanchika/primitives/styles.css', "tokens docs CSS import order");

for (const primitive of primitiveSpecs) {
  requiredFragments.push(primitiveClassName(primitive.name), primitive.name, primitive.role);
  const requiredStates = [...primitive.requiredStates];
  const evidenceStates = primitive.stateEvidence?.map((evidence) => evidence.state) ?? [];

  if (
    requiredStates.length !== evidenceStates.length ||
    requiredStates.some((state, index) => evidenceStates[index] !== state) ||
    new Set(evidenceStates).size !== evidenceStates.length
  ) {
    requiredFragments.push(`${primitive.name} stateEvidence exact state parity`);
  }

  for (const state of primitive.requiredStates) {
    requiredFragments.push(state);
  }
  for (const standard of primitive.standards ?? []) {
    requiredFragments.push(standard.id, standard.sourceUrl);
    for (const requirement of standard.requirements) {
      requiredFragments.push(escapeHtml(requirement));
    }
  }
  for (const evidence of primitive.stateEvidence ?? []) {
    requiredFragments.push(evidence.state, evidence.notes);
    if (!evidence.notes.trim()) {
      requiredFragments.push(`${primitive.name} ${evidence.state} non-empty notes`);
    }
    if (evidence.selectors.length === 0) {
      requiredFragments.push(`${primitive.name} ${evidence.state} selectors`);
    }
    for (const attribute of evidence.attributes ?? []) {
      requiredFragments.push(escapeHtml(attribute));
    }
    for (const selector of evidence.selectors ?? []) {
      requiredFragments.push(escapeHtml(selector));
      if (!primitiveCss.includes(selector)) {
        requiredFragments.push(`${primitive.name} ${evidence.state} selector ${selector} implemented`);
      }
    }
  }
  if (!Array.isArray(primitive.stateEvidence)) {
    requiredFragments.push(`${primitive.name} stateEvidence`);
  }
}

for (const pattern of patternSpecs) {
  requiredFragments.push(pattern.name, pattern.purpose);
  for (const state of pattern.requiredStates ?? []) {
    if (typeof state === "string") {
      requiredFragments.push(`${pattern.name} ${state} requiredVisibleSignals`);
      continue;
    }
    requiredFragments.push(state.name, state.purpose);
    for (const signal of state.requiredVisibleSignals ?? []) {
      requiredFragments.push(signal);
    }
    for (const check of state.a11yChecks ?? []) {
      requiredFragments.push(check.id, check.criterion, check.sourceUrl, check.requirement, check.manualTest);
    }
    if (state.programmaticStatus) {
      requiredFragments.push(
        state.programmaticStatus.role,
        state.programmaticStatus.ariaLive,
        state.programmaticStatus.requirement,
      );
    }
    for (const slotName of state.requiredSlots ?? []) {
      requiredFragments.push(slotName);
    }
    if (!Array.isArray(state.requiredVisibleSignals)) {
      requiredFragments.push(`${pattern.name} ${state.name} requiredVisibleSignals`);
    }
    if (!Array.isArray(state.a11yChecks)) {
      requiredFragments.push(`${pattern.name} ${state.name} a11yChecks`);
    }
  }
  for (const obligation of pattern.semanticObligations ?? []) {
    requiredFragments.push(obligation);
  }
  for (const slot of pattern.requiredSlots ?? []) {
    requiredFragments.push(slot.name, slot.purpose);
  }
  if (!Array.isArray(pattern.requiredStates)) {
    requiredFragments.push(`${pattern.name} requiredStates`);
  }
  if (!Array.isArray(pattern.semanticObligations)) {
    requiredFragments.push(`${pattern.name} semanticObligations`);
  }
  if (!Array.isArray(pattern.requiredSlots)) {
    requiredFragments.push(`${pattern.name} requiredSlots`);
  }
}

const missing = [
  ...requiredFragments.filter((fragment) => !normalizedMarkup.includes(fragment)),
  ...requiredDocumentFragments.filter((fragment) => !documentMarkup.includes(fragment)),
];

validateGalleryExemplars({
  markup,
  primitiveSpecs,
  patternSpecs,
  validateUniqueDocumentIds: false,
  stateMarkerExclusions: primitiveGroups.searchStateFeedback.map((primitive) => primitive.name),
  fail: (message) => missing.push(message),
});
validateS5GalleryExemplars({
  markup: s5Markup,
  primitiveCss,
  primitiveSpecs: primitiveGroups.searchStateFeedback,
  fail: (message) => missing.push(message),
});

if (missing.length > 0) {
  console.error("Sanchika gallery smoke failed. Missing fragments:");
  for (const fragment of missing) {
    console.error(`- ${fragment}`);
  }
  process.exit(1);
}

console.log("Sanchika gallery smoke passed.");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function assertBefore(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  if (firstIndex === -1 || secondIndex === -1 || firstIndex > secondIndex) {
    requiredFragments.push(label);
  }
}

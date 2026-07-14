import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";
import {
  runGalleryExemplarFixtures,
  runProductPatternExemplarFixtures,
  validateGalleryExemplars,
  validateProductPatternExemplars,
} from "./validation/gallery-exemplars.mjs";
import { runS5GalleryExemplarFixtures, validateS5GalleryExemplars } from "./validation/s5-gallery-exemplars.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertGalleryBuildArtifacts({ root, commandName: "pnpm check:gallery" });

const { motionAssistUtilities, primitiveGroups, primitiveSpecs } = await import("../packages/primitives/dist/index.js");
const { patternSpecs, productPatternContracts, productPatternGroups } = await import("../packages/patterns/dist/index.js");
const rootMarkup = readFileSync(new URL("../apps/gallery/dist/index.html", import.meta.url), "utf8");
const foundationMarkup = readFileSync(new URL("../apps/gallery/dist/primitives/foundations/index.html", import.meta.url), "utf8");
const s5Markup = readFileSync(new URL("../apps/gallery/dist/primitives/search-state-feedback/index.html", import.meta.url), "utf8");
const motionMarkup = readFileSync(new URL("../apps/gallery/dist/foundations/motion/index.html", import.meta.url), "utf8");
const patternMarkupByGroup = new Map([
  ["public-product", readFileSync(new URL("../apps/gallery/dist/patterns/public/index.html", import.meta.url), "utf8")],
  ["axal-workspace", readFileSync(new URL("../apps/gallery/dist/patterns/axal/index.html", import.meta.url), "utf8")],
  ["pack-local-utility", readFileSync(new URL("../apps/gallery/dist/patterns/pack/index.html", import.meta.url), "utf8")],
  ["tools-local-artifact", readFileSync(new URL("../apps/gallery/dist/patterns/tools/index.html", import.meta.url), "utf8")],
]);
const northStarMarkupByProduct = new Map([
  ["complyeaze", readFileSync(new URL("../apps/gallery/dist/lab/complyeaze-core/index.html", import.meta.url), "utf8")],
  ["axal", readFileSync(new URL("../apps/gallery/dist/lab/axal-review-desk/index.html", import.meta.url), "utf8")],
  ["pack", readFileSync(new URL("../apps/gallery/dist/lab/pack-local-proof/index.html", import.meta.url), "utf8")],
  ["tools", readFileSync(new URL("../apps/gallery/dist/lab/tools-directory/index.html", import.meta.url), "utf8")],
]);
const northStarSources = [
  "LabShell.astro",
  "LabIntro.astro",
  "BoundaryBanner.astro",
  "ComplyEazeProofBridge.astro",
  "PermissionExplainer.astro",
  "ProductRouteArtifact.astro",
  "ReviewDesk.astro",
  "CustodyFlow.astro",
  "ToolDirectory.astro",
].map((path) => readFileSync(new URL(`../apps/gallery/src/components/lab/${path}`, import.meta.url), "utf8")).join("\n");
const primitiveCss = ["search-feedback.css", "process-data.css", "motion.css"]
  .map((path) => readFileSync(new URL(`../packages/primitives/src/${path}`, import.meta.url), "utf8"))
  .join("\n");
const markup = `${rootMarkup}\n${foundationMarkup}\n${s5Markup}\n${motionMarkup}`;
const failures = [];
const exemplarFixtures = runGalleryExemplarFixtures();
failures.push(...exemplarFixtures.failures.map((failure) => `gallery exemplar fixture ${failure}`));
const s5ExemplarFixtures = runS5GalleryExemplarFixtures();
failures.push(...s5ExemplarFixtures.failures.map((failure) => `S5 gallery exemplar fixture ${failure}`));
const productPatternExemplarFixtures = runProductPatternExemplarFixtures();
failures.push(...productPatternExemplarFixtures.failures.map((failure) => `product pattern exemplar fixture ${failure}`));
validateProductPatternExemplars({ markupByGroup: patternMarkupByGroup, contracts: productPatternContracts, fail: (message) => failures.push(message) });

assertExactAttributeValues({
  markup: rootMarkup,
  attribute: "data-sk-contract",
  expected: primitiveGroups.legacy.map((primitive) => primitive.name),
  label: "canonical primitive contract inventory",
});

for (const group of productPatternGroups) {
  const groupMarkup = patternMarkupByGroup.get(group.name) ?? "";
  assertExactAttributeValues({
    markup: groupMarkup,
    attribute: "data-pattern-contract",
    expected: group.patterns.map((contract) => contract.name),
    label: `${group.name} product pattern contract inventory`,
  });
  if (!groupMarkup.includes(`data-sanchika-pattern-group="${group.name}"`)) failures.push(`${group.name} reference must identify its package group`);
  for (const contract of group.patterns) {
    if (!groupMarkup.includes(contract.css.baseClass)) failures.push(`${group.name} reference must render ${contract.css.baseClass}`);
  }
}
const renderedProductPatternNames = [...patternMarkupByGroup.values()].flatMap((groupMarkup) => [...groupMarkup.matchAll(/data-pattern-contract="([^"]+)"/g)].map((match) => match[1]));
if (JSON.stringify(renderedProductPatternNames) !== JSON.stringify(productPatternContracts.map((contract) => contract.name))) {
  failures.push("rendered product pattern inventory must exactly match package order");
}

if (northStarSources.includes("styles/lab/index.css") || northStarSources.includes("--lab-") || /class=(?:\{|["'`])[^\n>]*\blab-/.test(northStarSources)) {
  failures.push("shipping North Star components must not depend on lab CSS variables or lab class hooks");
}
const retainedLabStyles = readdirSync(new URL("../apps/gallery/src/styles/lab/", import.meta.url)).sort();
if (JSON.stringify(retainedLabStyles) !== JSON.stringify(["motion.css"])) {
  failures.push(`unused S2 lab styles must be deleted; found ${retainedLabStyles.join(", ")}`);
}
for (const required of ["@sanchika/patterns/styles.css", "productPatternClassName", "ProductRouteMap", "ReviewDeskPreview", "LocalArtifactFlow", "ToolDirectory"]) {
  if (!northStarSources.includes(required)) failures.push(`North Star package integration must include ${required}`);
}

for (const [groupName, requiredFragments] of [
  ["public-product", ["sk-pattern-proof-strip", "sk-pattern-source-provenance-strip", "sk-pattern-grammar--provenance-strip", "sk-pattern-grammar--quiet-verified-seal", "<details open", "₹12,500", "Consumer adoption not yet claimed"]],
  ["axal-workspace", ["sk-pattern-review-desk-preview", "sk-pattern-evidence-panel", "sk-pattern-human-review-checkpoint", "sk-pattern-audit-trail-preview", "sk-pattern-work-queue-row", "sk-pattern-grammar--evidence-aperture", "sk-pattern-grammar--ledger-rail", "sk-pattern-grammar--file-tab-label"]],
  ["pack-local-utility", ["sk-pattern-permission-explainer", "sk-pattern-local-artifact-flow", "sk-pattern-custody-boundary", "sk-pattern-grammar--custody-line", "sk-pattern-grammar--provenance-strip", "sk-pattern-grammar--quiet-verified-seal", "Review permission"]],
  ["tools-local-artifact", ["sk-pattern-tool-directory", "sk-pattern-tool-card", "sk-pattern-local-boundary-banner", "sk-pattern-output-artifact-summary"]],
]) {
  const groupMarkup = patternMarkupByGroup.get(groupName) ?? "";
  for (const fragment of requiredFragments) if (!groupMarkup.includes(fragment)) failures.push(`${groupName} reference must include ${fragment}`);
}
for (const [product, requiredFragments] of [
  ["complyeaze", ["sk-pattern-public-hero", "sk-pattern-product-route-map", "sk-pattern-proof-strip", "sk-pattern-trust-boundary", "sk-pattern-review-desk-preview", "Sanchika North Star lab"]],
  ["axal", ["sk-pattern-review-desk-preview", "sk-pattern-work-queue-row", "sk-pattern-evidence-panel", "sk-pattern-human-review-checkpoint", "sk-pattern-audit-trail-preview"]],
  ["pack", ["sk-pattern-local-artifact-flow", "sk-pattern-custody-boundary", "sk-pattern-permission-explainer", "sk-pattern-source-provenance-strip", "sk-pattern-release-status-banner"]],
  ["tools", ["sk-pattern-tool-directory", "sk-pattern-tool-card", "sk-pattern-local-boundary-banner", "sk-search-field", "sk-inline-status", "sk-empty-state"]],
]) {
  const northStarMarkup = northStarMarkupByProduct.get(product) ?? "";
  for (const fragment of requiredFragments) if (!northStarMarkup.includes(fragment)) failures.push(`${product} North Star must include ${fragment}`);
}
assertExactAttributeValues({
  markup: motionMarkup,
  attribute: "data-motion-key",
  expected: motionAssistUtilities.map((utility) => utility.key),
  label: "motion-assist utility inventory",
});
assertExactAttributeValues({
  markup: motionMarkup,
  attribute: "data-motion-class",
  expected: motionAssistUtilities.map((utility) => utility.className),
  label: "motion-assist class inventory",
});
assertExactAttributeValues({
  markup: s5Markup,
  attribute: "data-sk-contract",
  expected: primitiveGroups.searchStateFeedback.map((primitive) => primitive.name),
  label: "S5 primitive contract inventory",
});
assertExactAttributeValues({
  markup: rootMarkup,
  attribute: "data-sk-primitive-summary",
  expected: primitiveGroups.legacy.map((primitive) => primitive.name),
  label: "canonical primitive summary inventory",
});
assertExactAttributeValues({
  markup: foundationMarkup,
  attribute: "data-sk-contract",
  expected: primitiveGroups.foundation.map((primitive) => primitive.name),
  label: "foundation primitive contract inventory",
});

const surfaceSpec = primitiveGroups.foundation.find((primitive) => primitive.name === "Surface");
const textSpec = primitiveGroups.foundation.find((primitive) => primitive.name === "Text");
assertExactAttributeValues({
  markup: foundationMarkup,
  attribute: "data-sk-surface-variant",
  expected: surfaceSpec?.variants.find((variant) => variant.name === "variant")?.values ?? [],
  label: "Surface variant inventory",
});
assertExactAttributeValues({
  markup: foundationMarkup,
  attribute: "data-sk-text-role",
  expected: textSpec?.variants.find((variant) => variant.name === "role")?.values ?? [],
  label: "Text role inventory",
});

validateGalleryExemplars({
  markup,
  primitiveSpecs,
  patternSpecs,
  validateUniqueDocumentIds: false,
  stateMarkerExclusions: primitiveGroups.searchStateFeedback.map((primitive) => primitive.name),
  fail: (message) => failures.push(message),
});
validateS5GalleryExemplars({
  markup: s5Markup,
  primitiveCss,
  primitiveSpecs: primitiveGroups.searchStateFeedback,
  fail: (message) => failures.push(message),
});

for (const pattern of patternSpecs) {
  for (const state of pattern.requiredStates) {
    const label = `${pattern.name}.${state.name}`;
    const marker = `data-sk-pattern="${pattern.name}" data-sk-state="${state.name}"`;
    if (!markup.includes(marker)) failures.push(`gallery must render ${label}`);
    for (const slotName of state.requiredSlots ?? pattern.requiredSlots.map((slot) => slot.name)) {
      if (!markup.includes(`data-sk-slot="${slotName}"`)) {
        failures.push(`gallery must render ${label} slot ${slotName}`);
      }
    }
    if (state.programmaticStatus) {
      const statusFragments = [
        "data-sk-programmatic-status",
        `role="${state.programmaticStatus.role}"`,
        `aria-live="${state.programmaticStatus.ariaLive}"`,
        'aria-atomic="true"',
      ];
      for (const fragment of statusFragments) {
        if (!markup.includes(fragment)) failures.push(`gallery must render ${label} status fragment ${fragment}`);
      }
    }
  }
}

if (rootMarkup.includes("@sanchika/") || foundationMarkup.includes("@sanchika/") || s5Markup.includes("@sanchika/") || motionMarkup.includes("@sanchika/")) {
  failures.push("openable gallery artifact must not contain unresolved @sanchika/* hrefs");
}

if (failures.length > 0) {
  console.error("Sanchika gallery coverage check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sanchika gallery coverage check passed.");
console.log(`Sanchika gallery exemplar fixtures passed (${exemplarFixtures.count} cases).`);
console.log(`Sanchika S5 gallery exemplar fixtures passed (${s5ExemplarFixtures.count} cases).`);
console.log(`Sanchika product pattern exemplar fixtures passed (${productPatternExemplarFixtures.count} cases).`);

function assertExactAttributeValues({ markup, attribute, expected, label }) {
  const actual = [...markup.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g"))].map((match) => match[1]);
  if (JSON.stringify(actual) !== JSON.stringify([...expected])) {
    failures.push(`${label} must exactly match package contracts: expected ${[...expected].join(", ")}; found ${actual.join(", ")}`);
  }
}

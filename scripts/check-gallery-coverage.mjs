import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";
import { runGalleryExemplarFixtures, validateGalleryExemplars } from "./validation/gallery-exemplars.mjs";
import { runS5GalleryExemplarFixtures, validateS5GalleryExemplars } from "./validation/s5-gallery-exemplars.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertGalleryBuildArtifacts({ root, commandName: "pnpm check:gallery" });

const { primitiveGroups, primitiveSpecs } = await import("../packages/primitives/dist/index.js");
const { patternSpecs } = await import("../packages/patterns/dist/index.js");
const rootMarkup = readFileSync(new URL("../apps/gallery/dist/index.html", import.meta.url), "utf8");
const foundationMarkup = readFileSync(new URL("../apps/gallery/dist/primitives/foundations/index.html", import.meta.url), "utf8");
const s5Markup = readFileSync(new URL("../apps/gallery/dist/primitives/search-state-feedback/index.html", import.meta.url), "utf8");
const primitiveCss = ["search-feedback.css", "process-data.css"]
  .map((path) => readFileSync(new URL(`../packages/primitives/src/${path}`, import.meta.url), "utf8"))
  .join("\n");
const markup = `${rootMarkup}\n${foundationMarkup}\n${s5Markup}`;
const failures = [];
const exemplarFixtures = runGalleryExemplarFixtures();
failures.push(...exemplarFixtures.failures.map((failure) => `gallery exemplar fixture ${failure}`));
const s5ExemplarFixtures = runS5GalleryExemplarFixtures();
failures.push(...s5ExemplarFixtures.failures.map((failure) => `S5 gallery exemplar fixture ${failure}`));

assertExactAttributeValues({
  markup: rootMarkup,
  attribute: "data-sk-contract",
  expected: primitiveGroups.legacy.map((primitive) => primitive.name),
  label: "canonical primitive contract inventory",
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

if (rootMarkup.includes("@sanchika/") || foundationMarkup.includes("@sanchika/") || s5Markup.includes("@sanchika/")) {
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

function assertExactAttributeValues({ markup, attribute, expected, label }) {
  const actual = [...markup.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g"))].map((match) => match[1]);
  if (JSON.stringify(actual) !== JSON.stringify([...expected])) {
    failures.push(`${label} must exactly match package contracts: expected ${[...expected].join(", ")}; found ${actual.join(", ")}`);
  }
}

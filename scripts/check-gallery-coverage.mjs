import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";
import { runGalleryExemplarFixtures, runProductPatternExemplarFixtures } from "./validation/gallery-exemplars.mjs";
import { runS5GalleryExemplarFixtures } from "./validation/s5-gallery-exemplars.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertGalleryBuildArtifacts({ root, commandName: "pnpm check:gallery" });
const { motionAssistUtilities, primitiveSpecs } = await import("../packages/primitives/dist/index.js");
const { productPatternContracts, productVisualGrammar } = await import("../packages/patterns/dist/index.js");
const { tokenDefinitions } = await import("../packages/tokens/dist/index.js");
const failures = [];
const rootMarkup = readOutput("index.html");
const motionMarkup = readOutput("foundations/motion/index.html");

const exemplarFixtures = runGalleryExemplarFixtures();
const s5Fixtures = runS5GalleryExemplarFixtures();
const productFixtures = runProductPatternExemplarFixtures();
failures.push(...exemplarFixtures.failures.map((failure) => `gallery exemplar fixture ${failure}`));
failures.push(...s5Fixtures.failures.map((failure) => `S5 gallery exemplar fixture ${failure}`));
failures.push(...productFixtures.failures.map((failure) => `product pattern exemplar fixture ${failure}`));

for (const contract of primitiveSpecs) {
  const route = `/primitives/${contract.name.toLowerCase()}/`;
  const markup = readOutput(`${route.slice(1)}index.html`);
  for (const required of [contract.name, publicCopy(contract.purpose), "Composed synthetic exemplar", "@sanchika/primitives"]) {
    if (!markup.includes(required)) failures.push(`${route} must derive ${required} from the primitive contract`);
  }
  for (const state of contract.requiredStates) if (!markup.includes(`data-primitive-state="${state}"`)) failures.push(`${route} must render primitive state ${state}`);
  if (!rootMarkup.includes(`href="${route}"`)) failures.push(`landing search must index ${route}`);
}

for (const contract of productPatternContracts) {
  const route = `/patterns/${contract.name.toLowerCase()}/`;
  const markup = readOutput(`${route.slice(1)}index.html`);
  for (const required of [contract.name, contract.purpose, contract.css.baseClass, "Composed synthetic exemplar", "@sanchika/patterns", `data-pattern-exemplar="${contract.name}"`]) {
    if (!markup.includes(required)) failures.push(`${route} must derive ${required} from the product pattern contract`);
  }
  for (const state of contract.states) if (!markup.includes(`data-pattern-state="${state.name}"`)) failures.push(`${route} must render pattern state ${state.name}`);
  if (/Visible synthetic/i.test(markup)) failures.push(`${route} must not use field-name placeholder exemplars`);
  if (!rootMarkup.includes(`href="${route}"`)) failures.push(`landing search must index ${route}`);
}

for (const utility of motionAssistUtilities) {
  if (!motionMarkup.includes(utility.key) || !motionMarkup.includes(utility.className) || !motionMarkup.includes(utility.reducedMotionResult)) failures.push(`motion route must derive ${utility.key} from package metadata`);
  if (!new RegExp(`class="[^"]*\\b${utility.className}\\b`).test(motionMarkup)) failures.push(`motion route must apply emitted utility class ${utility.className}`);
}

const tokenMarkup = readOutput("foundations/tokens/index.html");
for (const token of tokenDefinitions) if (!tokenMarkup.includes(`data-token-proof="${token.id}"`)) failures.push(`token route must render visual proof for ${token.id}`);

const modeMarkup = new Map([
  ["complyeaze", readOutput("modes/complyeaze/index.html")],
  ["axal", readOutput("modes/axal/index.html")],
  ["pack", readOutput("modes/pack/index.html")],
  ["tools", readOutput("modes/tools/index.html")],
]);
for (const [mode, required] of [
  ["complyeaze", ["sk-pattern-trust-boundary", "sk-pattern-product-route-map", "Your work decides the route"]],
  ["axal", ["sk-pattern-review-desk-preview", "sk-pattern-work-queue-row", "sk-pattern-evidence-panel", "sk-pattern-human-review-checkpoint", "sk-pattern-audit-trail-preview"]],
  ["pack", ["sk-pattern-permission-explainer", "sk-pattern-local-artifact-flow", "sk-pattern-custody-boundary", "manual download path"]],
  ["tools", ["sk-pattern-tool-directory", "sk-pattern-tool-card", "sk-search-field", "data-tool-search", "data-tool-empty"]],
]) for (const fragment of required) if (!modeMarkup.get(mode)?.includes(fragment)) failures.push(`${mode} production mode must render ${fragment}`);

const combinedModes = [...modeMarkup.values()].join("\n");
for (const hook of Object.values(productVisualGrammar)) {
  if (!combinedModes.includes(hook.className)) failures.push(`production modes must render visual grammar hook ${hook.className}`);
}
for (const required of ["primitiveSpecs", "productPatternContracts", "tokenDefinitions", "productionRoutes", "searchEntries"]) {
  const source = readFileSync(new URL("../apps/gallery/src/content/site.ts", import.meta.url), "utf8");
  if (!source.includes(required)) failures.push(`canonical gallery metadata must derive ${required}`);
}
for (const required of ["productPatternClassName", "primitiveClassName", "@sanchika/patterns", "@sanchika/primitives"]) {
  const sources = ["ReviewDeskPreview.astro", "CustodyFlow.astro", "ProductRouteArtifact.astro", "ToolDirectory.astro", "BoundaryBanner.astro"]
    .map((path) => readFileSync(new URL(`../apps/gallery/src/components/showcase/${path}`, import.meta.url), "utf8")).join("\n");
  if (!sources.includes(required)) failures.push(`production showcase components must include ${required}`);
}
if (/\/lab\/|--lab-/.test(`${rootMarkup}\n${combinedModes}`)) failures.push("production gallery must not retain lab routes or variables");

if (failures.length) {
  console.error("Sanchika gallery coverage check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Sanchika gallery coverage check passed (${primitiveSpecs.length} primitives; ${productPatternContracts.length} patterns; 4 modes).`);
console.log(`Sanchika gallery exemplar fixtures passed (${exemplarFixtures.count} cases).`);
console.log(`Sanchika S5 gallery exemplar fixtures passed (${s5Fixtures.count} cases).`);
console.log(`Sanchika product pattern exemplar fixtures passed (${productFixtures.count} cases).`);

function readOutput(path) { return readFileSync(new URL(`../apps/gallery/dist/${path}`, import.meta.url), "utf8"); }
function publicCopy(value) {
  return value
    .replace(/\bS\d+\b/g, "package")
    .replace(/\bC\d+\b/g, "reference composition")
    .replace(/\bNorth Stars\b/g, "reference compositions")
    .replace(/\bNorth Star\b/g, "reference composition");
}

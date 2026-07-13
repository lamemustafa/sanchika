import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";
import { validateGalleryExemplars } from "./validation/gallery-exemplars.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm check:gallery" });

const { primitiveSpecs } = await import("../packages/primitives/dist/index.js");
const { patternSpecs } = await import("../packages/patterns/dist/index.js");
const markup = readFileSync(new URL("../apps/gallery/dist/index.html", import.meta.url), "utf8");
const failures = [];

validateGalleryExemplars({ markup, primitiveSpecs, patternSpecs, fail: (message) => failures.push(message) });

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

if (markup.includes("@sanchika/")) {
  failures.push("openable gallery artifact must not contain unresolved @sanchika/* hrefs");
}

if (failures.length > 0) {
  console.error("Sanchika gallery coverage check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sanchika gallery coverage check passed.");

import { requiredPrimitiveContracts } from "./contrast.mjs";
import {
  controlInvalidSelector,
  minimumControlTargetRem,
  requiredButtonApgDocFragments,
  requiredButtonApgFragments,
  requiredButtonDisabledDocFragments,
  requiredButtonDisabledFragments,
  requiredButtonLoadingDocFragments,
  requiredButtonLoadingFragments,
  requiredFocusVisibleSelectors,
} from "./accessibility-contracts.mjs";

export function validatePrimitiveContracts({ primitiveSource, primitiveDocs, primitiveCss, tokenCssDeclarations, fail }) {
  const expectedPrimitiveNames = [
    "Container", "Section", "Stack", "Cluster", "Grid", "Split", "Surface", "Divider", "VisuallyHidden",
    "Text", "Button", "Link", "LinkCard", "Card", "Badge", "Field",
  ];
  const declaredPrimitiveNames = [...primitiveSource.matchAll(/^    name: "([A-Z][A-Za-z]+)",$/gm)].map((match) => match[1]);
  if (declaredPrimitiveNames.join(",") !== expectedPrimitiveNames.join(",")) {
    fail(`primitive registry must declare the exact ordered S4-compatible inventory: ${expectedPrimitiveNames.join(", ")}`);
  }
  if (new Set(declaredPrimitiveNames).size !== declaredPrimitiveNames.length) {
    fail("primitive registry must not declare duplicate primitive names");
  }

  const requiredContractFields = [
    "purpose", "whenToUse", "whenNotToUse", "semanticElement", "classHooks", "anatomy", "variants", "tones", "sizes",
    "requiredStates", "stateEvidence", "keyboardObligations", "screenReaderObligations", "contentRules", "motion",
    "forcedColorsBehavior", "mobileBehavior", "examples", "galleryCoverage", "consumerResponsibilities", "accessibility",
  ];
  for (const primitiveName of expectedPrimitiveNames) {
    const specSource = extractPrimitiveSpecSource(primitiveSource, primitiveName);
    if (!specSource) {
      fail(`primitive specs must include ${primitiveName}`);
      continue;
    }
    for (const field of requiredContractFields) {
      if (!specSource.includes(`${field}:`)) fail(`${primitiveName} primitive contract must declare ${field}`);
    }
    const baseHook = `.sk-${primitiveName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
    if (!specSource.includes(baseHook)) fail(`${primitiveName} primitive contract must declare base class hook ${baseHook}`);
    if (!primitiveCss.includes(baseHook)) fail(`primitive styles must implement base class hook ${baseHook}`);
  }

  for (const role of ["display", "heading", "body", "lead", "caption", "eyebrow", "data", "mono"]) {
    if (!primitiveSource.includes(`"${role}"`) || !primitiveCss.includes(`.sk-text-${role}`) || !primitiveDocs.includes(`\`${role}\``)) {
      fail(`Text primitive must implement and document role ${role}`);
    }
  }

  for (const sourceFragment of [
    "PrimitiveSpec", "PrimitiveContract", "primitiveGroups", "PrimitiveClassOptions", "PrimitiveClassOptionsFor",
    "LegacyPrimitiveName", "textClassName",
  ]) {
    if (!primitiveSource.includes(sourceFragment)) fail(`primitive API must export ${sourceFragment}`);
    if (!primitiveDocs.includes(sourceFragment)) fail(`docs/primitives.md must document ${sourceFragment}`);
  }

  for (const registryFragment of [
    "actionPrimitiveSpecs[0]",
    "actionPrimitiveSpecs[3]",
    "formStatusPrimitiveSpecs[0]",
    "formStatusPrimitiveSpecs[1]",
    "...layoutCorePrimitiveSpecs",
    "...layoutPlanePrimitiveSpecs",
    "...typographyPrimitiveSpecs",
    "actionPrimitiveSpecs[1]",
    "actionPrimitiveSpecs[2]",
  ]) {
    if (!primitiveSource.includes(registryFragment)) {
      fail(`primitive registry must preserve the compatible S4 inventory fragment ${registryFragment}`);
    }
  }

  const linkSpec = extractPrimitiveSpecSource(primitiveSource, "Link");
  const buttonSpec = extractPrimitiveSpecSource(primitiveSource, "Button");
  const linkCardSpec = extractPrimitiveSpecSource(primitiveSource, "LinkCard");
  const cardSpec = extractPrimitiveSpecSource(primitiveSource, "Card");
  if (!linkSpec.includes("native anchor with href") || !buttonSpec.includes("Prefer native button")) {
    fail("Link and Button must preserve distinct native navigation and action semantics");
  }
  if (!linkCardSpec.includes("Never nest another interactive element") || !linkCardSpec.includes("No nested buttons, links, checkboxes, menus, fields, or controls")) {
    fail("LinkCard contract must explicitly prohibit nested interactive controls");
  }
  if (!cardSpec.includes("built on Surface styling") || !cardSpec.includes("Surface is the visual plane; Card is grouped content")) {
    fail("Card compatibility contract must define its relationship to Surface");
  }

  if (!primitiveCss.includes('@import "./foundation.css";') || !primitiveCss.includes('@import "./typography.css";') || !primitiveCss.includes('@import "./components.css";')) {
    fail("primitive styles.css must expose the foundation, typography, and component CSS inventory");
  }
  if (!primitiveCss.includes("@layer sanchika-primitives")) fail("primitive CSS must use the sanchika-primitives cascade layer");
  if (!primitiveCss.includes("@media (forced-colors: active)")) fail("primitive CSS must include forced-colors behavior");
  for (const selectorLine of primitiveCss.split("\n").filter((line) => line.includes(".sk-") && line.trimEnd().endsWith("{"))) {
    if (!selectorLine.includes(":where(")) fail(`primitive class selector must keep zero-specificity grouping with :where(): ${selectorLine.trim()}`);
  }

  for (const requiredPrimitiveContract of requiredPrimitiveContracts) {
    if (!primitiveSource.includes(requiredPrimitiveContract)) {
      fail(`primitive specs must declare ${requiredPrimitiveContract}`);
    }
    if (!primitiveDocs.includes(requiredPrimitiveContract)) {
      fail(`docs/primitives.md must document ${requiredPrimitiveContract}`);
    }
  }

  for (const fragment of requiredButtonApgFragments) {
    if (!primitiveSource.includes(fragment)) {
      fail(`Button primitive must include APG guidance fragment: ${fragment}`);
    }
  }

  for (const fragment of requiredButtonApgDocFragments) {
    if (!primitiveDocs.includes(fragment)) {
      fail(`docs/primitives.md must include APG guidance fragment: ${fragment}`);
    }
  }

  if (!/\brequiredStates:\s*\[[^\]]*"pressed"/s.test(extractPrimitiveSpecSource(primitiveSource, "Button"))) {
    fail("Button primitive requiredStates must include pressed for the APG toggle contract");
  }

  for (const fragment of requiredButtonDisabledFragments) {
    if (!primitiveSource.includes(fragment)) {
      fail(`Button disabled contract must include fragment: ${fragment}`);
    }
  }

  if (!/\.sk-button\[data-disabled=\\?"true\\?"\]/.test(primitiveSource)) {
    fail('Button disabled selector evidence must include .sk-button[data-disabled="true"]');
  }

  for (const fragment of requiredButtonDisabledDocFragments) {
    if (!primitiveDocs.includes(fragment)) {
      fail(`docs/primitives.md must include disabled button fragment: ${fragment}`);
    }
  }

  for (const fragment of requiredButtonLoadingFragments) {
    if (!primitiveSource.includes(fragment)) {
      fail(`Button loading contract must include fragment: ${fragment}`);
    }
  }

  for (const fragment of requiredButtonLoadingDocFragments) {
    if (!primitiveDocs.includes(fragment)) {
      fail(`docs/primitives.md must include loading button fragment: ${fragment}`);
    }
  }

  if (!primitiveCss.includes("var(--sk-")) {
    fail("primitive styles must consume Sanchika CSS variables");
  }

  if (primitiveCss.includes("oklch(")) {
    fail("primitive styles must not duplicate raw OKLCH values");
  }

  if (/#[0-9a-f]{3,8}\b/i.test(primitiveCss)) {
    fail("primitive styles must not use raw hex colors");
  }

  if (!primitiveCss.includes("--sk-primitive-fg")) {
    fail("primitive styles must define a foreground variable for contrast-sensitive text");
  }

  if (!primitiveCss.includes("--sk-primitive-border: var(--sk-color-border-default)")) {
    fail("primitive control borders must use the validated default-border token");
  }

  if (!primitiveCss.includes(controlInvalidSelector)) {
    fail("field invalid styling must support aria-invalid on the actual control");
  }

  for (const selector of requiredFocusVisibleSelectors) {
    if (!primitiveSource.includes(selector)) {
      fail(`primitive specs must declare focus-visible selector ${selector}`);
    }
    if (!primitiveCss.includes(selector)) {
      fail(`primitive styles must implement focus-visible selector ${selector}`);
    }
  }

  if (!/outline:\s*var\(--sk-focus-outline-width\)\s+solid\s+var\(--sk-color-focus\)/.test(primitiveCss)) {
    fail("primitive focus-visible styles must use the validated focus token outline");
  }

  if (!/outline-offset:\s*var\(--sk-focus-outline-offset\)/.test(primitiveCss)) {
    fail("primitive focus-visible styles must include an outline offset");
  }

  if (!tokenCssDeclarations.has("--sk-focus-outline-width") || tokenCssDeclarations.get("--sk-focus-outline-width") !== "2px") {
    fail("token CSS must keep --sk-focus-outline-width at the validated 2px focus width");
  }

  if (!tokenCssDeclarations.has("--sk-focus-outline-offset") || tokenCssDeclarations.get("--sk-focus-outline-offset") !== "2px") {
    fail("token CSS must keep --sk-focus-outline-offset at the validated 2px focus offset");
  }

  for (const match of primitiveCss.matchAll(/--sk-primitive-control-block:\s*([0-9.]+)rem/g)) {
    const size = Number(match[1]);
    if (size < minimumControlTargetRem) {
      fail(`primitive control target floor ${size}rem is below ${minimumControlTargetRem}rem`);
    }
  }

  if (!/:where\(\.sk-button\)[\s\S]*?min-block-size:\s*var\(--sk-primitive-control-block\)/.test(primitiveCss)) {
    fail("button block target size must use --sk-primitive-control-block");
  }

  if (!/:where\(\.sk-button\)[\s\S]*?min-inline-size:\s*var\(--sk-primitive-control-block\)/.test(primitiveCss)) {
    fail("button inline target size must use --sk-primitive-control-block");
  }

  if (primitiveCss.includes('.sk-field[aria-invalid="true"]')) {
    fail("field invalid styling must not encourage aria-invalid on the wrapper");
  }

  if (/:where\(\.sk-badge\)[\s\S]*?color:\s*var\(--sk-primitive-tone\)/.test(primitiveCss)) {
    fail("badge text must not use semantic tone color directly");
  }

  if (primitiveCss.includes("inset 0.25rem 0 0")) {
    fail("primitive cards must not use side-stripe status treatment");
  }

  if (primitiveCss.includes("var(--sk-motion-standard)")) {
    fail("primitive styles must use split motion duration and easing variables");
  }

  if (primitiveCss.includes(" linear infinite")) {
    fail("primitive loading motion must use a Sanchika easing token");
  }

  const primitiveLocalDeclarations = new Set(
    [...primitiveCss.matchAll(/(--sk-[\w-]+)\s*:/g)].map((match) => match[1]),
  );
  const primitiveVariableRefs = [...primitiveCss.matchAll(/var\((--sk-[\w-]+)/g)].map((match) => match[1]);
  for (const variable of primitiveVariableRefs) {
    if (primitiveLocalDeclarations.has(variable)) {
      continue;
    }

    if (!tokenCssDeclarations.has(variable)) {
      fail(`primitive styles reference unknown token variable ${variable}`);
    }
  }
}

function extractPrimitiveSpecSource(source, primitiveName) {
  const marker = `name: "${primitiveName}"`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return "";
  const nextSpecIndex = source.indexOf('\n  {\n    name: "', markerIndex + marker.length);
  return nextSpecIndex === -1 ? source.slice(markerIndex) : source.slice(markerIndex, nextSpecIndex);
}

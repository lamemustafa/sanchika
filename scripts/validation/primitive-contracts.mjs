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

  for (const fragment of requiredButtonDisabledFragments) {
    if (!primitiveSource.includes(fragment)) {
      fail(`Button disabled contract must include fragment: ${fragment}`);
    }
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

  if (!primitiveCss.includes("--sk-primitive-border: var(--sk-color-border-control)")) {
    fail("primitive control borders must use the validated control-border token");
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

  if (!/outline:\s*2px\s+solid\s+var\(--sk-color-info\)/.test(primitiveCss)) {
    fail("primitive focus-visible styles must use the validated info token outline");
  }

  if (!/outline-offset:\s*2px/.test(primitiveCss)) {
    fail("primitive focus-visible styles must include an outline offset");
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

  const primitiveVariableRefs = [...primitiveCss.matchAll(/var\((--sk-[\w-]+)/g)].map((match) => match[1]);
  for (const variable of primitiveVariableRefs) {
    if (variable.startsWith("--sk-primitive-")) {
      if (!primitiveCss.includes(`${variable}:`)) {
        fail(`primitive styles reference undeclared local variable ${variable}`);
      }
      continue;
    }

    if (!tokenCssDeclarations.has(variable)) {
      fail(`primitive styles reference unknown token variable ${variable}`);
    }
  }
}

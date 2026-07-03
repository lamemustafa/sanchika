export const requiredButtonApgFragments = [
  "WAI-ARIA APG Button Pattern",
  "native <button>",
  "Space",
  "Enter",
  "aria-pressed",
  "focus after activation",
];

export const requiredButtonApgDocFragments = [
  "WAI-ARIA APG Button Pattern",
  "native `<button>`",
  "`Space`",
  "`Enter`",
  "`aria-pressed`",
  "focus after activation",
];

export const requiredButtonDisabledFragments = [
  "native disabled",
  "aria-disabled",
  "data-disabled",
  "suppress click",
  "Space",
  "Enter",
  "visible disabled reason",
];

export const requiredButtonDisabledDocFragments = [
  "native `disabled`",
  "`aria-disabled`",
  "`data-disabled`",
  "suppress click",
  "`Space`",
  "`Enter`",
  "visible disabled reason",
];

export const controlInvalidSelector = ".sk-field :is(input, textarea, select, [data-sk-control])[aria-invalid=\"true\"]";

export const requiredFocusVisibleSelectors = [
  ".sk-button:focus-visible",
  ".sk-card:focus-visible",
  ".sk-field :is(input, textarea, select, [data-sk-control]):focus-visible",
];

export const minimumControlTargetRem = 1.5;

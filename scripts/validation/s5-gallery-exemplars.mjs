const requirements = {
  SearchField: {
    default: { markup: ["data-s5-search-field", "<label", 'type="search"'] },
    "focus-visible": { markup: ["data-sk-focus-proof"], css: ['input[type="search"]:focus-visible', ".sk-search-field__clear:focus-visible"] },
    "has-value": { markup: ['data-has-value="true"', "data-s5-clear"] },
    filtering: { markup: ['field.dataset.filtering = "true"', 'status.setAttribute("aria-busy", "true")'] },
    results: { markup: ["data-sk-result-status", 'role="status"', 'aria-live="polite"', 'aria-atomic="true"'] },
    "no-results": { markup: ["data-s5-empty", "data-s5-reset", 'data-empty-kind="filtered"'] },
    disabled: { markup: ['data-disabled="true" data-has-value="true"', 'aria-label="Clear disabled search" disabled'] },
    error: { markup: ['data-invalid="true"', 'aria-invalid="true"', "data-sk-search-error", "data-s5-error-clear", "clearErrorSearch"] },
  },
  InlineStatus: {
    default: { markup: ["sk-inline-status", "neutral state"] },
    "with-metadata": { markup: ["sk-inline-status__meta", "Source 14-07-2026"] },
    "forced-colors": { css: ["@media (forced-colors: active)", ".sk-inline-status"] },
  },
  Skeleton: {
    loading: { markup: ['aria-busy="true"', 'class="s5-skeleton-stack" aria-hidden="true"'] },
    "reduced-motion": { css: ["@media (prefers-reduced-motion: reduce)", ".sk-skeleton) { animation: none;"] },
    "forced-colors": { css: ["@media (forced-colors: active)", ".sk-skeleton) { background: Canvas; animation: none;"] },
  },
  EmptyState: {
    empty: { markup: ['data-empty-kind="empty"', "No source records yet"] },
    filtered: { markup: ['data-empty-kind="filtered"', "Reset search"] },
    unavailable: { markup: ['data-empty-kind="unavailable"', "Source records unavailable"] },
  },
  ErrorState: {
    recoverable: { markup: ["Retry local fixture", "Reference S5-EXAMPLE-001"] },
    blocking: { markup: ['data-error-severity="blocking"', "Review cannot continue"] },
    "with-details": { markup: ['class="sk-error-state__details"', "Technical detail"] },
  },
  Progress: {
    determinate: { markup: ['value="3" max="5" aria-labelledby="s5-progress-label" aria-describedby="s5-progress-value"'] },
    indeterminate: { markup: ['data-progress-state="indeterminate"', 'aria-labelledby="s5-pending-label" aria-describedby="s5-pending-value"'] },
    complete: { markup: ['data-progress-state="complete"', "5 of 5 · Complete"] },
    error: { markup: ['data-progress-state="error"', "Review source and retry"] },
  },
  Stepper: {
    complete: { markup: ['data-step-state="complete"', "Complete"] },
    current: { markup: ['aria-current="step"', "Current step"] },
    upcoming: { markup: ['data-step-state="upcoming"', "Upcoming"] },
    blocked: { markup: ['data-step-state="blocked"', "Blocked — attach the missing synthetic source"] },
  },
  Disclosure: {
    closed: { markup: [/<details class="sk-disclosure">/] },
    open: { markup: [/<details class="sk-disclosure" open>/] },
    "long-content": { markup: ["M/s Shree Venkateshwara Industrial Components", "sk-disclosure__content"] },
    "nested-guidance": { markup: ["data-disclosure-nested-guidance", "Do not place an interactive summary inside another summary"] },
  },
  CopyButton: {
    idle: { markup: ["data-copy-button", "Copy checksum"] },
    copied: { markup: ['button.dataset.copyState = "copied"', "Copied to clipboard."] },
    failed: { markup: ['button.dataset.copyState = "failed"', "Select and copy the visible value manually"] },
    disabled: { markup: ['aria-label="Copy unavailable value" data-copy-button disabled', "button.disabled = true"] },
  },
  Breadcrumb: {
    default: { markup: ['<nav class="sk-breadcrumb" aria-label="Breadcrumb"><ol'] },
    "long-label": { markup: ["Search, state, and feedback"] },
    "current-page": { markup: ['aria-current="page">Search, state, and feedback</li>'] },
  },
  Stat: {
    default: { markup: ['<dl class="sk-stat sk-stat-align-start"><dt class="sk-stat__label"'] },
    "with-delta": { markup: ['data-delta-direction="increase"', "Increase 2.4%"] },
    "with-source": { markup: ["sk-stat__meta", "Source reviewed"] },
  },
  TableShell: {
    comfortable: { markup: ['data-density="comfortable"', "Synthetic filing summary"] },
    compact: { markup: ['data-density="compact"', "Synthetic compact source references"] },
    "sticky-header": { markup: ['data-sticky-header="true"'] },
    overflow: { markup: ['class="sk-table-shell__viewport" tabindex="0" aria-labelledby="s5-table-overflow-label"'] },
    "zoom-200": { markup: ['data-zoom-proof="200 400"'] },
    "zoom-400": { markup: ['data-zoom-proof="200 400"'] },
  },
};

export function validateS5GalleryExemplars({ markup, primitiveCss, primitiveSpecs, fail }) {
  const proofMarkup = removeContractLedger(markup);
  const expectedNames = primitiveSpecs.map((primitive) => primitive.name);
  if (Object.keys(requirements).join(",") !== expectedNames.join(",")) {
    fail(`S5 exemplar oracle must exactly match package inventory: expected ${expectedNames.join(", ")}; found ${Object.keys(requirements).join(", ")}`);
    return;
  }

  for (const primitive of primitiveSpecs) {
    const stateRequirements = requirements[primitive.name];
    const expectedStates = primitive.requiredStates;
    if (Object.keys(stateRequirements).join(",") !== expectedStates.join(",")) {
      fail(`${primitive.name} exemplar oracle must exactly match contract states: expected ${expectedStates.join(", ")}; found ${Object.keys(stateRequirements).join(", ")}`);
      continue;
    }
    for (const state of expectedStates) {
      for (const requirement of stateRequirements[state].markup ?? []) {
        if (!matches(proofMarkup, requirement)) fail(`S5 proof must render ${primitive.name}.${state} evidence ${String(requirement)}`);
      }
      for (const requirement of stateRequirements[state].css ?? []) {
        if (!matches(primitiveCss, requirement)) fail(`S5 CSS must implement ${primitive.name}.${state} evidence ${String(requirement)}`);
      }
    }
  }

  if (/data-sk-primitive="(?:SearchField|InlineStatus|Skeleton|EmptyState|ErrorState|Progress|Stepper|Disclosure|CopyButton|Breadcrumb|Stat|TableShell)"\s+data-sk-state=/.test(markup)) {
    fail("S5 state coverage must not be certified by generic ledger markers");
  }
  const comfortableViewport = /data-density="comfortable"[^>]*>[\s\S]*?<div class="sk-table-shell__viewport"([^>]*)>/.exec(proofMarkup)?.[1] ?? "";
  if (/\btabindex=/.test(comfortableViewport)) fail("comfortable TableShell viewport must not be focusable without guaranteed overflow");
}

export function runS5GalleryExemplarFixtures() {
  const failures = [];
  const ledgerOnly = '<section id="s5-contract-ledger"><li data-sk-primitive="Progress" data-sk-state="complete">complete</li></section>';
  if (removeContractLedger(ledgerOnly).includes("data-sk-state")) failures.push("contract ledger removal must exclude self-certifying state markers");
  if (!matches("<progress value=\"1\"></progress>", /<progress\s+value=/)) failures.push("regex exemplar requirements must inspect semantic markup");
  return { count: 2, failures };
}

function removeContractLedger(markup) {
  return markup.replace(/<section id="s5-contract-ledger"[\s\S]*?<\/section>/, "");
}

function matches(source, requirement) {
  return typeof requirement === "string" ? source.includes(requirement) : requirement.test(source);
}

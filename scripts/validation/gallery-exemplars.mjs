export function validateGalleryExemplars({ markup, primitiveSpecs, fail }) {
  validateUniqueIds({ markup, fail });
  validateFieldAssociations({ markup, fail });
  validateCardFocusSemantics({ markup, fail });
  validatePatternStatusExemplars({ markup, fail });

  for (const primitive of primitiveSpecs) {
    for (const state of primitive.requiredStates) {
      const marker = `data-sk-primitive="${primitive.name}" data-sk-state="${state}"`;
      if (!markup.includes(marker)) {
        fail(`PrimitiveGallery must render ${primitive.name} ${state} exemplar`);
      }
    }
  }

  requireFragments(
    markup,
    [
      'data-sk-primitive="Field" data-sk-state="error"',
      'for="filing-period"',
      'id="filing-period"',
      'aria-invalid="true"',
      'aria-describedby="filing-period-hint filing-period-error"',
      'id="filing-period-hint"',
      'id="filing-period-error"',
      "data-sk-error",
    ],
    fail,
    "Field error exemplar",
  );

  requireFragments(
    markup,
    [
      'data-sk-primitive="Field" data-sk-state="disabled"',
      'data-disabled="true"',
      'for="locked-period"',
      'id="locked-period"',
      "disabled",
    ],
    fail,
    "Field disabled exemplar",
  );
}

function validatePatternStatusExemplars({ markup, fail }) {
  requireFragments(
    markup,
    [
      'data-sk-pattern="EvidencePanel" data-sk-state="pending-review"',
      'role="status" aria-live="polite" aria-atomic="true" aria-labelledby="evidence-panel-pending-review-state" aria-describedby="evidence-panel-pending-source-list evidence-panel-pending-provenance-timestamp"',
      'id="evidence-panel-pending-review-state" data-sk-slot="reviewState"',
      "Pending review",
      'id="evidence-panel-pending-source-list" data-sk-slot="sourceList"',
      "1 source attached",
      "GST portal notice summary attached",
      'id="evidence-panel-pending-provenance-timestamp" data-sk-slot="provenanceTimestamp"',
      "Last checked 03-07-2026 21:45 IST",
    ],
    fail,
    "EvidencePanel pending-review status exemplar",
  );
}

function validateUniqueIds({ markup, fail }) {
  const seen = new Set();
  for (const [, id] of markup.matchAll(/\sid="([^"]+)"/g)) {
    if (seen.has(id)) {
      fail(`PrimitiveGallery must not duplicate id ${id}`);
    }
    seen.add(id);
  }
}

function validateFieldAssociations({ markup, fail }) {
  for (const [, state, fieldMarkup] of markup.matchAll(/<div data-sk-primitive="Field" data-sk-state="([^"]+)"[^>]*>([\s\S]*?)<\/div>/g)) {
    const control = fieldMarkup.match(/<(?:input|textarea|select)\b[^>]*>/)?.[0];
    const controlId = control ? getAttribute(control, "id") : null;

    if (!control || !controlId) {
      fail(`Field ${state} exemplar must render a form control with an id`);
      continue;
    }

    if (!fieldMarkup.includes(`for="${controlId}"`)) {
      fail(`Field ${state} exemplar label must reference ${controlId}`);
    }

    const describedBy = new Set((getAttribute(control, "aria-describedby") ?? "").split(/\s+/).filter(Boolean));
    for (const id of idsForDescriptiveText(fieldMarkup)) {
      if (!describedBy.has(id)) {
        fail(`Field ${state} exemplar control must aria-describe ${id}`);
      }
    }
  }
}

function validateCardFocusSemantics({ markup, fail }) {
  const focusCard = markup.match(/<(?<tag>\w+)\b(?<attrs>[^>]*)data-sk-primitive="Card" data-sk-state="focus-visible"(?<rest>[^>]*)>/);
  if (!focusCard?.groups) {
    fail("Card focus-visible exemplar must exist");
    return;
  }

  const tag = focusCard.groups.tag.toLowerCase();
  const attributes = `${focusCard.groups.attrs}${focusCard.groups.rest}`;
  const hasNativeInteractiveSemantics =
    tag === "button" ||
    (tag === "a" && /\shref=/.test(attributes)) ||
    (getAttribute(attributes, "role") === "button" && /\stabindex="0"/.test(attributes));

  if (!hasNativeInteractiveSemantics) {
    fail("Card focus-visible exemplar must use a real link/button or explicit button semantics");
  }
}

function idsForDescriptiveText(fieldMarkup) {
  return [...fieldMarkup.matchAll(/<[^>]+\sid="([^"]+)"[^>]+data-sk-(?:hint|error)\b/g)].map(([, id]) => id);
}

function getAttribute(source, name) {
  return source.match(new RegExp(`\\s${name}="([^"]+)"`))?.[1] ?? null;
}

function requireFragments(markup, fragments, fail, label) {
  for (const fragment of fragments) {
    if (!markup.includes(fragment)) {
      fail(`${label} is missing ${fragment}`);
    }
  }
}

export function validateGalleryExemplars({ markup, primitiveSpecs, patternSpecs, fail }) {
  validateUniqueIds({ markup, fail });
  validateButtonExemplars({ markup, primitiveSpecs, fail });
  validateFieldAssociations({ markup, fail });
  validateCardFocusSemantics({ markup, fail });
  validateTrustBoundarySignals({ markup, fail });
  validatePatternStateExemplars({ markup, patternSpecs, fail });

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

function validateButtonExemplars({ markup, primitiveSpecs, fail }) {
  const disabledButton = findPrimitiveStateElement(markup, "button", "Button", "disabled");
  if (!disabledButton) {
    fail("Button disabled exemplar must exist");
  } else {
    const describedBy = getAttribute(disabledButton.attrs, "aria-describedby");
    if (!describedBy) {
      fail("Button disabled exemplar must use aria-describedby for visible reason copy");
    } else {
      for (const id of describedBy.split(/\s+/).filter(Boolean)) {
        if (!markup.includes(`id="${id}"`)) {
          fail(`Button disabled exemplar must reference visible reason copy id ${id}`);
        }
      }
    }
  }

  const buttonSpec = primitiveSpecs.find((primitive) => primitive.name === "Button");
  const requiresPressedState = buttonSpec?.standards?.some((standard) =>
    standard.requirements.some((requirement) => requirement.includes("aria-pressed")),
  );

  if (requiresPressedState) {
    const pressedButton = findPrimitiveStateElement(markup, "button", "Button", "pressed");
    if (!pressedButton) {
      fail("Button APG toggle exemplar must render data-sk-state=\"pressed\"");
    } else {
      if (getAttribute(pressedButton.attrs, "aria-pressed") !== "true") {
        fail("Button APG toggle exemplar must set aria-pressed=\"true\"");
      }
      if (!pressedButton.body.includes("Show details")) {
        fail("Button APG toggle exemplar must keep a stable visible label");
      }
    }
  }
}

function validateTrustBoundarySignals({ markup, fail }) {
  const localOnly = findPatternStateExemplar(markup, "TrustBoundary", "local-only");
  if (localOnly) {
    requireBodyFragments(
      localOnly.body,
      ["inspect source", "proof artifact", "generated artifact"],
      fail,
      "TrustBoundary local-only exemplar",
    );
  }

  const uploadRequired = findPatternStateExemplar(markup, "TrustBoundary", "upload-required");
  if (uploadRequired) {
    requireBodyFragments(
      uploadRequired.body,
      ["Destination or processor", "ComplyEaze workspace", "Reason for upload", "human review"],
      fail,
      "TrustBoundary upload-required exemplar",
    );
  }

  const permissionRequired = findPatternStateExemplar(markup, "TrustBoundary", "permission-required");
  if (permissionRequired) {
    requireBodyFragments(
      permissionRequired.body,
      ["File read permission", "inspect the selected local artifact"],
      fail,
      "TrustBoundary permission-required exemplar",
    );
  }
}

function validatePatternStateExemplars({ markup, patternSpecs, fail }) {
  if (!Array.isArray(patternSpecs)) {
    fail("PrimitiveGallery status exemplar validation requires patternSpecs");
    return;
  }

  for (const pattern of patternSpecs) {
    const topLevelSlots = (pattern.requiredSlots ?? []).map((slot) => slot.name);
    for (const state of pattern.requiredStates ?? []) {
      const label = `${pattern.name} ${state.name} state exemplar`;
      const exemplar = findPatternStateExemplar(markup, pattern.name, state.name);
      if (!exemplar) {
        fail(`${label} must exist`);
        continue;
      }

      const { attrs, body } = exemplar;
      for (const visibleSignal of state.requiredVisibleSignals ?? []) {
        if (!body.includes(visibleSignal)) {
          fail(`${label} must render visible state copy: ${visibleSignal}`);
        }
      }

      const requiredSlotNames = new Set([
        ...((state.requiredSlots?.length ? state.requiredSlots : topLevelSlots) ?? []),
        ...((state.a11yChecks ?? []).flatMap((check) => check.slotRefs ?? [])),
      ]);
      for (const slotName of requiredSlotNames) {
        const slotId = findSlotId(body, slotName);
        if (!slotId) {
          fail(`${label} must render data-sk-slot="${slotName}" with an id`);
        }
      }

      if (state.programmaticStatus) {
        const { role, ariaLive, slotRefs = [] } = state.programmaticStatus;
        if (getAttribute(attrs, "role") !== role) {
          fail(`${label} must declare role="${role}"`);
        }
        if (getAttribute(attrs, "aria-live") !== ariaLive) {
          fail(`${label} must declare aria-live="${ariaLive}"`);
        }
        if (getAttribute(attrs, "aria-atomic") !== "true") {
          fail(`${label} must declare aria-atomic="true"`);
        }

        const describedIds = new Set(
          `${getAttribute(attrs, "aria-labelledby") ?? ""} ${getAttribute(attrs, "aria-describedby") ?? ""}`
            .split(/\s+/)
            .filter(Boolean),
        );
        for (const slotName of slotRefs) {
          const slotId = findSlotId(body, slotName);
          if (!slotId) {
            fail(`${label} must render data-sk-slot="${slotName}" with an id`);
            continue;
          }
          if (!describedIds.has(slotId)) {
            fail(`${label} must reference ${slotId} from aria-labelledby or aria-describedby`);
          }
        }
      } else if (getAttribute(attrs, "role") || getAttribute(attrs, "aria-live")) {
        fail(`${label} must not declare live-region attributes without programmaticStatus`);
      }
    }
  }
}

function findPrimitiveStateElement(markup, tag, primitiveName, stateName) {
  const escapedTag = escapeRegExp(tag);
  const escapedPrimitive = escapeRegExp(primitiveName);
  const escapedState = escapeRegExp(stateName);
  const match = markup.match(
    new RegExp(
      `<${escapedTag}\\b(?<attrs>[^>]*\\bdata-sk-primitive="${escapedPrimitive}"\\s+data-sk-state="${escapedState}"[^>]*)>(?<body>[\\s\\S]*?)<\\/${escapedTag}>`,
    ),
  );
  return match?.groups ? { attrs: match.groups.attrs, body: match.groups.body } : null;
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

function findPatternStateExemplar(markup, patternName, stateName) {
  const escapedPatternName = escapeRegExp(patternName);
  const escapedStateName = escapeRegExp(stateName);
  const match = markup.match(
    new RegExp(
      `<(?<tag>[a-z][\\w-]*)\\b(?<attrs>[^>]*\\bdata-sk-pattern="${escapedPatternName}"\\s+data-sk-state="${escapedStateName}"[^>]*)>(?<body>[\\s\\S]*?)<\\/\\k<tag>>`,
    ),
  );

  return match?.groups ? { attrs: match.groups.attrs, body: match.groups.body } : null;
}

function findSlotId(markup, slotName) {
  const escapedSlotName = escapeRegExp(slotName);
  for (const [, attrs] of markup.matchAll(/<[a-z][\w-]*\b([^>]*)>/g)) {
    if (!new RegExp(`\\bdata-sk-slot="${escapedSlotName}"`).test(attrs)) continue;
    const id = getAttribute(` ${attrs}`, "id");
    if (id) return id;
  }
  return null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requireFragments(markup, fragments, fail, label) {
  for (const fragment of fragments) {
    if (!markup.includes(fragment)) {
      fail(`${label} is missing ${fragment}`);
    }
  }
}

function requireBodyFragments(body, fragments, fail, label) {
  for (const fragment of fragments) {
    if (!body.includes(fragment)) {
      fail(`${label} must include ${fragment}`);
    }
  }
}

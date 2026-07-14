export function validateGalleryExemplars({ markup, primitiveSpecs, patternSpecs, fail, validateUniqueDocumentIds = true, stateMarkerExclusions = [] }) {
  if (validateUniqueDocumentIds) validateUniqueIds({ markup, fail });
  validateButtonExemplars({ markup, primitiveSpecs, fail });
  validateFieldAssociations({ markup, fail });
  validateCardFocusSemantics({ markup, fail });
  validateLinkCardExemplars({ markup, fail });
  validateSearchFieldExemplars({ markup, fail });
  validateTrustBoundarySignals({ markup, fail });
  validateSyntheticGalleryBoundary({ markup, fail });
  validateStateSpecificPatternCopy({ markup, fail });
  validatePatternStateExemplars({ markup, patternSpecs, fail });

  const excludedStateMarkers = new Set(stateMarkerExclusions);
  for (const primitive of primitiveSpecs) {
    if (excludedStateMarkers.has(primitive.name)) continue;
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

export function runGalleryExemplarFixtures() {
  const cases = [
    {
      name: "valid root-anchor LinkCard",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><strong>Proof</strong></a>',
      expectedFailure: null,
    },
    {
      name: "valid named-link LinkCard",
      markup: '<article data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card"><a href="/proof">Proof destination</a><span>Metadata</span></article>',
      expectedFailure: null,
    },
    {
      name: "nested button",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><button type="button">Command</button></a>',
      expectedFailure: "<button>",
    },
    {
      name: "nested anchor",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><a href="/other">Other</a></a>',
      expectedFailure: "<a>",
    },
    {
      name: "nested input",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><input aria-label="Filter"></a>',
      expectedFailure: "<input>",
    },
    {
      name: "nested select",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><select aria-label="State"><option>Open</option></select></a>',
      expectedFailure: "<select>",
    },
    {
      name: "nested textarea",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><textarea aria-label="Note"></textarea></a>',
      expectedFailure: "<textarea>",
    },
    {
      name: "nested summary",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><details><summary>More</summary></details></a>',
      expectedFailure: "<summary>",
    },
    {
      name: "contenteditable descendant",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><span contenteditable="true">Editable</span></a>',
      expectedFailure: "contenteditable",
    },
    {
      name: "tabindex descendant",
      markup: '<a data-sk-primitive="LinkCard" data-sk-state="default" class="sk-link-card" href="/proof"><span tabindex="0">Focusable</span></a>',
      expectedFailure: "tabindex=\"0\"",
    },
  ];
  const failures = [];

  for (const fixture of cases) {
    const fixtureFailures = [];
    validateGalleryExemplars({
      markup: fixture.markup,
      primitiveSpecs: [{ name: "LinkCard", requiredStates: ["default"] }],
      patternSpecs: [],
      validateUniqueDocumentIds: false,
      fail: (message) => fixtureFailures.push(message),
    });
    const linkCardFailures = fixtureFailures.filter((message) => message.startsWith("LinkCard exemplar"));
    if (fixture.expectedFailure === null && linkCardFailures.length > 0) {
      failures.push(`${fixture.name} unexpectedly failed: ${linkCardFailures.join("; ")}`);
    }
    if (fixture.expectedFailure !== null && !linkCardFailures.some((message) => message.includes(fixture.expectedFailure))) {
      failures.push(`${fixture.name} did not report ${fixture.expectedFailure}`);
    }
  }

  for (const fixture of [
    {
      name: "placeholder-only SearchField",
      markup: '<form class="sk-search-field"><input id="search" type="search" placeholder="Search"><button class="sk-search-field__clear" aria-label="Clear search"></button></form>',
      expectedFailure: "visible label",
    },
    {
      name: "unnamed SearchField clear button",
      markup: '<form class="sk-search-field"><label for="search">Search records</label><input id="search" type="search"><button class="sk-search-field__clear"></button></form>',
      expectedFailure: "accessible name",
    },
  ]) {
    const fixtureFailures = [];
    validateSearchFieldExemplars({ markup: fixture.markup, fail: (message) => fixtureFailures.push(message) });
    if (!fixtureFailures.some((message) => message.includes(fixture.expectedFailure))) failures.push(`${fixture.name} did not report ${fixture.expectedFailure}`);
  }

  return { count: cases.length + 2, failures };
}

function validateSearchFieldExemplars({ markup, fail }) {
  for (const match of markup.matchAll(/<form\b(?<attrs>[^>]*\bsk-search-field\b[^>]*)>(?<body>[\s\S]*?)<\/form>/gi)) {
    const body = match.groups?.body ?? "";
    const input = body.match(/<input\b(?<attrs>[^>]*\btype=(?:"search"|'search'|search)[^>]*)>/i)?.groups;
    if (!input) { fail("SearchField exemplar must include native input type=search"); continue; }
    const inputId = getAttribute(input.attrs, "id");
    const label = inputId ? body.match(new RegExp(`<label\\b[^>]*for=(?:"${inputId}"|'${inputId}'|${inputId})[^>]*>([\\s\\S]*?)<\\/label>`, "i")) : null;
    if (!label || !label[1].replace(/<[^>]+>/g, "").trim()) fail("SearchField exemplar must include a visible label; placeholder-only search is invalid");
    const clear = body.match(/<button\b(?<attrs>[^>]*\bsk-search-field__clear\b[^>]*)>/i)?.groups;
    if (!clear || !getAttribute(clear.attrs, "aria-label")?.trim()) fail("SearchField clear button must have an accessible name");
    if (/\bdisabled\b/i.test(input.attrs) && clear && !/\bdisabled\b/i.test(clear.attrs)) fail("Disabled SearchField must disable its clear button");
  }
}

function validateStateSpecificPatternCopy({ markup, fail }) {
  const serviceDefault = findPatternStateExemplar(markup, "ServiceSection", "default");
  if (!serviceDefault) {
    fail("ServiceSection default state exemplar must exist");
  } else {
    requireBodyFragments(
      serviceDefault.body,
      ["Example advisory review is available for consideration."],
      fail,
      "ServiceSection default exemplar",
    );
    if (serviceDefault.body.includes("Example advisory review is unavailable")) {
      fail("ServiceSection default exemplar must not describe the service as unavailable");
    }
  }

  const evidenceEmpty = findPatternStateExemplar(markup, "EvidencePanel", "empty");
  if (!evidenceEmpty) {
    fail("EvidencePanel empty state exemplar must exist");
  } else if (evidenceEmpty.body.includes("live region")) {
    fail("EvidencePanel empty exemplar must not claim live-region behavior without programmaticStatus");
  }
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
      ["consumer must name any upload destination", "Synthetic destination", "Synthetic reason for upload"],
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
        if (getAttribute(attrs, "role") || getAttribute(attrs, "aria-live") || getAttribute(attrs, "aria-atomic")) {
          fail(`${label} must keep the article outside the live region`);
        }
        const liveRegion = body.match(/<(?<tag>[a-z][\w-]*)\b(?<attrs>[^>]*\bdata-sk-programmatic-status\b[^>]*)>/)?.groups;
        if (!liveRegion) {
          fail(`${label} must render a dedicated programmatic status element`);
          continue;
        }
        if (getAttribute(liveRegion.attrs, "role") !== role) {
          fail(`${label} status element must declare role="${role}"`);
        }
        if (getAttribute(liveRegion.attrs, "aria-live") !== ariaLive) {
          fail(`${label} status element must declare aria-live="${ariaLive}"`);
        }
        if (getAttribute(liveRegion.attrs, "aria-atomic") !== "true") {
          fail(`${label} status element must declare aria-atomic="true"`);
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

function validateSyntheticGalleryBoundary({ markup, fail }) {
  for (const requiredFragment of [
    'data-sanchika-example="synthetic"',
    "All gallery examples are synthetic",
    "illustrative source summary",
    "Synthetic timestamp",
    "Example advisory review",
  ]) {
    if (!markup.includes(requiredFragment)) {
      fail(`PrimitiveGallery synthetic boundary must include ${requiredFragment}`);
    }
  }

  for (const bannedFragment of ["GST portal notice summary", "GST advisory review", "Last checked 03-07-2026", "FY25", "FY26", "Q4 FY26"]) {
    if (markup.includes(bannedFragment)) {
      fail(`PrimitiveGallery synthetic boundary must not include ${bannedFragment}`);
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

function validateLinkCardExemplars({ markup, fail }) {
  const elements = parseHtmlElements(markup);
  const exemplars = flattenElements(elements).filter(
    (element) => getAttribute(element.attrs, "data-sk-primitive") === "LinkCard",
  );

  for (const [index, exemplar] of exemplars.entries()) {
    const state = getAttribute(exemplar.attrs, "data-sk-state") ?? `index-${index + 1}`;
    const label = `LinkCard exemplar ${state}`;
    const descendants = flattenElements(exemplar.children);
    const rootIsAnchor = exemplar.tag === "a";

    if (rootIsAnchor && !getAttribute(exemplar.attrs, "href")) {
      fail(`${label} root <a> must have href`);
    }

    if (rootIsAnchor) {
      for (const descendant of descendants) {
        const reason = interactiveReason(descendant);
        if (reason) fail(`${label} must not contain nested interactive ${reason}`);
      }
      continue;
    }

    const namedLinks = descendants.filter(
      (descendant) => descendant.tag === "a" && Boolean(getAttribute(descendant.attrs, "href")),
    );
    if (namedLinks.length !== 1) {
      fail(`${label} named-link composition must contain exactly one <a href>; found ${namedLinks.length}`);
    }
    for (const descendant of descendants) {
      if (descendant === namedLinks[0]) continue;
      const reason = interactiveReason(descendant);
      if (reason) fail(`${label} named-link composition must not contain additional interactive ${reason}`);
    }
  }
}

function parseHtmlElements(markup) {
  const roots = [];
  const stack = [];
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

  for (const match of markup.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)) {
    const source = match[0];
    const tag = match[1].toLowerCase();
    if (source.startsWith("</")) {
      const matchingIndex = stack.findLastIndex((element) => element.tag === tag);
      if (matchingIndex >= 0) stack.length = matchingIndex;
      continue;
    }

    const attrs = source.replace(/^<[^\s>]+/, "").replace(/\/?>$/, "");
    const element = { tag, attrs, children: [] };
    const parent = stack.at(-1);
    if (parent) parent.children.push(element);
    else roots.push(element);
    if (!source.endsWith("/>") && !voidTags.has(tag)) stack.push(element);
  }

  return roots;
}

function flattenElements(elements) {
  return elements.flatMap((element) => [element, ...flattenElements(element.children)]);
}

function interactiveReason(element) {
  if (element.tag === "a") return "<a>";
  if (["button", "input", "select", "textarea", "summary", "iframe"].includes(element.tag)) return `<${element.tag}>`;
  if (element.tag === "area" && getAttribute(element.attrs, "href")) return "<area href>";
  if (["audio", "video"].includes(element.tag) && hasAttribute(element.attrs, "controls")) return `<${element.tag} controls>`;

  if (hasAttribute(element.attrs, "contenteditable")) {
    const value = getAttribute(element.attrs, "contenteditable");
    if (value !== "false") return `<${element.tag} contenteditable>`;
  }

  if (hasAttribute(element.attrs, "tabindex")) {
    const value = getAttribute(element.attrs, "tabindex") ?? "0";
    const tabIndex = Number(value);
    if (!Number.isFinite(tabIndex) || tabIndex >= 0) return `<${element.tag} tabindex="${value}">`;
  }

  return null;
}

function idsForDescriptiveText(fieldMarkup) {
  return [...fieldMarkup.matchAll(/<[^>]+\sid="([^"]+)"[^>]+data-sk-(?:hint|error)\b/g)].map(([, id]) => id);
}

function getAttribute(source, name) {
  return source.match(new RegExp(`\\s${name}="([^"]+)"`))?.[1] ?? null;
}

function hasAttribute(source, name) {
  return new RegExp(`(?:^|\\s)${name}(?:\\s*=|\\s|$)`, "i").test(source);
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

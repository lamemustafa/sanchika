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

export function validateProductPatternExemplars({ markupByGroup, contracts = [], fail }) {
  for (const [groupName, markup] of markupByGroup) {
    if (!markup.includes('data-sanchika-example="synthetic"')) {
      fail(`${groupName} reference must mark synthetic exemplar data`);
    }
  }

  const publicMarkup = markupByGroup.get("public-product") ?? "";
  const routeMap = requireClassElement(publicMarkup, "sk-pattern-product-route-map", fail, "ProductRouteMap");
  if (routeMap) {
    const routeText = visibleText(routeMap);
    for (const product of ["Axal", "Pack", "Tools"]) {
      if (!routeText.includes(product)) fail(`ProductRouteMap must name ${product} as a product route`);
    }
    const routeSurfaces = descendantElements(routeMap).filter(
      (element) => hasClass(element, "sk-pattern-product-route-map__primary") || hasClass(element, "sk-pattern-product-route-map__secondary"),
    );
    if (routeSurfaces.some((element) => /\bSanchika\b/.test(visibleText(element)))) {
      fail("ProductRouteMap must not require Sanchika as a peer product route");
    }
    const colophon = descendantElements(routeMap).find((element) => hasClass(element, "sk-pattern-product-route-map__colophon"));
    const colophonLink = colophon?.children.find((element) => element.tag === "a" && getAttribute(element.attrs, "href"));
    if (!colophonLink || !/Sanchika/i.test(visibleText(colophonLink))) {
      fail("ProductRouteMap must place Sanchika support in a linked colophon");
    }
  }

  const publicHero = requireClassElement(publicMarkup, "sk-pattern-public-hero", fail, "PublicHero");
  if (publicHero) {
    if (descendantElements(publicHero).filter((element) => /^h[1-6]$/.test(element.tag)).length !== 1) fail("PublicHero must contain one concise message heading");
    if (!descendantElements(publicHero).some((element) => hasClass(element, "sk-pattern-public-hero-note"))) fail("PublicHero must contain one proof slot");
    if (!descendantElements(publicHero).some((element) => element.tag === "a" && hasClass(element, "sk-pattern-public-hero__action") && getAttribute(element.attrs, "href"))) {
      fail("PublicHero must contain a linked safe action");
    }
  }
  for (const groupName of ["axal-workspace", "pack-local-utility", "tools-local-artifact"]) {
    if (elementsWithClass(markupByGroup.get(groupName) ?? "", "sk-pattern-public-hero").length > 0) {
      fail(`${groupName} must not stamp a generic introduction as PublicHero`);
    }
  }

  const proofStrip = requireClassElement(publicMarkup, "sk-pattern-proof-strip", fail, "ProofStrip");
  if (proofStrip) {
    const facts = proofStrip.children.filter((element) => element.tag === "div");
    if (facts.length === 0) fail("ProofStrip must contain sourced facts");
    for (const [index, fact] of facts.entries()) {
      if (!descendantElements(fact).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) fail(`ProofStrip fact ${index + 1} must include a source link`);
    }
    if (hasClass(proofStrip, "sk-pattern-proof-strip--state-limited")) {
      const proofText = visibleText(proofStrip);
      for (const signal of ["limited", "checked", "missing proof", "next check"]) {
        if (!new RegExp(`\\b${signal}\\b`, "i").test(proofText)) fail(`ProofStrip limited state must visibly include ${signal}`);
      }
    }
  }

  const trustBoundary = requireClassElement(publicMarkup, "sk-pattern-trust-boundary", fail, "TrustBoundary");
  if (trustBoundary) {
    const trustText = visibleText(trustBoundary);
    for (const signal of ["Crosses", "Never crosses", "Action owner", "Safe action"]) {
      if (!new RegExp(`\\b${signal}\\b`, "i").test(trustText)) fail(`TrustBoundary must visibly include ${signal}`);
    }
    if (!descendantElements(trustBoundary).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) {
      fail("TrustBoundary must include a source link");
    }
  }

  validateProvenanceStructure({ markup: publicMarkup, label: "public SourceProvenanceStrip", fail });
  const pricing = requireClassElement(publicMarkup, "sk-pattern-pricing-block", fail, "PricingBlock");
  if (pricing) {
    const prices = [...new Set(visibleText(pricing).match(/₹\s?[\d,.]+/g) ?? [])];
    if (prices.length !== 1) fail(`PricingBlock must render one unambiguous public price; found ${prices.length}`);
    if (!descendantElements(pricing).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) fail("PricingBlock must include a native action");
  }

  const faq = requireClassElement(publicMarkup, "sk-pattern-faq-accordion", fail, "FAQAccordion");
  if (faq) {
    const details = descendantElements(faq).filter((element) => element.tag === "details");
    if (details.length === 0 || details.some((element) => !element.children.some((child) => child.tag === "summary"))) {
      fail("FAQAccordion must use native details and summary for every item");
    }
    validateFaqJsonLd({ faq, fail });
  }

  const releaseBanner = requireClassElement(publicMarkup, "sk-pattern-release-status-banner", fail, "ReleaseStatusBanner");
  if (releaseBanner) {
    const releaseText = visibleText(releaseBanner);
    for (const signal of ["status", "reviewed", "unproven"]) {
      if (!new RegExp(signal, "i").test(releaseText)) fail(`ReleaseStatusBanner must expose snapshot ${signal}`);
    }
    if (hasClass(releaseBanner, "sk-pattern-release-status-banner--state-planned")) {
      for (const signal of ["planned", "no release claim", "source"]) {
        if (!new RegExp(`\\b${signal}\\b`, "i").test(releaseText)) fail(`ReleaseStatusBanner planned state must visibly include ${signal}`);
      }
      if (!descendantElements(releaseBanner).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) {
        fail("ReleaseStatusBanner planned state must include an evidence link");
      }
    }
  }

  const axalMarkup = markupByGroup.get("axal-workspace") ?? "";
  const reviewDesk = requireClassElement(axalMarkup, "sk-pattern-review-desk-preview", fail, "ReviewDeskPreview");
  if (reviewDesk) {
    const text = visibleText(reviewDesk);
    for (const signal of ["Work queue", "Selected item", "Source evidence", "Owner", "Due", "Blocker", "Next safe action", "Human approval checkpoint", "Audit trail"]) {
      if (!text.includes(signal)) fail(`ReviewDeskPreview must visibly include ${signal}`);
    }
    for (const className of ["sk-pattern-work-queue-row", "sk-pattern-evidence-panel", "sk-pattern-human-review-checkpoint", "sk-pattern-audit-trail-preview"]) {
      if (!descendantElements(reviewDesk).some((element) => hasClass(element, className))) fail(`ReviewDeskPreview must structurally include ${className}`);
    }
    for (const [index, row] of descendantElements(reviewDesk).filter((element) => hasClass(element, "sk-pattern-work-queue-row")).entries()) {
      const rowText = visibleText(row);
      for (const signal of ["Entity", "Source", "Owner", "Due", "Blocker", "Next"]) {
        if (!rowText.includes(signal)) fail(`WorkQueueRow ${index + 1} must include ${signal}`);
      }
      if (hasClass(row, "sk-pattern-work-queue-row--state-selected") && !/\bselected\b/i.test(rowText)) {
        fail(`WorkQueueRow ${index + 1} selected state must include visible selected text`);
      }
      for (const [stateClass, signals] of [
        ["sk-pattern-work-queue-row--state-waiting", ["waiting", "dependency", "owner"]],
        ["sk-pattern-work-queue-row--state-ready", ["ready", "source linked", "review owner"]],
      ]) {
        if (hasClass(row, stateClass)) {
          for (const signal of signals) if (!new RegExp(`\\b${signal}\\b`, "i").test(rowText)) fail(`WorkQueueRow ${index + 1} ${stateClass.split("--state-")[1]} state must include ${signal}`);
        }
      }
    }
    const checkpoint = descendantElements(reviewDesk).find((element) => hasClass(element, "sk-pattern-human-review-checkpoint"));
    if (checkpoint) {
      const checkpointText = visibleText(checkpoint);
      for (const signal of ["review needed", "Owner", "Evidence", "Blocker", "Next safe action", "History"]) {
        if (!new RegExp(`\\b${signal}\\b`, "i").test(checkpointText)) fail(`HumanReviewCheckpoint must visibly include ${signal}`);
      }
      if (!descendantElements(checkpoint).some((element) => ["a", "button"].includes(element.tag) && (element.tag === "button" || getAttribute(element.attrs, "href")))) {
        fail("HumanReviewCheckpoint must expose a native operable action");
      }
    }
    const auditTrail = descendantElements(reviewDesk).find((element) => hasClass(element, "sk-pattern-audit-trail-preview"));
    if (auditTrail && !descendantElements(auditTrail).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) {
      fail("AuditTrailPreview must include a native inspect action");
    }
    if (!/synthetic/i.test(text)) fail("ReviewDeskPreview must visibly mark synthetic data");
    if (/\bAI (?:approved|filed|submitted|replied|decided)\b/i.test(text)) fail("ReviewDeskPreview must not present AI output as final or autonomous");
  }

  const packMarkup = markupByGroup.get("pack-local-utility") ?? "";
  const permission = requireClassElement(packMarkup, "sk-pattern-permission-explainer", fail, "PermissionExplainer");
  if (permission) {
    const text = visibleText(permission);
    for (const signal of ["Purpose", "Scope", "Data touched", "Data not touched", "If denied"]) {
      if (!text.includes(signal)) fail(`PermissionExplainer must include ${signal}`);
    }
    const button = descendantElements(permission).find((element) => element.tag === "button");
    if (!button || permission.body.indexOf("If denied") > permission.body.indexOf(button.body)) fail("PermissionExplainer must place denial behavior before its request action");
  }

  const artifactFlow = requireClassElement(packMarkup, "sk-pattern-local-artifact-flow", fail, "LocalArtifactFlow");
  if (artifactFlow) {
    const stageList = descendantElements(artifactFlow).find((element) => hasClass(element, "sk-pattern-local-artifact-flow__stages"));
    const stages = stageList?.children.filter((element) => element.tag === "li") ?? [];
    if (stages.length === 0) fail("LocalArtifactFlow must contain custody stages");
    for (const [index, stage] of stages.entries()) {
      const text = visibleText(stage);
      for (const signal of ["Custodian / location", "Data / action", "Crosses", "Never crosses", "Source", "Result"]) {
        if (!text.includes(signal)) fail(`LocalArtifactFlow stage ${index + 1} must include ${signal}`);
      }
      const custodianTerm = descendantElements(stage).find((element) => element.tag === "dt" && visibleText(element) === "Custodian / location");
      const followingDefinition = custodianTerm && descendantElements(stage).find((element) => element.tag === "dd" && element.openEnd > custodianTerm.openEnd);
      if (!followingDefinition || visibleText(followingDefinition).length === 0) fail(`LocalArtifactFlow stage ${index + 1} must name its current custodian`);
    }
  }
  const custodyBoundary = requireClassElement(packMarkup, "sk-pattern-custody-boundary", fail, "CustodyBoundary");
  if (custodyBoundary) {
    const text = visibleText(custodyBoundary);
    for (const signal of ["Current custodian", "What moves", "What never moves", "Credentials", "Local destination", "User control"]) {
      if (!text.includes(signal)) fail(`CustodyBoundary must include ${signal}`);
    }
    if (hasClass(custodyBoundary, "sk-pattern-custody-boundary--state-local-only")) {
      for (const signal of ["local only", "destination", "no handoff"]) {
        if (!new RegExp(`\\b${signal}\\b`, "i").test(text)) fail(`CustodyBoundary local-only state must visibly include ${signal}`);
      }
    }
  }
  const packReleaseBanner = requireClassElement(packMarkup, "sk-pattern-release-status-banner", fail, "Pack ReleaseStatusBanner");
  if (packReleaseBanner && hasClass(packReleaseBanner, "sk-pattern-release-status-banner--state-planned")) {
    const releaseText = visibleText(packReleaseBanner);
    for (const signal of ["planned", "no release claim", "source"]) {
      if (!new RegExp(`\\b${signal}\\b`, "i").test(releaseText)) fail(`Pack ReleaseStatusBanner planned state must visibly include ${signal}`);
    }
    if (!descendantElements(packReleaseBanner).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) fail("Pack ReleaseStatusBanner must include a source link");
  }
  validateProvenanceStructure({ markup: packMarkup, label: "Pack SourceProvenanceStrip", fail });

  const toolsMarkup = markupByGroup.get("tools-local-artifact") ?? "";
  const localBanner = requireClassElement(toolsMarkup, "sk-pattern-local-boundary-banner", fail, "LocalBoundaryBanner");
  if (localBanner && !descendantElements(localBanner).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) fail("LocalBoundaryBanner must include a source link");
  const directory = requireClassElement(toolsMarkup, "sk-pattern-tool-directory", fail, "ToolDirectory");
  if (directory) {
    for (const attribute of ["data-tool-search", "data-tool-filters", "data-tool-results", "data-tool-empty"]) {
      if (!descendantElements(directory).some((element) => hasAttribute(element.attrs, attribute))) fail(`ToolDirectory must include ${attribute}`);
    }
    if (!descendantElements(directory).some((element) => getAttribute(element.attrs, "role") === "status")) fail("ToolDirectory must include a result status live region");
    const cards = descendantElements(directory).filter((element) => hasClass(element, "sk-pattern-tool-card"));
    if (cards.length === 0) fail("ToolDirectory must server-render its complete ToolCard list");
    for (const card of cards) {
      if (card.tag !== "a" || !getAttribute(card.attrs, "href") || getAttribute(card.attrs, "data-sk-primitive") !== "LinkCard") fail("ToolCard must use root-anchor LinkCard semantics");
      const labels = descendantElements(card).filter((element) => element.tag === "dt").map(visibleText);
      for (const label of ["Input", "Output", "Review", "Boundary", "Status"]) {
        if (!labels.includes(label)) fail(`ToolCard must include ${label}`);
      }
    }
    validateLinkCardExemplars({ markup: directory.body, fail });
  }

  const output = requireClassElement(toolsMarkup, "sk-pattern-output-artifact-summary", fail, "OutputArtifactSummary");
  if (output) {
    const text = visibleText(output);
    for (const signal of ["Draft output", "Artifact type", "Status / reviewer", "Limitation", "Next action"]) {
      if (!text.includes(signal)) fail(`OutputArtifactSummary must include ${signal}`);
    }
    if (/\b(?:professionally\s+)?approved\b|\bapproval complete\b/i.test(text)) fail("OutputArtifactSummary must not imply generated output is approved");
    const nextActionTerm = descendantElements(output).find((element) => element.tag === "dt" && visibleText(element) === "Next action");
    const nextActionDefinition = nextActionTerm && descendantElements(output).find((element) => element.tag === "dd" && element.openEnd > nextActionTerm.openEnd);
    if (!nextActionDefinition || !descendantElements(nextActionDefinition).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) {
      fail("OutputArtifactSummary next action must use a native link");
    }
  }

  for (const contract of contracts) {
    const markup = markupByGroup.get(contract.group) ?? "";
    const proofStates = contract.states.length > 1 ? [contract.states[0], contract.states.at(-1)] : contract.states;
    for (const state of proofStates) {
      if (state && !markup.includes(`data-product-pattern-state="${contract.name}:${state.name}"`)) fail(`${contract.name} must render ${state.name} state proof from package metadata`);
    }
  }
}

export function runProductPatternExemplarFixtures() {
  const valid = validProductPatternFixtureMarkup();
  const cases = [
    { name: "complete product pattern structures", expected: null },
    { name: "ProductRouteMap without colophon", group: "public-product", replace: ['<footer class="sk-pattern-product-route-map__colophon"><a href="/patterns/">Sanchika pattern contracts</a></footer>', ""], expected: "linked colophon" },
    { name: "Sanchika as peer route", group: "public-product", replace: ["<h2>Tools</h2>", "<h2>Tools</h2><p>Sanchika</p>"], expected: "peer product route" },
    { name: "conflicting annual prices", group: "public-product", replace: ["₹12,500", "₹12,500 annual · ₹10,000 annual"], expected: "one unambiguous public price" },
    { name: "PricingBlock without native action", group: "public-product", replace: ['<a href="/consult">Consult</a>', ""], expected: "native action" },
    { name: "FAQ JSON-LD mismatch", group: "public-product", replace: ['"Does this submit?"', '"Different question"'], expected: "JSON-LD questions must match" },
    { name: "limited ProofStrip without missing-proof context", group: "public-product", replace: ["Missing proof", "Pending artifact"], expected: "limited state must visibly include missing proof" },
    { name: "planned ReleaseStatusBanner without source evidence", group: "public-product", replace: ['<a href="/release-source">Source evidence</a>', ""], expected: "planned state must include an evidence link" },
    { name: "PublicHero without safe action", group: "public-product", replace: ['<a class="sk-pattern-public-hero__action" href="/route">Choose route</a>', ""], expected: "linked safe action" },
    { name: "PublicHero stamped on non-public intro", group: "axal-workspace", replace: ['<main data-sanchika-example="synthetic">', '<main data-sanchika-example="synthetic"><header class="sk-pattern-public-hero"></header>'], expected: "must not stamp a generic introduction" },
    { name: "ReviewDeskPreview without human review", group: "axal-workspace", replace: ["sk-pattern-human-review-checkpoint", "missing-human-review-checkpoint"], expected: "sk-pattern-human-review-checkpoint" },
    { name: "selected WorkQueueRow without visible selection", group: "axal-workspace", replace: ["Selected item · Entity", "Active item · Entity"], expected: "visible selected text" },
    { name: "waiting WorkQueueRow without dependency", group: "axal-workspace", replace: ["Waiting · Dependency evidence · Entity synthetic B", "Waiting · Evidence pending · Entity synthetic B"], expected: "waiting state must include dependency" },
    { name: "ready WorkQueueRow without source signal", group: "axal-workspace", replace: ["Ready · Source linked · Review owner MK · Entity synthetic C · Source linked", "Ready · Evidence available · Review owner MK · Entity synthetic C · Source available"], expected: "ready state must include source linked" },
    { name: "checkpoint without required context", group: "axal-workspace", replace: ["Evidence linked · Blocker none · Next safe action open source · History 14 July 2026", "Decision pending"], expected: "HumanReviewCheckpoint must visibly include" },
    { name: "checkpoint without native action", group: "axal-workspace", replace: ['<a href="/evidence">Open evidence</a>', "Open evidence"], expected: "native operable action" },
    { name: "AuditTrailPreview without inspect action", group: "axal-workspace", replace: ['<a href="/audit">Inspect trail</a>', ""], expected: "native inspect action" },
    { name: "unmarked synthetic data", group: "axal-workspace", replace: [' data-sanchika-example="synthetic"', ""], expected: "mark synthetic exemplar data" },
    { name: "custody stage without custodian", group: "pack-local-utility", replace: ["<dt>Custodian / location</dt><dd>Browser session</dd>", "<dt>Custodian / location</dt><dd></dd>"], expected: "name its current custodian" },
    { name: "local CustodyBoundary without visible state", group: "pack-local-utility", replace: ["Local only · destination · no handoff · ", ""], expected: "local-only state must visibly include local only" },
    { name: "Pack planned banner without no-release claim", group: "pack-local-utility", replace: ["Planned · no release claim · Source", "Planned · Source"], expected: "planned state must visibly include no release claim" },
    { name: "permission without denial behavior", group: "pack-local-utility", replace: ["<span>If denied: use manual download</span>", ""], expected: "include If denied" },
    { name: "ToolDirectory missing no-results", group: "tools-local-artifact", replace: ['<div data-tool-empty hidden>No results</div>', ""], expected: "data-tool-empty" },
    { name: "ToolCard nested button", group: "tools-local-artifact", replace: ["Inspect tool contract</a>", "Inspect tool contract<button>Run</button></a>"], expected: "nested interactive <button>" },
    { name: "provenance without source link", group: "public-product", replace: ['<a href="/source">Source</a>', "Source"], expected: "source link" },
    { name: "quiet seal without verifier and time", group: "public-product", replace: ["14 July 2026 · S7 validator", "Current"], expected: "verifier and checked time" },
    { name: "generated output implying approval", group: "tools-local-artifact", replace: ["Ready for review", "Professionally approved"], expected: "must not imply generated output is approved" },
    { name: "OutputArtifactSummary without linked next action", group: "tools-local-artifact", replace: ['<a href="/draft">Inspect draft</a>', "Inspect draft"], expected: "next action must use a native link" },
  ];
  const failures = [];
  for (const fixture of cases) {
    const markupByGroup = new Map(valid);
    if (fixture.group) markupByGroup.set(fixture.group, markupByGroup.get(fixture.group).replace(...fixture.replace));
    const findings = [];
    validateProductPatternExemplars({ markupByGroup, fail: (message) => findings.push(message) });
    const passed = fixture.expected ? findings.some((finding) => finding.includes(fixture.expected)) : findings.length === 0;
    if (!passed) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${findings.join("; ") || "success"}`);
  }
  return { count: cases.length, failures };
}

function validProductPatternFixtureMarkup() {
  return new Map([
    [
      "public-product",
      `<main data-sanchika-example="synthetic">
        <section class="sk-pattern-public-hero"><h2>Choose the operating route.</h2><a class="sk-pattern-public-hero__action" href="/route">Choose route</a><aside class="sk-pattern-public-hero-note">Source-backed proof</aside></section>
        <dl class="sk-pattern-proof-strip sk-pattern-proof-strip--state-limited"><div><dt>Contract</dt><dd>Limited · checked 14 July 2026 · <a href="/source">Source</a></dd></div><div><dt>Status</dt><dd>Missing proof · next check after release · <a href="/status">Snapshot</a></dd></div></dl>
        <aside class="sk-pattern-trust-boundary"><a href="/source">Source</a><dl><div><dt>Crosses</dt><dd>Chosen data</dd></div><div><dt>Never crosses</dt><dd>Credentials</dd></div><div><dt>Action owner</dt><dd>User</dd></div><div><dt>Safe action</dt><dd>Inspect boundary</dd></div></dl></aside>
        <section class="sk-pattern-product-route-map"><article class="sk-pattern-product-route-map__primary"><h2>Axal</h2></article><div class="sk-pattern-product-route-map__secondary"><article><h2>Pack</h2></article><article><h2>Tools</h2></article></div><footer class="sk-pattern-product-route-map__colophon"><a href="/patterns/">Sanchika pattern contracts</a></footer></section>
        <section class="sk-pattern-source-provenance-strip"><div><a href="/source">Source</a></div><div class="sk-pattern-grammar--quiet-verified-seal">14 July 2026 · S7 validator</div></section>
        <section class="sk-pattern-pricing-block"><p>₹12,500</p><a href="/consult">Consult</a></section>
        <section class="sk-pattern-faq-accordion"><details><summary>Does this submit?</summary><p>No.</p></details><script type="application/ld+json" data-pattern-faq-jsonld>{"mainEntity":[{"name":"Does this submit?"}]}</script></section>
        <aside class="sk-pattern-release-status-banner sk-pattern-release-status-banner--state-planned">Planned status · no release claim · reviewed 14 July 2026 · adoption unproven · <a href="/release-source">Source evidence</a></aside>
      </main>`,
    ],
    [
      "axal-workspace",
      `<main data-sanchika-example="synthetic"><section class="sk-pattern-review-desk-preview">
        <section><h2>Work queue</h2><article class="sk-pattern-work-queue-row sk-pattern-work-queue-row--state-selected">Selected item · Entity synthetic A · Source linked · Owner AK · Due today · Blocker none · Next safe action open source</article><article class="sk-pattern-work-queue-row sk-pattern-work-queue-row--state-waiting">Waiting · Dependency evidence · Entity synthetic B · Source requested · Owner RS · Due pending · Blocker evidence · Next request evidence</article><article class="sk-pattern-work-queue-row sk-pattern-work-queue-row--state-ready">Ready · Source linked · Review owner MK · Entity synthetic C · Source linked · Owner MK · Due today · Blocker none · Next open source</article></section>
        <aside class="sk-pattern-evidence-panel">Source evidence · synthetic source</aside>
        <section class="sk-pattern-human-review-checkpoint">Human approval checkpoint · review needed · Owner AK · Evidence linked · Blocker none · Next safe action open source · History 14 July 2026 · <a href="/evidence">Open evidence</a></section>
        <section class="sk-pattern-audit-trail-preview">Audit trail · <a href="/audit">Inspect trail</a></section>
      </section></main>`,
    ],
    [
      "pack-local-utility",
      `<main data-sanchika-example="synthetic">
        <aside class="sk-pattern-permission-explainer"><span>Purpose: local file</span><span>Scope: current action</span><span>Data touched: response</span><span>Data not touched: credentials</span><span>If denied: use manual download</span><button>Review permission</button></aside>
        <section class="sk-pattern-local-artifact-flow"><ol class="sk-pattern-local-artifact-flow__stages"><li><dl><div><dt>Custodian / location</dt><dd>Browser session</dd></div><div><dt>Data / action</dt><dd>Portal response</dd></div><div><dt>Crosses</dt><dd>Portal to browser</dd></div><div><dt>Never crosses</dt><dd>Credentials</dd></div><div><dt>Source</dt><dd>Portal</dd></div><div><dt>Result</dt><dd>Local file</dd></div></dl></li></ol>
          <dl class="sk-pattern-custody-boundary sk-pattern-custody-boundary--state-local-only"><div>Local only · destination · no handoff · Current custodian</div><div>What moves</div><div>What never moves</div><div>Credentials</div><div>Local destination</div><div>User control</div></dl>
          <section class="sk-pattern-source-provenance-strip"><a href="/source">Source</a><div class="sk-pattern-grammar--quiet-verified-seal">14 July 2026 · S7 validator</div></section>
          <aside class="sk-pattern-release-status-banner sk-pattern-release-status-banner--state-planned">Planned · no release claim · Source · <a href="/releases">Review releases</a></aside>
        </section>
      </main>`,
    ],
    [
      "tools-local-artifact",
      `<main data-sanchika-example="synthetic">
        <aside class="sk-pattern-local-boundary-banner"><a href="/source">Source</a></aside>
        <section class="sk-pattern-tool-directory"><p role="status">1 result</p><input data-tool-search><div data-tool-filters></div><div data-tool-results><a class="sk-pattern-tool-card" href="/tool" data-sk-primitive="LinkCard" data-sk-state="default"><dl><div><dt>Input</dt><dd>Facts</dd></div><div><dt>Output</dt><dd>Draft</dd></div><div><dt>Review</dt><dd>CA</dd></div><div><dt>Boundary</dt><dd>Local</dd></div><div><dt>Status</dt><dd>Available</dd></div></dl>Inspect tool contract</a></div><div data-tool-empty hidden>No results</div></section>
        <aside class="sk-pattern-output-artifact-summary">Draft output · Artifact type · Status / reviewer · Ready for review · Limitation · <dl><div><dt>Next action</dt><dd><a href="/draft">Inspect draft</a></dd></div></dl></aside>
      </main>`,
    ],
  ]);
}

function requireClassElement(markup, className, fail, label) {
  const element = elementsWithClass(markup, className)[0];
  if (!element) fail(`${label} must render structural root ${className}`);
  return element;
}

function validateProvenanceStructure({ markup, label, fail }) {
  const provenance = elementsWithClass(markup, "sk-pattern-source-provenance-strip")[0];
  if (!provenance) {
    fail(`${label} must render structural root sk-pattern-source-provenance-strip`);
    return;
  }
  if (!descendantElements(provenance).some((element) => element.tag === "a" && getAttribute(element.attrs, "href"))) {
    fail(`${label} must include a source link`);
  }
  const seal = descendantElements(provenance).find((element) => hasClass(element, "sk-pattern-grammar--quiet-verified-seal"));
  const sealText = seal ? visibleText(seal) : "";
  if (!seal || !/\b(?:validator|verifier|reviewer|source owner)\b/i.test(sealText) || !/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/.test(sealText)) {
    fail(`${label} quiet seal must name verifier and checked time`);
  }
}

function validateFaqJsonLd({ faq, fail }) {
  const summaries = descendantElements(faq).filter((element) => element.tag === "summary").map(visibleText);
  const jsonLd = descendantElements(faq).find((element) => element.tag === "script" && hasAttribute(element.attrs, "data-pattern-faq-jsonld"));
  if (!jsonLd) return;
  try {
    const data = JSON.parse(jsonLd.body);
    const jsonQuestions = (data.mainEntity ?? []).map((item) => item.name);
    if (JSON.stringify(jsonQuestions) !== JSON.stringify(summaries)) fail("FAQAccordion JSON-LD questions must match visible summary text exactly");
  } catch {
    fail("FAQAccordion JSON-LD must be valid JSON");
  }
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
      if (matchingIndex >= 0) {
        const element = stack[matchingIndex];
        element.body = markup.slice(element.openEnd, match.index);
        stack.length = matchingIndex;
      }
      continue;
    }

    const attrs = source.replace(/^<[^\s>]+/, "").replace(/\/?>$/, "");
    const element = { tag, attrs, children: [], body: "", openEnd: match.index + source.length };
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

function elementsWithClass(markup, className) {
  return flattenElements(parseHtmlElements(markup)).filter((element) => hasClass(element, className));
}

function hasClass(element, className) {
  return (getAttribute(element.attrs, "class") ?? "").split(/\s+/).includes(className);
}

function visibleText(element) {
  return (element.body ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function descendantElements(element) {
  return flattenElements(element.children);
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
  return source.match(new RegExp(`(?:^|\\s)${name}="([^"]+)"`))?.[1] ?? null;
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

import ts from "typescript";
import { requiredPatternContracts } from "./contrast.mjs";
import { validateTrustBoundarySignals } from "./trust-boundary-contracts.mjs";

const a11ySourceByCriterion = new Map([
  ["WCAG22:1.3.1", "https://www.w3.org/TR/WCAG22/#info-and-relationships"],
  ["WCAG22:1.4.3", "https://www.w3.org/TR/WCAG22/#contrast-minimum"],
  ["WCAG22:1.4.11", "https://www.w3.org/TR/WCAG22/#non-text-contrast"],
  ["WCAG22:2.1.1", "https://www.w3.org/TR/WCAG22/#keyboard"],
  ["WCAG22:2.4.7", "https://www.w3.org/TR/WCAG22/#focus-visible"],
  ["WCAG22:2.5.8", "https://www.w3.org/TR/WCAG22/#target-size-minimum"],
  ["WCAG22:3.3.1", "https://www.w3.org/TR/WCAG22/#error-identification"],
  ["WCAG22:3.3.2", "https://www.w3.org/TR/WCAG22/#labels-or-instructions"],
  ["WCAG22:4.1.2", "https://www.w3.org/TR/WCAG22/#name-role-value"],
  ["WCAG22:4.1.3", "https://www.w3.org/TR/WCAG22/#status-messages"],
]);

const requiredPatternCriterionReferences = [
  ["WCAG22:1.3.1", "https://www.w3.org/TR/WCAG22/#info-and-relationships"],
  ["WCAG22:1.4.3", "https://www.w3.org/TR/WCAG22/#contrast-minimum"],
  ["WCAG22:1.4.11", "https://www.w3.org/TR/WCAG22/#non-text-contrast"],
  ["WCAG22:2.1.1", "https://www.w3.org/TR/WCAG22/#keyboard"],
  ["WCAG22:2.4.7", "https://www.w3.org/TR/WCAG22/#focus-visible"],
  ["WCAG22:2.5.8", "https://www.w3.org/TR/WCAG22/#target-size-minimum"],
  ["WCAG22:3.3.1", "https://www.w3.org/TR/WCAG22/#error-identification"],
  ["WCAG22:3.3.2", "https://www.w3.org/TR/WCAG22/#labels-or-instructions"],
  ["WCAG22:4.1.2", "https://www.w3.org/TR/WCAG22/#name-role-value"],
  ["WCAG22:4.1.3", "https://www.w3.org/TR/WCAG22/#status-messages"],
];

const ariaLiveByRole = new Map([
  ["status", "polite"],
  ["alert", "assertive"],
]);

const expectedProductPatternGroups = [
  ["public-product", ["PublicHero", "ProductRouteMap", "ProofStrip", "TrustBoundary", "SourceProvenanceStrip", "PricingBlock", "FAQAccordion", "ReleaseStatusBanner"]],
  ["axal-workspace", ["ReviewDeskPreview", "EvidencePanel", "HumanReviewCheckpoint", "AuditTrailPreview", "WorkQueueRow"]],
  ["pack-local-utility", ["LocalArtifactFlow", "PermissionExplainer", "CustodyBoundary"]],
  ["tools-local-artifact", ["ToolDirectory", "ToolCard", "LocalBoundaryBanner", "OutputArtifactSummary"]],
];

const expectedProductPatternNames = expectedProductPatternGroups.flatMap(([, names]) => names);
const requiredAnatomyByPattern = new Map([
  ["PublicHero", ["eyebrow", "title", "lede", "actions", "proof", "boundaryStatement"]],
  ["ProductRouteMap", ["routeSummary", "primaryRoute", "secondaryRoutes", "boundaryLabels", "currentStatus", "routeActions", "proofOrSource", "colophon"]],
  ["ProofStrip", ["proofItems", "checkedAt"]],
  ["TrustBoundary", ["boundarySummary", "boundaryFacts", "neverCrosses", "actionOwner", "sourceEvidence", "safeAction"]],
  ["SourceProvenanceStrip", ["sourceType", "sources", "releaseVersion", "checksumReference", "checkedAt", "reviewOwner", "visibleStatus", "limitation"]],
  ["PricingBlock", ["price", "status", "effectiveAt", "inclusions", "exclusions", "action", "sourceOwner"]],
  ["FAQAccordion", ["question", "answer"]],
  ["ReleaseStatusBanner", ["productPackage", "releaseVersion", "effectiveAt", "status", "source", "supportedScope", "knownLimitation", "safeAction"]],
  ["ReviewDeskPreview", ["syntheticMarker", "workQueue", "selectedWork", "evidence", "ownerDueReview", "blockedReason", "nextSafeAction", "checkpoint", "auditTrail"]],
  ["EvidencePanel", ["sourceList", "checkedAt", "reviewState", "uncertainty", "reviewer", "safeAction"]],
  ["HumanReviewCheckpoint", ["preparationState", "reviewOwner", "sourceReadiness", "blockers", "decisionActions", "nextSafeAction", "timestampHistory"]],
  ["AuditTrailPreview", ["events", "resultingState", "optionalNote"]],
  ["WorkQueueRow", ["identity", "clientEntity", "priority", "dueState", "owner", "sourceState", "reviewState", "blockedReason", "nextSafeAction"]],
  ["LocalArtifactFlow", ["sourceStage", "localActionStage", "destinationStage", "stepCustody", "sourceEvidence", "resultingArtifact"]],
  ["PermissionExplainer", ["permission", "purpose", "scope", "dataTouched", "dataNotTouched", "denialBehavior", "sourcePolicy"]],
  ["CustodyBoundary", ["boundaryOwner", "insideBoundary", "outsideBoundary", "crossingEvent", "neverCrosses", "userControl", "networkDestination", "sourceProof"]],
  ["ToolDirectory", ["search", "filters", "toolList", "emptyState", "workspaceHandoff"]],
  ["ToolCard", ["category", "title", "input", "output", "review", "boundary", "status", "action"]],
  ["LocalBoundaryBanner", ["processingLocation", "accountFact", "uploadFact", "networkTelemetryFact", "reviewFact", "sourcePolicy"]],
  ["OutputArtifactSummary", ["artifactType", "generatedFrom", "generatedOutput", "destination", "draftReviewStatus", "reviewRequirement", "limitations", "nextAction"]],
]);
const requiredStatesByPattern = new Map([
  ["PublicHero", ["default", "with-proof-artifact", "compact-mobile"]],
  ["ProductRouteMap", ["default", "compact", "limited", "unavailable", "colophon"]],
  ["SourceProvenanceStrip", ["current", "stale", "unavailable", "limited", "unverified"]],
  ["ReleaseStatusBanner", ["current", "alpha", "stale", "limited", "planned", "unavailable"]],
  ["ReviewDeskPreview", ["ca-review-needed", "client-input-pending", "evidence-requested", "source-unavailable", "ready-for-reviewer", "blocked"]],
  ["EvidencePanel", ["available", "requested", "missing", "stale", "disputed", "under-review"]],
  ["HumanReviewCheckpoint", ["preparation", "review-needed", "held", "approved", "rejected-returned", "blocked"]],
  ["AuditTrailPreview", ["compact", "expanded"]],
  ["PermissionExplainer", ["required", "optional", "denied", "unavailable", "not-requested"]],
  ["CustodyBoundary", ["local-only", "workspace-scoped", "public-metadata-only", "transfer-pending", "no-transfer"]],
  ["ToolDirectory", ["default", "filtered", "no-results"]],
  ["OutputArtifactSummary", ["generated-draft", "ready-for-review", "copied-downloaded", "failed", "unavailable"]],
]);
const requiredFieldsByPattern = new Map([
  ["PricingBlock", ["action"]],
  ["PermissionExplainer", ["requestAction"]],
  ["HumanReviewCheckpoint", ["evidenceLink"]],
  ["AuditTrailPreview", ["inspectAction"]],
  ["WorkQueueRow", ["priority"]],
  ["CustodyBoundary", ["networkDestination"]],
  ["OutputArtifactSummary", ["nextAction"]],
]);
const requiredVisualGrammar = [
  ["ledgerRail", "sk-pattern-grammar--ledger-rail"],
  ["fileTabLabel", "sk-pattern-grammar--file-tab-label"],
  ["provenanceStrip", "sk-pattern-grammar--provenance-strip"],
  ["evidenceAperture", "sk-pattern-grammar--evidence-aperture"],
  ["custodyLine", "sk-pattern-grammar--custody-line"],
  ["quietVerifiedSeal", "sk-pattern-grammar--quiet-verified-seal"],
];
const requiredContractArrays = [
  "intendedProducts",
  "anatomy",
  "requiredFields",
  "variants",
  "states",
  "copyObligations",
  "prohibitedClaims",
  "nonColorRules",
  "trustBoundaries",
  "responsiveBehavior",
  "reducedMotionBehavior",
  "forcedColorsBehavior",
  "consumerResponsibilities",
  "exemplarRoutes",
  "adopterGuidance",
  "nonGoals",
];
const requiredAccessibilityHooks = ["semantics", "keyboard", "announcements", "focusOrder"];

export function validatePatternContracts({ patternSource, patternDocs, fail }) {
  for (const requiredPatternContract of requiredPatternContracts) {
    if (!patternSource.includes(requiredPatternContract)) {
      fail(`pattern specs must declare ${requiredPatternContract}`);
    }
    if (!patternDocs.includes(requiredPatternContract)) {
      fail(`docs/patterns.md must document ${requiredPatternContract}`);
    }
  }

  for (const [criterion, sourceUrl] of requiredPatternCriterionReferences) {
    if (!patternSource.includes(`criterion: "${criterion}"`) || !patternSource.includes(`sourceUrl: "${sourceUrl}"`)) {
      fail(`PatternA11ySourceReference must include ${criterion} with ${sourceUrl}`);
    }
    if (!patternDocs.includes(criterion) || !patternDocs.includes(sourceUrl)) {
      fail(`docs/patterns.md must document ${criterion} with ${sourceUrl}`);
    }
  }

  const patternSpecs = extractPatternSpecs(patternSource, fail);
  for (const pattern of patternSpecs) {
    const topLevelSlots = new Set(pattern.requiredSlots.map((slot) => slot.name));
    for (const state of pattern.requiredStates) {
      for (const slotName of state.requiredSlots ?? []) {
        if (!topLevelSlots.has(slotName)) {
          fail(`${pattern.name}.${state.name} requires unknown slot ${slotName}`);
        }
      }
      validateA11yChecks({ pattern, state, topLevelSlots, fail });
      validateProgrammaticStatus({ pattern, state, topLevelSlots, fail });
      validateTrustBoundarySignals({ pattern, state, fail });
    }
  }

  for (const requiredDocFragment of ["ariaAtomic", "aria-atomic"]) {
    if (!patternDocs.includes(requiredDocFragment)) {
      fail(`docs/patterns.md must document ${requiredDocFragment}`);
    }
  }
}

export function validateProductPatternContracts({
  contracts,
  groups,
  aliases,
  visualGrammar,
  retainedLegacyPatternNames,
  className,
  resolve,
  css,
  exemplarRoutes,
  fail,
}) {
  for (const issue of collectProductPatternIssues({ contracts, groups, css, exemplarRoutes })) fail(issue);

  if (!Object.isFrozen(visualGrammar)) fail("productVisualGrammar must be immutable");
  if (JSON.stringify(Object.keys(visualGrammar ?? {})) !== JSON.stringify(requiredVisualGrammar.map(([name]) => name))) {
    fail(`productVisualGrammar must expose only ${requiredVisualGrammar.map(([name]) => name).join(", ")}`);
  }
  for (const [name, classNameValue] of requiredVisualGrammar) {
    const hook = visualGrammar?.[name];
    if (!hook || hook.className !== classNameValue || !hook.principle?.trim()) fail(`productVisualGrammar.${name} must define ${classNameValue}`);
    if (!Object.isFrozen(hook)) fail(`productVisualGrammar.${name} must be immutable`);
    if (css && !css.includes(`.${classNameValue}`)) fail(`${classNameValue} must exist in package CSS`);
  }

  if (!Object.isFrozen(contracts)) fail("productPatternContracts must be immutable");
  for (const contract of contracts) {
    if (!Object.isFrozen(contract)) fail(`${contract.name} contract must be immutable`);
    for (const field of requiredContractArrays) {
      if (!Object.isFrozen(contract[field])) fail(`${contract.name}.${field} must be immutable`);
    }
    for (const state of contract.states) {
      if (!Object.isFrozen(state) || !Object.isFrozen(state.requiredVisibleSignals)) {
        fail(`${contract.name}.${state.name}.requiredVisibleSignals must be deeply immutable`);
      }
    }
  }
  if (!Object.isFrozen(groups) || groups.some((group) => !Object.isFrozen(group) || !Object.isFrozen(group.patterns))) {
    fail("productPatternGroups and their pattern collections must be immutable");
  }

  if (JSON.stringify(Object.keys(aliases)) !== JSON.stringify(["ProductFamilyRouter"])) {
    fail("patternAliases must contain only the approved ProductFamilyRouter compatibility alias");
  }
  const routeMap = contracts.find((contract) => contract.name === "ProductRouteMap");
  if (aliases.ProductFamilyRouter !== routeMap) {
    fail("ProductFamilyRouter alias must point to the canonical ProductRouteMap contract by identity");
  }
  if (JSON.stringify(retainedLegacyPatternNames) !== JSON.stringify(["ProductFamilyRouter", "ServiceSection"])) {
    fail("retainedLegacyPatternNames must preserve ProductFamilyRouter and ServiceSection in order");
  }

  for (const contract of contracts) {
    const variant = contract.variants[0]?.name;
    const state = contract.states[0]?.name;
    const expectedClasses = [
      contract.css.baseClass,
      `${contract.css.variantClassPrefix}${kebabCase(variant)}`,
      `${contract.css.stateClassPrefix}${kebabCase(state)}`,
    ].join(" ");
    try {
      if (className(contract.name, { variant, state }) !== expectedClasses) {
        fail(`${contract.name} class helper must emit base, finite variant, and finite state classes in order`);
      }
    } catch (error) {
      fail(`${contract.name} class helper failed: ${String(error)}`);
    }
  }

  for (const inheritedKey of ["toString", "constructor", "__proto__", "prototype", "hasOwnProperty"]) {
    expectRejected(() => className(inheritedKey), inheritedKey, fail);
    if (resolve(inheritedKey) !== undefined) fail(`resolveProductPatternContract must reject inherited key ${inheritedKey}`);
  }
  expectRejected(() => className("PublicHero", { variant: "__proto__" }), "inherited variant", fail);
  expectRejected(() => className("EvidencePanel", { state: "constructor" }), "inherited state", fail);
}

export function runProductPatternContractFixtures({ contracts, css = null }) {
  const cases = [
    { name: "valid inventory", mutate: () => {}, expected: null },
    { name: "duplicate name", mutate: (items) => { items[1].name = items[0].name; }, expected: "exact canonical order" },
    { name: "missing anatomy", mutate: (items) => { items[0].anatomy = []; }, expected: "anatomy must be a non-empty array" },
    { name: "missing required anatomy field", mutate: (items) => { items[0].anatomy = items[0].anatomy.filter((item) => item.name !== "boundaryStatement"); }, expected: "required anatomy boundaryStatement" },
    { name: "missing required state", mutate: (items) => { items[0].states = items[0].states.filter((state) => state.name !== "with-proof-artifact"); }, expected: "required state with-proof-artifact" },
    { name: "missing state signals", mutate: (items) => { items[0].states[0].requiredVisibleSignals = []; }, expected: "requiredVisibleSignals" },
    { name: "missing trust boundary", mutate: (items) => { items[0].trustBoundaries = []; }, expected: "trustBoundaries must be a non-empty array" },
    { name: "invalid CSS class", mutate: (items) => { items[0].css.baseClass = "card"; }, expected: "baseClass must be" },
    { name: "invalid route", mutate: (items) => { items[0].exemplarRoutes = ["https://example.com"]; }, expected: "must be a local static route" },
    { name: "unknown maturity", mutate: (items) => { items[0].maturity = "finished"; }, expected: "unknown maturity" },
    { name: "missing accessibility hook", mutate: (items) => { items[0].accessibilityHooks.keyboard = ""; }, expected: "accessibilityHooks.keyboard" },
    { name: "missing user job", mutate: (items) => { items[0].userJob = ""; }, expected: "userJob must be specific" },
    { name: "missing semantic root", mutate: (items) => { items[0].semanticRoot = ""; }, expected: "semanticRoot must be specific" },
    { name: "missing required fields", mutate: (items) => { items[0].requiredFields = []; }, expected: "requiredFields must be a non-empty array" },
    { name: "unknown required field", mutate: (items) => { items[0].requiredFields = ["inventedField"]; }, expected: "required field inventedField" },
    { name: "PricingBlock missing required action", mutate: (items) => { const contract = items.find((item) => item.name === "PricingBlock"); contract.requiredFields = contract.requiredFields.filter((field) => field !== "action"); }, expected: "PricingBlock requiredFields must include action" },
    { name: "PermissionExplainer missing request action", mutate: (items) => { const contract = items.find((item) => item.name === "PermissionExplainer"); contract.requiredFields = contract.requiredFields.filter((field) => field !== "requestAction"); }, expected: "PermissionExplainer requiredFields must include requestAction" },
    { name: "HumanReviewCheckpoint missing evidence link", mutate: (items) => { const contract = items.find((item) => item.name === "HumanReviewCheckpoint"); contract.requiredFields = contract.requiredFields.filter((field) => field !== "evidenceLink"); }, expected: "HumanReviewCheckpoint requiredFields must include evidenceLink" },
    { name: "AuditTrailPreview missing inspect action", mutate: (items) => { const contract = items.find((item) => item.name === "AuditTrailPreview"); contract.requiredFields = contract.requiredFields.filter((field) => field !== "inspectAction"); }, expected: "AuditTrailPreview requiredFields must include inspectAction" },
    { name: "WorkQueueRow missing priority", mutate: (items) => { const contract = items.find((item) => item.name === "WorkQueueRow"); contract.requiredFields = contract.requiredFields.filter((field) => field !== "priority"); }, expected: "WorkQueueRow requiredFields must include priority" },
    { name: "CustodyBoundary missing network destination", mutate: (items) => { const contract = items.find((item) => item.name === "CustodyBoundary"); contract.requiredFields = contract.requiredFields.filter((field) => field !== "networkDestination"); }, expected: "CustodyBoundary requiredFields must include networkDestination" },
    { name: "ToolCard hidden state missing CSS suppression", mutate: () => {}, mutateCss: (value) => value?.replace(/\.sk-pattern-tool-card\[hidden\],[\s\S]*?display:\s*none;\s*}/, ""), expected: "ToolCard hidden state must suppress author display" },
    { name: "missing copy obligation", mutate: (items) => { items[0].copyObligations = []; }, expected: "copyObligations must be a non-empty array" },
    { name: "missing reduced motion", mutate: (items) => { items[0].reducedMotionBehavior = []; }, expected: "reducedMotionBehavior must be a non-empty array" },
    { name: "missing forced colors", mutate: (items) => { items[0].forcedColorsBehavior = []; }, expected: "forcedColorsBehavior must be a non-empty array" },
    { name: "missing synthetic requirement", mutate: (items) => { items[0].syntheticRequirement = ""; }, expected: "syntheticRequirement must be specific" },
    { name: "missing consumer responsibility", mutate: (items) => { items[0].consumerResponsibilities = []; }, expected: "consumerResponsibilities must be a non-empty array" },
  ];
  const failures = [];

  for (const fixture of cases) {
    const candidate = structuredClone(contracts);
    fixture.mutate(candidate);
    const candidateCss = fixture.mutateCss ? fixture.mutateCss(css) : css;
    const issues = collectProductPatternIssues({ contracts: candidate, groups: null, css: candidateCss, exemplarRoutes: null });
    const passed = fixture.expected ? issues.some((issue) => issue.includes(fixture.expected)) : issues.length === 0;
    if (!passed) failures.push(`${fixture.name}: expected ${fixture.expected ?? "success"}; found ${issues.join("; ") || "success"}`);
  }
  return { count: cases.length, failures };
}

function collectProductPatternIssues({ contracts, groups, css, exemplarRoutes }) {
  const issues = [];
  if (!Array.isArray(contracts)) return ["productPatternContracts must be an array"];
  if (JSON.stringify(contracts.map((contract) => contract.name)) !== JSON.stringify(expectedProductPatternNames)) {
    issues.push(`productPatternContracts must preserve the exact canonical order: ${expectedProductPatternNames.join(", ")}`);
  }
  if (new Set(contracts.map((contract) => contract.name)).size !== contracts.length) issues.push("product pattern names must be unique");

  if (groups !== null) {
    if (JSON.stringify(groups.map((group) => group.name)) !== JSON.stringify(expectedProductPatternGroups.map(([name]) => name))) {
      issues.push("productPatternGroups must preserve the exact four-group order");
    }
    for (const [index, [, expectedNames]] of expectedProductPatternGroups.entries()) {
      const group = groups[index];
      if (!group || JSON.stringify(group.patterns.map((contract) => contract.name)) !== JSON.stringify(expectedNames)) {
        issues.push(`product pattern group ${index} must preserve ${expectedNames.join(", ")}`);
      }
    }
  }

  for (const contract of contracts) {
    if (!expectedProductPatternGroups.some(([group]) => group === contract.group)) issues.push(`${contract.name} uses unknown group ${contract.group}`);
    if (!contract.purpose?.trim()) issues.push(`${contract.name}.purpose must be specific`);
    if (!contract.primaryProductMode?.trim() || contract.intendedProducts?.[0] !== contract.primaryProductMode) issues.push(`${contract.name}.primaryProductMode must be the first intended product`);
    for (const field of ["userJob", "semanticRoot", "syntheticRequirement"]) {
      if (!contract[field]?.trim()) issues.push(`${contract.name}.${field} must be specific`);
    }
    if (!['candidate', 'adoption-ready'].includes(contract.maturity)) issues.push(`${contract.name} uses unknown maturity ${contract.maturity}`);
    if (!['synthetic-reference', 'browser-verified', 'consumer-verified'].includes(contract.evidenceStatus)) issues.push(`${contract.name} uses unknown evidenceStatus ${contract.evidenceStatus}`);
    for (const field of requiredContractArrays) {
      if (!Array.isArray(contract[field]) || contract[field].length === 0) issues.push(`${contract.name}.${field} must be a non-empty array`);
    }
    const anatomyNames = new Set((contract.anatomy ?? []).map((part) => part.name));
    for (const requiredField of contract.requiredFields ?? []) {
      if (!anatomyNames.has(requiredField)) issues.push(`${contract.name} required field ${requiredField} must reference declared anatomy`);
    }
    for (const requiredAnatomy of requiredAnatomyByPattern.get(contract.name) ?? []) {
      if (!anatomyNames.has(requiredAnatomy)) issues.push(`${contract.name} must include required anatomy ${requiredAnatomy}`);
    }
    const requiredFieldNames = new Set(contract.requiredFields ?? []);
    for (const requiredField of requiredFieldsByPattern.get(contract.name) ?? []) {
      if (!requiredFieldNames.has(requiredField)) issues.push(`${contract.name} requiredFields must include ${requiredField}`);
    }
    const stateNames = new Set((contract.states ?? []).map((state) => state.name));
    for (const requiredState of requiredStatesByPattern.get(contract.name) ?? []) {
      if (!stateNames.has(requiredState)) issues.push(`${contract.name} must include required state ${requiredState}`);
    }
    for (const state of contract.states ?? []) {
      if (!state.name?.trim() || !state.purpose?.trim()) issues.push(`${contract.name} states must include name and purpose`);
      if (!Array.isArray(state.requiredVisibleSignals) || state.requiredVisibleSignals.length === 0) issues.push(`${contract.name}.${state.name}.requiredVisibleSignals must be non-empty`);
    }
    for (const hook of requiredAccessibilityHooks) {
      if (!contract.accessibilityHooks?.[hook]?.trim()) issues.push(`${contract.name}.accessibilityHooks.${hook} must be specific`);
    }
    const slug = kebabCase(contract.name);
    if (contract.css?.entrypoint !== "@sanchika/patterns/styles.css") issues.push(`${contract.name}.css.entrypoint must use the public stylesheet`);
    if (contract.css?.baseClass !== `sk-pattern-${slug}`) issues.push(`${contract.name}.css.baseClass must be sk-pattern-${slug}`);
    if (contract.css?.variantClassPrefix !== `sk-pattern-${slug}--`) issues.push(`${contract.name}.css.variantClassPrefix must match the base class`);
    if (contract.css?.stateClassPrefix !== `sk-pattern-${slug}--state-`) issues.push(`${contract.name}.css.stateClassPrefix must match the base class`);
    for (const route of contract.exemplarRoutes ?? []) {
      if (!/^\/[a-z0-9-/]+\/$/.test(route)) issues.push(`${contract.name} exemplar route ${route} must be a local static route`);
      if (exemplarRoutes && !exemplarRoutes.has(route)) issues.push(`${contract.name} exemplar route ${route} has no gallery source`);
    }
    if (css && !css.includes(`.${contract.css?.baseClass}`)) issues.push(`${contract.name} base class must exist in package CSS`);
  }

  if (css) {
    if (!/\[data-tool-card\]\[hidden\]\s*\{[^}]*display:\s*none\s*;/i.test(css)) {
      issues.push("ToolCard hidden state must suppress author display");
    }
    if (/--lab-|\.lab-/.test(css)) issues.push("pattern CSS must not retain lab variables or selectors");
    if (/^\s*(?:html|body|main|#gallery|\.sk-gallery|\.pattern-reference|\[data-sanchika)[^{]*\{/gm.test(css)) {
      issues.push("pattern CSS must not own page, route, gallery, or reference-shell selectors");
    }
    if (/(^|[;{]\s*)--sk-[\w-]+\s*:/m.test(css)) issues.push("pattern CSS must not author new --sk-* variables");
    if (/#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|lab|lch)\(/i.test(css)) issues.push("pattern CSS must not contain raw color values");
    for (const property of ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "border-radius", "box-shadow", "animation-duration"]) {
      const raw = new RegExp(`${property}\\s*:(?!\\s*(?:var\\(|inherit|initial|unset|normal|none))[^;]+;`, "i");
      if (raw.test(css)) issues.push(`pattern CSS ${property} values must use existing tokens`);
    }
    for (const match of css.matchAll(/transition\s*:\s*([^;]+);/gi)) {
      if (!match[1].includes("var(--sk-motion-")) issues.push("pattern CSS transition values must use existing motion tokens");
    }
  }
  return issues;
}

function expectRejected(operation, label, fail) {
  try {
    operation();
    fail(`product pattern class helper must reject ${label}`);
  } catch (error) {
    if (!/Unknown/.test(String(error))) fail(`product pattern class helper rejected ${label} with unexpected error: ${String(error)}`);
  }
}

function kebabCase(value) {
  return String(value)
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function validateA11yChecks({ pattern, state, topLevelSlots, fail }) {
  if (state.a11yChecks.length === 0) {
    fail(`${pattern.name}.${state.name} must declare at least one structured a11y check`);
  }

  const stateSlots = state.requiredSlots.length > 0 ? new Set(state.requiredSlots) : topLevelSlots;
  const checkIds = new Set();
  for (const check of state.a11yChecks) {
    if (!check.id) fail(`${pattern.name}.${state.name} a11y check must include id`);
    if (checkIds.has(check.id)) {
      fail(`${pattern.name}.${state.name} must not repeat a11y check id ${check.id}`);
    }
    checkIds.add(check.id);

    const expectedSourceUrl = a11ySourceByCriterion.get(check.criterion);
    if (!expectedSourceUrl) {
      fail(`${pattern.name}.${state.name}.${check.id} uses unknown criterion ${check.criterion}`);
    }
    if (expectedSourceUrl && check.sourceUrl !== expectedSourceUrl) {
      fail(`${pattern.name}.${state.name}.${check.id} must pair ${check.criterion} with ${expectedSourceUrl}`);
    }
    if (!check.requirement) fail(`${pattern.name}.${state.name}.${check.id} must include requirement`);
    if (!check.manualTest) fail(`${pattern.name}.${state.name}.${check.id} must include manualTest`);
    for (const slotName of check.slotRefs) {
      if (!stateSlots.has(slotName)) {
        fail(`${pattern.name}.${state.name}.${check.id} references unknown slot ${slotName}`);
      }
    }
  }
}

function validateProgrammaticStatus({ pattern, state, topLevelSlots, fail }) {
  if (!state.programmaticStatus) {
    return;
  }

  const expectedAriaLive = ariaLiveByRole.get(state.programmaticStatus.role);
  if (!expectedAriaLive) {
    fail(`${pattern.name}.${state.name} programmaticStatus role must be status or alert`);
  }
  if (expectedAriaLive && state.programmaticStatus.ariaLive !== expectedAriaLive) {
    fail(`${pattern.name}.${state.name} programmaticStatus must pair ${state.programmaticStatus.role} with aria-live ${expectedAriaLive}`);
  }
  if (state.programmaticStatus.ariaAtomic !== true) {
    fail(`${pattern.name}.${state.name} programmaticStatus must set ariaAtomic true`);
  }
  if (!state.programmaticStatus.requirement) {
    fail(`${pattern.name}.${state.name} programmaticStatus must include requirement`);
  }
  if (!state.a11yChecks.some((check) => check.criterion === "WCAG22:4.1.3")) {
    fail(`${pattern.name}.${state.name} programmaticStatus must include a WCAG22:4.1.3 status-message a11y check`);
  }
  const stateSlots = state.requiredSlots.length > 0 ? new Set(state.requiredSlots) : topLevelSlots;
  for (const slotName of state.programmaticStatus.slotRefs) {
    if (!stateSlots.has(slotName)) {
      fail(`${pattern.name}.${state.name} programmaticStatus references unknown slot ${slotName}`);
    }
  }
}

function extractPatternSpecs(patternSource, fail) {
  const sourceFile = ts.createSourceFile("packages/patterns/src/index.ts", patternSource, ts.ScriptTarget.Latest, true);
  const declaration = findPatternSpecsDeclaration(sourceFile);
  const initializer = declaration ? unwrapExpression(declaration.initializer) : null;

  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    fail("patternSpecs must be a static array literal for contract validation");
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const object = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(object)) {
      fail("patternSpecs entries must be static object literals");
      return [];
    }

    return [extractPatternSpec(object, fail)];
  });
}

function findPatternSpecsDeclaration(sourceFile) {
  let found = null;
  sourceFile.forEachChild(function visit(node) {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "patternSpecs") {
      found = node;
      return;
    }
    node.forEachChild(visit);
  });
  return found;
}

function extractPatternSpec(object, fail) {
  return {
    name: readStringProperty(object, "name", fail),
    requiredSlots: readObjectArrayProperty(object, "requiredSlots", fail).map((slot) => ({
      name: readStringProperty(slot, "name", fail),
    })),
    requiredStates: readObjectArrayProperty(object, "requiredStates", fail).map((state) => ({
      name: readStringProperty(state, "name", fail),
      requiredVisibleSignals: readStringArrayProperty(state, "requiredVisibleSignals", fail),
      requiredSlots: readStringArrayProperty(state, "requiredSlots", fail, true),
      a11yChecks: readA11yChecks(state, fail),
      programmaticStatus: readProgrammaticStatus(state, fail),
    })),
  };
}

function readA11yChecks(object, fail) {
  const checks = readObjectArrayProperty(object, "a11yChecks", fail);
  return checks.map((check) => ({
    id: readStringProperty(check, "id", fail),
    criterion: readStringProperty(check, "criterion", fail),
    sourceUrl: readStringProperty(check, "sourceUrl", fail),
    requirement: readStringProperty(check, "requirement", fail),
    manualTest: readStringProperty(check, "manualTest", fail),
    slotRefs: readStringArrayProperty(check, "slotRefs", fail, true),
  }));
}

function readProgrammaticStatus(object, fail) {
  const initializer = unwrapExpression(readPropertyInitializer(object, "programmaticStatus"));
  if (!initializer) return null;
  if (!ts.isObjectLiteralExpression(initializer)) {
    fail("patternSpecs programmaticStatus must be a static object");
    return null;
  }

  return {
    role: readStringProperty(initializer, "role", fail),
    ariaLive: readStringProperty(initializer, "ariaLive", fail),
    ariaAtomic: readBooleanProperty(initializer, "ariaAtomic", fail),
    requirement: readStringProperty(initializer, "requirement", fail),
    slotRefs: readStringArrayProperty(initializer, "slotRefs", fail, true),
  };
}

function readObjectArrayProperty(object, propertyName, fail) {
  const initializer = unwrapExpression(readPropertyInitializer(object, propertyName));
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    fail(`patternSpecs ${propertyName} must be a static array`);
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const unwrapped = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(unwrapped)) {
      fail(`patternSpecs ${propertyName} entries must be static objects`);
      return [];
    }
    return [unwrapped];
  });
}

function readStringArrayProperty(object, propertyName, fail, optional = false) {
  const initializer = unwrapExpression(readPropertyInitializer(object, propertyName));
  if (!initializer) return optional ? [] : failAndReturnEmpty(fail, `patternSpecs ${propertyName} must exist`);
  if (!ts.isArrayLiteralExpression(initializer)) {
    fail(`patternSpecs ${propertyName} must be a static string array`);
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const value = readStringLiteral(unwrapExpression(element));
    if (value === null) {
      fail(`patternSpecs ${propertyName} entries must be static strings`);
      return [];
    }
    return [value];
  });
}

function readStringProperty(object, propertyName, fail) {
  const value = readStringLiteral(unwrapExpression(readPropertyInitializer(object, propertyName)));
  if (value === null) {
    fail(`patternSpecs ${propertyName} must be a static string`);
    return "";
  }
  return value;
}

function readBooleanProperty(object, propertyName, fail) {
  const initializer = unwrapExpression(readPropertyInitializer(object, propertyName));
  if (!initializer || initializer.kind !== ts.SyntaxKind.TrueKeyword) {
    fail(`patternSpecs ${propertyName} must be true`);
    return false;
  }
  return true;
}

function readPropertyInitializer(object, propertyName) {
  const property = object.properties.find(
    (entry) =>
      ts.isPropertyAssignment(entry) &&
      ((ts.isIdentifier(entry.name) && entry.name.text === propertyName) ||
        (ts.isStringLiteral(entry.name) && entry.name.text === propertyName)),
  );
  return property?.initializer ?? null;
}

function unwrapExpression(expression) {
  let current = expression;
  while (current && (ts.isAsExpression(current) || ts.isSatisfiesExpression(current))) {
    current = current.expression;
  }
  return current;
}

function readStringLiteral(expression) {
  return expression && (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))
    ? expression.text
    : null;
}

function failAndReturnEmpty(fail, message) {
  fail(message);
  return [];
}

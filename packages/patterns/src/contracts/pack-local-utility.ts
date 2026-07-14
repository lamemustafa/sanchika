import { defineProductPattern } from "../product-pattern-definition.ts";

const localUtilityRules = {
  primaryProductMode: "pack/local-utility" as const,
  copyObligations: ["Name custodian, location, data or action, crossing, never-crosses facts, network destination, local result, and source proof."],
  prohibitedClaims: ["government affiliation", "credential custody by ComplyEaze", "unobserved no-telemetry guarantee", "automatic filing or approval"],
  reducedMotionBehavior: ["Preserve custody order, permission scope, denial behavior, and local destination without animated connectors."],
  forcedColorsBehavior: ["Retain numbered order, text labels, link underlines, focus, and custody boundaries with system colors."],
  syntheticRequirement: "Reference filenames, portal records, dates, destinations, and receipts must be visibly synthetic.",
  consumerResponsibilities: ["Prove portal behavior, permissions, network requests, downloads, telemetry, release evidence, and every custody statement."],
} as const;

function accessibilityHooks(semantics: string, focusOrder: string) {
  return {
    semantics,
    keyboard: "Use native links and permission controls; every inspect, deny, fallback, and destination action remains keyboard reachable.",
    announcements: "Announce permission, running, blocked, or completion changes without moving focus or implying portal approval.",
    focusOrder,
  } as const;
}

const trust = [
  "Credentials and portal session remain with the government portal and the user's browser.",
  "Name any network request, permission, artifact destination, and telemetry behavior before the action.",
] as const;

const guidance = [
  "Describe observed custody and permission behavior, not aspirational privacy claims.",
  "Keep local output, source, and release inspection paths visible in the same flow.",
] as const;

export const packLocalUtilityPatterns = Object.freeze([
  defineProductPattern({
    name: "LocalArtifactFlow",
    group: "pack-local-utility",
    purpose: "Trace a supported artifact from portal session through local browser action to a user-controlled destination.",
    ...localUtilityRules,
    userJob: "Confirm custody at each stage before allowing a portal response to become a local artifact.",
    semanticRoot: "A labelled section containing an ordered custody-stage list, receipt, and source or release proof.",
    intendedProducts: ["pack/local-utility"],
    anatomy: [
      { name: "sourceStage", purpose: "Authenticated source session and credential boundary." },
      { name: "localActionStage", purpose: "Browser action and network behavior." },
      { name: "destinationStage", purpose: "User-controlled output location." },
      { name: "stepCustody", purpose: "Custodian or location, data involved, action, and crossing facts for every stage." },
      { name: "sourceEvidence", purpose: "Inspectable evidence supporting each custody claim." },
      { name: "resultingArtifact", purpose: "Result produced by each stage and the final local artifact." },
      { name: "custodyFacts", purpose: "Credentials, cookies, file, telemetry, and source facts." },
      { name: "artifactReceipt", purpose: "Filename, destination, source, and release inspection links." },
    ],
    requiredFields: ["sourceStage", "localActionStage", "destinationStage", "stepCustody", "sourceEvidence", "resultingArtifact"],
    variants: [
      { name: "three-stage", purpose: "Source, local action, and destination trace." },
      { name: "compact", purpose: "Narrow-screen sequential trace." },
    ],
    accessibilityHooks: accessibilityHooks("Use an ordered list of stages; each stage includes a heading and labelled custody facts.", "Read every stage in source-to-destination order, then the receipt and source or release proof."),
    states: [
      { name: "ready", purpose: "The supported local flow can start.", requiredVisibleSignals: ["source", "local action", "destination"] },
      { name: "running", purpose: "A local browser action is active.", requiredVisibleSignals: ["in progress", "network boundary", "cancel or wait"] },
      { name: "complete", purpose: "A local artifact is available.", requiredVisibleSignals: ["saved locally", "filename", "destination"] },
      { name: "blocked", purpose: "The local flow cannot continue safely.", requiredVisibleSignals: ["blocked", "reason", "manual path"] },
    ],
    trustBoundaries: trust,
    responsiveBehavior: ["Stack numbered stages without changing custody order.", "Keep the artifact receipt and proof links untruncated."],
    exemplarRoutes: ["/patterns/pack/", "/lab/pack-local-proof/"],
    adopterGuidance: guidance,
    nonGoals: ["download implementation", "portal automation", "credential capture", "telemetry promise beyond observed scope"],
  }),
  defineProductPattern({
    name: "PermissionExplainer",
    group: "pack-local-utility",
    purpose: "Explain a browser, file, download, or site permission before requesting it.",
    ...localUtilityRules,
    userJob: "Understand a permission's purpose, scope, affected data, denial behavior, and fallback before deciding.",
    semanticRoot: "A labelled aside containing permission facts followed by one native request or review control.",
    intendedProducts: ["pack/local-utility", "tools/local-artifact"],
    anatomy: [
      { name: "permission", purpose: "Specific capability being requested." },
      { name: "purpose", purpose: "Why the workflow needs it." },
      { name: "scope", purpose: "Where and for how long it applies." },
      { name: "dataTouched", purpose: "Data or browser capability the permission can access." },
      { name: "dataNotTouched", purpose: "Data or locations outside the permission scope." },
      { name: "denialBehavior", purpose: "What happens when permission is denied." },
      { name: "sourcePolicy", purpose: "Inspectable source or policy link." },
      { name: "fallback", purpose: "Manual or reduced-capability path." },
      { name: "requestAction", purpose: "Permission request control." },
    ],
    requiredFields: ["permission", "purpose", "scope", "dataTouched", "dataNotTouched", "denialBehavior", "sourcePolicy"],
    variants: [
      { name: "inline", purpose: "Explanation adjacent to the request action." },
      { name: "panel", purpose: "Detailed pre-permission review." },
    ],
    accessibilityHooks: accessibilityHooks("Use a labelled aside; associate permission purpose and scope with the native request control.", "Read permission, purpose, scope, touched and untouched data, denial behavior, source policy, fallback, then the request action."),
    states: [
      { name: "required", purpose: "Permission is needed.", requiredVisibleSignals: ["permission required", "purpose", "fallback"] },
      { name: "optional", purpose: "The workflow can continue without the permission.", requiredVisibleSignals: ["optional", "reduced capability", "continue action"] },
      { name: "granted", purpose: "Permission is available.", requiredVisibleSignals: ["granted", "scope", "revoke path"] },
      { name: "denied", purpose: "Permission is unavailable.", requiredVisibleSignals: ["denied", "effect", "manual path"] },
      { name: "unavailable", purpose: "The browser cannot offer the permission.", requiredVisibleSignals: ["unavailable", "reason", "manual path"] },
      { name: "not-requested", purpose: "No permission request has occurred.", requiredVisibleSignals: ["not requested", "purpose", "review action"] },
    ],
    trustBoundaries: trust,
    responsiveBehavior: ["Keep permission, purpose, and fallback before the request control.", "Do not hide scope inside hover-only help."],
    exemplarRoutes: ["/patterns/pack/", "/lab/pack-local-proof/"],
    adopterGuidance: guidance,
    nonGoals: ["browser permission API", "consent receipt", "security guarantee"],
  }),
  defineProductPattern({
    name: "CustodyBoundary",
    group: "pack-local-utility",
    purpose: "Summarize who controls credentials, session, artifact, network destination, telemetry, and release proof.",
    ...localUtilityRules,
    userJob: "Verify who controls each sensitive element, what crosses, what never crosses, and how the user retains control.",
    semanticRoot: "A labelled description list or aside containing custody, crossing, user-control, and proof facts.",
    intendedProducts: ["pack/local-utility"],
    anatomy: [
      { name: "boundaryClaim", purpose: "One-sentence custody statement." },
      { name: "boundaryOwner", purpose: "Person or system controlling the boundary." },
      { name: "insideBoundary", purpose: "Data, session, and artifact kept inside." },
      { name: "outsideBoundary", purpose: "Named destinations or processors outside." },
      { name: "crossingEvent", purpose: "The user-controlled event that crosses the boundary." },
      { name: "neverCrosses", purpose: "Credentials, session, files, or telemetry that never cross." },
      { name: "userControl", purpose: "How the user starts, denies, or stops the crossing." },
      { name: "custodyFacts", purpose: "Named actor and location for each sensitive element." },
      { name: "networkDestination", purpose: "Observed destination or no-network statement." },
      { name: "sourceProof", purpose: "Public source and release inspection paths." },
    ],
    requiredFields: ["boundaryOwner", "insideBoundary", "outsideBoundary", "crossingEvent", "neverCrosses", "userControl", "sourceProof"],
    variants: [
      { name: "ledger", purpose: "Dense custody fact strip." },
      { name: "banner", purpose: "Short pre-action custody summary." },
    ],
    accessibilityHooks: accessibilityHooks("Use a description list or labelled aside; every custody and transfer fact has a text label.", "Read owner, inside and outside boundaries, crossing and never-crosses facts, user control, then source proof."),
    states: [
      { name: "local-only", purpose: "Artifact and workflow data remain user-controlled locally.", requiredVisibleSignals: ["local only", "destination", "no handoff"] },
      { name: "workspace-scoped", purpose: "A named workspace boundary owns the data.", requiredVisibleSignals: ["workspace scoped", "account", "processor"] },
      { name: "public-metadata-only", purpose: "Only named public metadata crosses.", requiredVisibleSignals: ["public metadata", "source", "no private artifact"] },
      { name: "transfer-pending", purpose: "A user-controlled transfer has not occurred yet.", requiredVisibleSignals: ["transfer pending", "destination", "cancel action"] },
      { name: "no-transfer", purpose: "No transfer occurs in the documented flow.", requiredVisibleSignals: ["no transfer", "inside boundary", "evidence"] },
    ],
    trustBoundaries: trust,
    responsiveBehavior: ["Wrap facts into labelled rows, not unlabeled icons.", "Place unknown or handoff status before the consequential action."],
    exemplarRoutes: ["/patterns/pack/", "/lab/pack-local-proof/"],
    adopterGuidance: guidance,
    nonGoals: ["privacy policy", "formal data-flow audit", "certification claim"],
  }),
] as const);

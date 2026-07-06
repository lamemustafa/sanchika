import type {
  PatternA11yCheckFor,
  PatternA11yCriterion,
  PatternName,
  PatternProgrammaticStatusFor,
  PatternSlotName,
  PatternSlotNameFor,
  PatternStateName,
  PatternStateNameFor,
  PatternStateRequiredSlotNameFor,
  DesignBrief,
  DesignBriefValidationIssue,
  TrustBrief,
  TrustBriefValidationIssue,
} from "../src/index";
import { validateDesignBrief, validateTrustBrief } from "../src/index";

const patternName: PatternName = "EvidencePanel";
const anyPatternSlot: PatternSlotName = "boundarySummary";
const anyPatternState: PatternStateName = "upload-required";
const evidenceSlot: PatternSlotNameFor<"EvidencePanel"> = "sourceList";
const trustSlot: PatternSlotNameFor<"TrustBoundary"> = "permissionList";
const serviceState: PatternStateNameFor<"ServiceSection"> = "selected";
const emptyEvidenceSlot: PatternStateRequiredSlotNameFor<"EvidencePanel", "empty"> = "actionSlot";
const targetSizeCriterion: PatternA11yCriterion = "WCAG22:2.5.8";
const blockedCheck: PatternA11yCheckFor<"EvidencePanel", "blocked"> = {
  id: "blocked-reason-action-association",
  criterion: "WCAG22:3.3.2",
  sourceUrl: "https://www.w3.org/TR/WCAG22/#labels-or-instructions",
  requirement: "Blocked reason must be associated with the next safe action.",
  slotRefs: ["uncertaintyCopy", "actionSlot"],
  manualTest: "Confirm the blocking reason is read before or with the action needed to resolve it.",
};
const blockedStatus: PatternProgrammaticStatusFor<"EvidencePanel", "blocked"> = {
  role: "alert",
  ariaLive: "assertive",
  ariaAtomic: true,
  slotRefs: ["uncertaintyCopy", "actionSlot"],
  requirement: "Blocked evidence updates must announce the blocking reason and next safe action.",
};
const axalTrustBrief: TrustBrief = {
  id: "axal-review-workbench",
  consumerMode: "axal/workspace",
  register: "product",
  surface: "Professional Review Workbench",
  userJob: "Review pending compliance evidence before approving a prepared action.",
  primaryDecision: "Can this action be approved, or is source evidence still missing?",
  dataSensitivity: ["tenant-data", "document-or-file", "statutory-claim"],
  trustBoundaries: ["Tenant-scoped workspace data only", "No portal credential handoff in Sanchika"],
  evidenceRequirements: ["Source evidence", "Human review state", "Review timestamp"],
  selectedPatterns: [{ name: "EvidencePanel", states: ["reviewed", "blocked"] }],
  claims: [{ claim: "Evidence is ready for review", evidence: "Synthetic source list and review timestamp are visible" }],
  nonGoals: ["No filing submission", "No compliance judgment"],
  verificationGates: ["token-only-styling", "wcag-22-aa", "keyboard-focus", "non-color-state", "desktop-render", "mobile-render"],
};
const trustBriefIssues: readonly TrustBriefValidationIssue[] = validateTrustBrief(axalTrustBrief);
const axalDesignBrief: DesignBrief = {
  id: "axal-review-workbench-design",
  trustBrief: axalTrustBrief,
  register: "product",
  surface: "Professional Review Workbench",
  firstViewportSignal: "Professional Review Workbench with source, owner, review state, and safe next action visible",
  emotionalIntent: "Control under compliance pressure, not decorative delight.",
  narrativeArc: ["Show what needs review", "Expose evidence and uncertainty", "Make approval or block action safe"],
  informationPriority: ["Review state", "Source evidence", "Owner and due context", "Safe next action"],
  responsiveConstraints: ["Mobile must keep review state before actions", "Desktop must support dense scanning without overflow"],
  interactionStates: ["loading", "empty", "error", "disabled", "focus", "hover", "selected", "blocked"],
  visualQualityGates: ["not-generic-saas", "first-viewport-product-signal", "source-visible", "human-review-visible", "responsive-fit", "keyboardable", "reduced-motion"],
  verificationEvidence: ["Desktop render screenshot", "Mobile render screenshot", "Keyboard focus walkthrough"],
  nonGoals: ["No filing submission", "No compliance judgment"],
};
const designBriefIssues: readonly DesignBriefValidationIssue[] = validateDesignBrief(axalDesignBrief);

void patternName;
void anyPatternSlot;
void anyPatternState;
void evidenceSlot;
void trustSlot;
void serviceState;
void emptyEvidenceSlot;
void targetSizeCriterion;
void blockedCheck;
void blockedStatus;
void axalTrustBrief;
void trustBriefIssues;
void axalDesignBrief;
void designBriefIssues;

// @ts-expect-error Unknown patterns must not be accepted.
const unknownPattern: PatternName = "GenericCard";

// @ts-expect-error TrustBoundary does not expose EvidencePanel slots.
const wrongSlot: PatternSlotNameFor<"TrustBoundary"> = "sourceList";

// @ts-expect-error ServiceSection does not expose TrustBoundary states.
const wrongState: PatternStateNameFor<"ServiceSection"> = "local-only";

// @ts-expect-error EvidencePanel.empty only requires actionSlot.
const wrongStateSlot: PatternStateRequiredSlotNameFor<"EvidencePanel", "empty"> = "sourceList";

// @ts-expect-error Unknown WCAG criteria must not be accepted.
const unknownCriterion: PatternA11yCriterion = "WCAG22:9.9.9";

// @ts-expect-error EvidencePanel.empty has no programmatic status contract.
const wrongEmptyStatus: PatternProgrammaticStatusFor<"EvidencePanel", "empty"> = {
  role: "status",
  ariaLive: "polite",
  ariaAtomic: true,
  requirement: "Should not exist",
};

// @ts-expect-error Unknown consumer modes must not be accepted.
const wrongBriefMode: TrustBrief = { ...axalTrustBrief, consumerMode: "generic/app" };

const wrongBriefPatternState: TrustBrief = {
  ...axalTrustBrief,
  // @ts-expect-error TrustBoundary cannot declare EvidencePanel states.
  selectedPatterns: [{ name: "TrustBoundary", states: ["reviewed"] }],
};

const wrongDesignBriefGate: DesignBrief = {
  ...axalDesignBrief,
  // @ts-expect-error Unknown visual quality gates must not be accepted.
  visualQualityGates: ["not-generic-saas", "first-viewport-product-signal", "invented"],
};

void unknownPattern;
void wrongSlot;
void wrongState;
void wrongStateSlot;
void unknownCriterion;
void wrongEmptyStatus;
void wrongBriefMode;
void wrongBriefPatternState;
void wrongDesignBriefGate;

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
} from "../src/index";

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
  slotRefs: ["uncertaintyCopy", "actionSlot"],
  requirement: "Blocked evidence updates must announce the blocking reason and next safe action.",
};

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
  requirement: "Should not exist",
};

void unknownPattern;
void wrongSlot;
void wrongState;
void wrongStateSlot;
void unknownCriterion;
void wrongEmptyStatus;

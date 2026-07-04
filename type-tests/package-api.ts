import { colorTokens, motionTokens, radiusTokens, spacingTokens } from "@sanchika/tokens";
import { primitiveClassName } from "@sanchika/primitives";
import type { PrimitiveSizeFor, PrimitiveToneFor } from "@sanchika/primitives";
import type {
  ConsumerMode,
  PatternA11yCheckFor,
  PatternA11yCriterion,
  PatternProgrammaticStatusFor,
  PatternSlotNameFor,
  PatternStateNameFor,
  PatternStateRequiredSlotNameFor,
} from "@sanchika/patterns";
import { primitiveGalleryCssImports, renderPrimitiveGalleryDocument } from "@sanchika/gallery";

const brandRole: "brandPrimary" = colorTokens.brandPrimary.role;
const spacingStep: "4" = spacingTokens["4"].step;
const radiusRole: "control" = radiusTokens.control.role;
const motionRole: "durationStandard" = motionTokens.durationStandard.role;

const buttonTone: PrimitiveToneFor<"Button"> = "brand";
const fieldSize: PrimitiveSizeFor<"Field"> = "lg";
const evidenceSlot: PatternSlotNameFor<"EvidencePanel"> = "sourceList";
const trustState: PatternStateNameFor<"TrustBoundary"> = "local-only";
const externalConsumerMode: ConsumerMode = "external/operational-saas";
const emptyEvidenceSlot: PatternStateRequiredSlotNameFor<"EvidencePanel", "empty"> = "actionSlot";
const targetSizeCriterion: PatternA11yCriterion = "WCAG22:2.5.8";
const blockedPatternCheck: PatternA11yCheckFor<"EvidencePanel", "blocked"> = {
  id: "blocked-reason-action-association",
  criterion: "WCAG22:3.3.2",
  sourceUrl: "https://www.w3.org/TR/WCAG22/#labels-or-instructions",
  requirement: "Blocked reason must be associated with the next safe action.",
  slotRefs: ["uncertaintyCopy", "actionSlot"],
  manualTest: "Confirm the blocking reason is read before or with the action needed to resolve it.",
};
const blockedPatternStatus: PatternProgrammaticStatusFor<"EvidencePanel", "blocked"> = {
  role: "alert",
  ariaLive: "assertive",
  ariaAtomic: true,
  slotRefs: ["uncertaintyCopy", "actionSlot"],
  requirement: "Blocked evidence updates must announce the blocking reason and next safe action.",
};
const galleryCssImport: "@sanchika/tokens/theme.css" = primitiveGalleryCssImports[0];
const galleryDocument: string = renderPrimitiveGalleryDocument();

primitiveClassName("Button", buttonTone, "md");
primitiveClassName("Field", "danger", fieldSize);

void brandRole;
void spacingStep;
void radiusRole;
void motionRole;
void evidenceSlot;
void trustState;
void externalConsumerMode;
void emptyEvidenceSlot;
void targetSizeCriterion;
void blockedPatternCheck;
void blockedPatternStatus;
void galleryCssImport;
void galleryDocument;

// @ts-expect-error Token roles must stay tied to their record keys.
const wrongTokenRole: "danger" = colorTokens.success.role;

// @ts-expect-error Button does not support the success tone.
primitiveClassName("Button", "success", "md");

// @ts-expect-error Badge does not support the lg size.
primitiveClassName("Badge", "success", "lg");

// @ts-expect-error TrustBoundary does not expose EvidencePanel slots.
const wrongPatternSlot: PatternSlotNameFor<"TrustBoundary"> = "sourceList";

// @ts-expect-error EvidencePanel.empty only requires actionSlot.
const wrongStateSlot: PatternStateRequiredSlotNameFor<"EvidencePanel", "empty"> = "sourceList";

void wrongTokenRole;
void wrongPatternSlot;
void wrongStateSlot;

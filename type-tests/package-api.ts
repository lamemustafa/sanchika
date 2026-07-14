import {
  colorTokens,
  elevationTokens,
  focusTokens,
  getTokenDefinition,
  motionTokens,
  radiusTokens,
  sizeTokens,
  spacingTokens,
  tokenDefinitions,
  tokenGroupDefinitions,
  typographyTokens,
} from "@sanchika/tokens";
import { formatGSTINDisplay, formatIndianCurrency, formatIndianDate, formatIndianDateTime, formatIndianNumber, formatPANDisplay, formatPercentage, primitiveClassName, textClassName } from "@sanchika/primitives";
import type { IndianDateTimeFormatOptions, IndianNumberFormatOptions, PercentageFormatOptions, PrimitiveClassOptionsFor, PrimitiveContract, PrimitiveSizeFor, PrimitiveSpec, PrimitiveToneFor, TextRole } from "@sanchika/primitives";
import type {
  ConsumerMode,
  PatternA11yCheckFor,
  PatternA11yCriterion,
  PatternProgrammaticStatusFor,
  PatternSlotNameFor,
  PatternStateNameFor,
  PatternStateRequiredSlotNameFor,
  ProductPatternContractFor,
  ProductPatternName,
  ProductPatternStateNameFor,
  ProductPatternVariantNameFor,
  DesignBrief,
  DesignBriefValidationIssue,
  EvidenceLoop,
  EvidenceLoopAdoptionEvidence,
  EvidenceLoopDecision,
  EvidenceLoopRenderEvidence,
  EvidenceLoopValidationIssue,
  TrustBrief,
  TrustBriefValidationIssue,
} from "@sanchika/patterns";
import {
  patternAliases,
  patternClassName,
  productPatternContracts,
  productPatternGroups,
  resolveProductPatternContract,
  validateDesignBrief,
  validateEvidenceLoop,
  validateTrustBrief,
} from "@sanchika/patterns";

const brandRole: "brandPrimary" = colorTokens.brandPrimary.role;
const legacyBackgroundVariable: "--sk-color-bg-base" = colorTokens.bgBase.cssVariable;
const canonicalTokenId: "color.canvas" = tokenDefinitions[0].id;
const canonicalGroupId: "color-surfaces" = tokenGroupDefinitions[0].id;
const canonicalToken = getTokenDefinition("color.canvas");
const spacingStep: "4" = spacingTokens["4"].step;
const radiusRole: "control" = radiusTokens.control.role;
const motionRole: "durationStandard" = motionTokens.durationStandard.role;
const typographyRole: "fontSizeMd" = typographyTokens.fontSizeMd.role;
const sizeRole: "controlMd" = sizeTokens.controlMd.role;
const elevationRole: "card" = elevationTokens.card.role;
const focusRole: "outlineWidth" = focusTokens.outlineWidth.role;

const buttonTone: PrimitiveToneFor<"Button"> = "brand";
const fieldSize: PrimitiveSizeFor<"Field"> = "lg";
const splitOptions: PrimitiveClassOptionsFor<"Split"> = { ratio: "primary", gap: "lg" };
const textRole: TextRole = "data";
const searchOptions: PrimitiveClassOptionsFor<"SearchField"> = { size: "lg" };
const tableOptions: PrimitiveClassOptionsFor<"TableShell"> = { density: "compact", header: "sticky" };
const numberOptions: IndianNumberFormatOptions = { display: "compact", maximumFractionDigits: 2 };
const percentageOptions: PercentageFormatOptions = { input: "percent" };
const dateTimeOptions: IndianDateTimeFormatOptions = { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" };
const legacyPrimitiveSpec: PrimitiveSpec = {
  name: "Fixture",
  role: "Legacy compatible fixture",
  tones: ["neutral"],
  sizes: ["md"],
  requiredStates: ["default"],
  stateEvidence: [{ state: "default", attributes: [], selectors: [".fixture"], notes: "Legacy shape." }],
  standards: [],
  accessibility: ["legacy-compatible"],
};
const richPrimitiveContract: PrimitiveContract = {
  ...legacyPrimitiveSpec,
  purpose: "Proves the rich S4 contract remains complete.",
  whenToUse: ["Rich fixture"],
  whenNotToUse: ["Legacy-only fixture"],
  semanticElement: "Use a neutral element.",
  classHooks: [".fixture"],
  anatomy: [{ name: "root", purpose: "Fixture root." }],
  variants: [],
  keyboardObligations: ["No keyboard behavior."],
  screenReaderObligations: ["Preserve text."],
  contentRules: ["Use fixture copy."],
  motion: { behavior: "No motion.", reducedMotion: "No override needed." },
  forcedColorsBehavior: ["No authored color."],
  mobileBehavior: ["Wrap safely."],
  examples: [{ title: "Fixture", className: "fixture", markup: "<div class=\"fixture\"></div>" }],
  galleryCoverage: ["Fixture"],
  consumerResponsibilities: ["Choose semantics."],
};
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
const productPatternName: ProductPatternName = "LocalArtifactFlow";
const publicHeroVariant: ProductPatternVariantNameFor<"PublicHero"> = "editorial";
const productEvidenceState: ProductPatternStateNameFor<"EvidencePanel"> = "under-review";
const routeMapContract: ProductPatternContractFor<"ProductRouteMap"> = resolveProductPatternContract("ProductFamilyRouter");
const canonicalPatternCount: number = productPatternContracts.length;
const canonicalPatternGroupCount: number = productPatternGroups.length;
const routeAliasName: "ProductRouteMap" = patternAliases.ProductFamilyRouter.name;
const heroClasses: string = patternClassName("PublicHero", { variant: "editorial", state: "default" });
const packTrustBrief: TrustBrief = {
  id: "pack-local-download-proof",
  consumerMode: "pack/local-utility",
  register: "product",
  surface: "Pack local download proof",
  userJob: "Confirm what stays local before generating a proof artifact.",
  primaryDecision: "Can the user continue without uploading documents or handing off credentials?",
  dataSensitivity: ["credential-boundary", "document-or-file", "local-artifact"],
  trustBoundaries: ["No upload", "No credential handoff", "No telemetry"],
  evidenceRequirements: ["Source visibility", "Local artifact proof", "User-controlled export"],
  selectedPatterns: [
    { name: "TrustBoundary", states: ["local-only"] },
    { catalog: "product", name: "LocalArtifactFlow", states: ["complete"] },
  ],
  claims: [{ claim: "Runs locally", evidence: "Boundary copy and source visibility are present before the action" }],
  nonGoals: ["No portal automation", "No backend upload"],
  verificationGates: ["token-only-styling", "wcag-22-aa", "keyboard-focus", "non-color-state", "mobile-render", "package-artifact"],
};
const packTrustBriefIssues: readonly TrustBriefValidationIssue[] = validateTrustBrief(packTrustBrief);
const packDesignBrief: DesignBrief = {
  id: "pack-local-download-proof-design",
  trustBrief: packTrustBrief,
  register: "product",
  surface: "Pack local download proof",
  firstViewportSignal: "Pack local proof with browser-local boundary and export artifact visible before action",
  emotionalIntent: "Inspectable confidence that nothing private leaves the browser.",
  narrativeArc: ["State the local boundary", "Show the artifact proof", "Let the user export deliberately"],
  informationPriority: ["Local-only boundary", "Permission posture", "Artifact contents", "Export action"],
  responsiveConstraints: ["Mobile must show local-only and no-upload copy before export", "Desktop must show source and artifact proof together"],
  interactionStates: ["loading", "empty", "error", "disabled", "focus", "hover"],
  visualQualityGates: ["not-generic-saas", "first-viewport-product-signal", "source-visible", "responsive-fit", "keyboardable", "performance-budget"],
  verificationEvidence: ["Desktop render screenshot", "Mobile render screenshot", "Permission copy review"],
  nonGoals: ["No upload", "No credential handoff", "No telemetry", "No portal automation", "No backend upload"],
};
const packDesignBriefIssues: readonly DesignBriefValidationIssue[] = validateDesignBrief(packDesignBrief);
const packRenderEvidence: EvidenceLoopRenderEvidence = {
  type: "desktop-screenshot",
  artifact: "artifacts/pack-local-download-proof-desktop.png",
  finding: "Desktop render keeps local-only proof visible before export.",
};
const packAdoptionEvidence: EvidenceLoopAdoptionEvidence = {
  consumerRepo: "lamemustafa/complyeaze-pack",
  consumerSurface: "Pack local download proof",
  status: "verified",
  changedFiles: ["src/popup/proof-panel.tsx"],
  verificationRun: "pnpm verify",
  rollbackPlan: "Revert the proof-panel consumer PR.",
};
const packEvidenceLoopDecision: EvidenceLoopDecision = "ready-for-consumer-pr";
const packEvidenceLoop: EvidenceLoop = {
  id: "pack-local-download-proof-loop",
  trustBrief: packTrustBrief,
  designBrief: packDesignBrief,
  renderEvidence: [
    packRenderEvidence,
    {
      type: "mobile-screenshot",
      artifact: "artifacts/pack-local-download-proof-mobile.png",
      finding: "Mobile render keeps no-upload and no-credential-handoff copy before export.",
    },
    {
      type: "accessibility-note",
      artifact: "artifacts/pack-local-download-proof-a11y.md",
      finding: "Accessibility review covered focus order, accessible names, and non-color-only status.",
    },
  ],
  adoptionEvidence: packAdoptionEvidence,
  decision: packEvidenceLoopDecision,
  residualRisks: ["Browser extension screenshots should be repeated when the Chrome Web Store package changes."],
  nextActions: ["Open the Pack consumer PR with this evidence loop."],
};
const packEvidenceLoopIssues: readonly EvidenceLoopValidationIssue[] = validateEvidenceLoop(packEvidenceLoop);

primitiveClassName("Button", buttonTone, "md");
primitiveClassName("Field", "danger", fieldSize);
primitiveClassName("Split", splitOptions);
textClassName(textRole);
patternClassName("EvidencePanel", { variant: "rail", state: "under-review" });
primitiveClassName("SearchField", searchOptions);
primitiveClassName("TableShell", tableOptions);
formatIndianNumber(12_345_678, numberOptions);
formatIndianCurrency(1_234_567);
formatIndianDate("2026-07-14");
formatIndianDateTime("2026-07-14T00:00:00Z", dateTimeOptions);
formatPANDisplay("ABCDE" + "1234" + "F");
formatGSTINDisplay("27" + "ABCDE" + "1234" + "F1Z5");
formatPercentage(18, percentageOptions);

void brandRole;
void legacyBackgroundVariable;
void canonicalTokenId;
void canonicalGroupId;
void canonicalToken;
void spacingStep;
void radiusRole;
void motionRole;
void typographyRole;
void sizeRole;
void elevationRole;
void focusRole;
void splitOptions;
void textRole;
void legacyPrimitiveSpec;
void richPrimitiveContract;
void searchOptions;
void tableOptions;
void numberOptions;
void percentageOptions;
void dateTimeOptions;
void evidenceSlot;
void trustState;
void externalConsumerMode;
void emptyEvidenceSlot;
void targetSizeCriterion;
void blockedPatternCheck;
void blockedPatternStatus;
void productPatternName;
void publicHeroVariant;
void productEvidenceState;
void routeMapContract;
void canonicalPatternCount;
void canonicalPatternGroupCount;
void routeAliasName;
void heroClasses;
void packTrustBrief;
void packTrustBriefIssues;
void packDesignBrief;
void packDesignBriefIssues;
void packRenderEvidence;
void packAdoptionEvidence;
void packEvidenceLoopDecision;
void packEvidenceLoop;
void packEvidenceLoopIssues;

// @ts-expect-error Token roles must stay tied to their record keys.
const wrongTokenRole: "danger" = colorTokens.success.role;

// @ts-expect-error Button does not support the success tone.
primitiveClassName("Button", "success", "md");

// @ts-expect-error Badge does not support the lg size.
primitiveClassName("Badge", "success", "lg");

// @ts-expect-error Unknown layout variants must not compile.
primitiveClassName("Grid", { columns: "12" });

// @ts-expect-error SearchField has finite sizes only.
primitiveClassName("SearchField", { size: "xl" });

// @ts-expect-error Percentage input convention is explicit.
formatPercentage(18, { input: "basis-points" });

// @ts-expect-error Rich contracts require S4-only contract fields.
const incompleteRichPrimitiveContract: PrimitiveContract = legacyPrimitiveSpec;

// @ts-expect-error TrustBoundary does not expose EvidencePanel slots.
const wrongPatternSlot: PatternSlotNameFor<"TrustBoundary"> = "sourceList";

// @ts-expect-error EvidencePanel.empty only requires actionSlot.
const wrongStateSlot: PatternStateRequiredSlotNameFor<"EvidencePanel", "empty"> = "sourceList";

// @ts-expect-error Canonical S7 pattern names are finite.
const wrongProductPatternName: ProductPatternName = "GenericDashboard";

// @ts-expect-error PublicHero does not expose workspace variants.
patternClassName("PublicHero", { variant: "three-pane" });

// @ts-expect-error LocalArtifactFlow does not expose EvidencePanel states.
patternClassName("LocalArtifactFlow", { state: "reviewed" });

void wrongTokenRole;
void wrongPatternSlot;
void wrongStateSlot;
void wrongProductPatternName;
void incompleteRichPrimitiveContract;

import { primitiveClassName, textClassName } from "../src/index";
import type { PrimitiveContract, PrimitiveSpec } from "../src/index";

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
  purpose: "Rich fixture.",
  whenToUse: ["Fixture"],
  whenNotToUse: ["Outside fixtures"],
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
void legacyPrimitiveSpec;
void richPrimitiveContract;

primitiveClassName("Button", "brand", "md");
primitiveClassName("Card", "warning", "lg");
primitiveClassName("Badge", "success", "sm");
primitiveClassName("Field", "danger", "lg");
primitiveClassName("Container", { width: "wide" });
primitiveClassName("Section", { space: "lg", boundary: "bordered" });
primitiveClassName("Stack", { gap: "sm", align: "start" });
primitiveClassName("Cluster", { justify: "between" });
primitiveClassName("Grid", { columns: "3", gap: "lg" });
primitiveClassName("Split", { ratio: "primary", gap: "md" });
primitiveClassName("Surface", { variant: "inset", padding: "lg" });
primitiveClassName("Divider");
primitiveClassName("VisuallyHidden");
primitiveClassName("Text", { role: "data" });
primitiveClassName("Link", { variant: "quiet" });
primitiveClassName("LinkCard", { variant: "muted" });
primitiveClassName("SearchField", { size: "lg" });
primitiveClassName("InlineStatus", { tone: "warning" });
primitiveClassName("Skeleton", { form: "row" });
primitiveClassName("EmptyState", { kind: "filtered" });
primitiveClassName("ErrorState", { severity: "recoverable" });
primitiveClassName("Progress", { state: "determinate" });
primitiveClassName("Stepper", { orientation: "vertical" });
primitiveClassName("Disclosure");
primitiveClassName("CopyButton", { state: "copied", size: "sm" });
primitiveClassName("Breadcrumb");
primitiveClassName("Stat", { alignment: "end" });
primitiveClassName("TableShell", { density: "compact", header: "sticky" });
textClassName("heading");

// @ts-expect-error Unknown primitives must not produce plausible class names.
primitiveClassName("Toast", "neutral", "md");

// @ts-expect-error Button does not support the success tone.
primitiveClassName("Button", "success", "md");

// @ts-expect-error Badge does not support the lg size.
primitiveClassName("Badge", "success", "lg");

// @ts-expect-error Field does not support the brand tone.
primitiveClassName("Field", "brand", "md");

// @ts-expect-error Container accepts only evidence-backed width modes.
primitiveClassName("Container", { width: "marketing" });

// @ts-expect-error Grid is not a twelve-column utility framework.
primitiveClassName("Grid", { columns: "12" });

// @ts-expect-error Surface variants are finite.
primitiveClassName("Surface", { variant: "glass" });

// @ts-expect-error TableShell is not a data-grid runtime.
primitiveClassName("TableShell", { density: "virtualized" });

// @ts-expect-error Text roles are semantic, not arbitrary size aliases.
textClassName("text-12");

// @ts-expect-error Rich contracts require S4-only contract fields.
const incompleteRichPrimitiveContract: PrimitiveContract = legacyPrimitiveSpec;
void incompleteRichPrimitiveContract;

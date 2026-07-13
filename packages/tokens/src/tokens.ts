type CssVariable = `--sk-${string}`;
type TokenType =
  | "color"
  | "dimension"
  | "duration"
  | "easing"
  | "font-family"
  | "font-size"
  | "font-weight"
  | "letter-spacing"
  | "line-height"
  | "shadow";
type TokenGroupId = "color-surfaces" | "typography" | "layout-rhythm" | "borders-elevation" | "motion" | "compatibility";
type LegacyAlias = Readonly<{ cssVariable: CssVariable; note: string }>;
type TokenOptions = Readonly<{
  legacyAliases?: readonly LegacyAlias[];
  deprecated?: true;
  replacement?: string;
}>;
type TokenBase = Readonly<{
  id: string;
  cssVariable: CssVariable;
  type: TokenType;
  group: TokenGroupId;
  description: string;
  usage: string;
  avoid: string;
  source: string;
}> & TokenOptions;
type AuthoredValueToken = TokenBase & Readonly<{ value: string; alias?: never }>;
type AuthoredAliasToken = TokenBase & Readonly<{ alias: string; value?: never }>;
export type AuthoredToken = AuthoredValueToken | AuthoredAliasToken;
type TokenGroup = Readonly<{ id: TokenGroupId; title: string; description: string }>;
type CompatibilityEntry = Readonly<{ key: string; token: string; usage: string; cssVariable?: CssVariable }>;
type CompatibilityCollection = Readonly<{
  exportName: string;
  keyTypeName: string;
  definitionTypeName: string;
  definitionForTypeName: string;
  definitionsTypeName: string;
  discriminator: string;
  cssVariableTemplate: string;
  entries: readonly CompatibilityEntry[];
}>;

const valueToken = (
  id: string,
  cssVariable: CssVariable,
  type: TokenType,
  value: string,
  group: TokenGroupId,
  description: string,
  usage: string,
  avoid: string,
  source: string,
  options: TokenOptions = {},
): AuthoredValueToken => ({
  id,
  cssVariable,
  type,
  value,
  group,
  description,
  usage,
  avoid,
  source,
  ...options,
});

const aliasToken = (
  id: string,
  cssVariable: CssVariable,
  type: TokenType,
  alias: string,
  group: TokenGroupId,
  description: string,
  usage: string,
  avoid: string,
  source: string,
  options: TokenOptions = {},
): AuthoredAliasToken => ({
  id,
  cssVariable,
  type,
  alias,
  group,
  description,
  usage,
  avoid,
  source,
  ...options,
});

const legacy = (cssVariable: CssVariable, note: string): LegacyAlias => ({ cssVariable, note });
const entry = (key: string, token: string, usage: string, cssVariable?: CssVariable): CompatibilityEntry => ({
  key,
  token,
  usage,
  ...(cssVariable ? { cssVariable } : {}),
});

export const authoredTokenGroups = [
  { id: "color-surfaces", title: "Color and surfaces", description: "Cool-mineral planes, ledger ink, action roles, and semantic status triads." },
  { id: "typography", title: "Typography", description: "Runtime-safe display, body, mono, scale, weight, rhythm, and tracking roles." },
  { id: "layout-rhythm", title: "Layout and rhythm", description: "Evidence-backed spacing, containers, page rhythm, controls, and table density." },
  { id: "borders-elevation", title: "Borders, radius, elevation, and focus", description: "Border-led hierarchy with restrained radii, quiet elevation, and focus geometry." },
  { id: "motion", title: "Motion", description: "Short, CSS-first durations, easing curves, and travel distances for state feedback." },
  { id: "compatibility", title: "One-release compatibility", description: "Deprecated v0.0.2 values retained only where no equivalent semantic alias preserves behavior." },
] as const satisfies readonly TokenGroup[];

const c1Foundation = "C1 foundation.css shared across ComplyEaze, Axal, Pack, and Tools";
const c1Motion = "C1 motion study plus repeated focus and disclosure evidence";
const existingV002 = "v0.0.2 public token compatibility and current primitive consumption";

export const authoredTokens = [
  valueToken("color.canvas", "--sk-color-canvas", "color", "oklch(97% 0.008 220)", "color-surfaces", "Cool mineral page canvas.", "Primary page background for light Sanchika surfaces.", "Do not use as a product-specific campaign color.", c1Foundation, { legacyAliases: [legacy("--sk-color-bg-base", "Deprecated background-base name; use canvas.")] }),
  valueToken("color.surface", "--sk-color-surface", "color", "oklch(99.2% 0.003 220)", "color-surfaces", "Quiet content surface above the canvas.", "Default panels, records, and grouped content.", "Do not imply elevation when a border is sufficient.", c1Foundation, { legacyAliases: [legacy("--sk-color-bg-surface", "Deprecated background-surface name; use surface.")] }),
  valueToken("color.surface-raised", "--sk-color-surface-raised", "color", "oklch(100% 0 0)", "color-surfaces", "Highest light surface in the canonical theme.", "Controls and genuinely raised content planes.", "Do not turn every section into a raised card.", c1Foundation),
  valueToken("color.surface-inset", "--sk-color-surface-inset", "color", "oklch(95% 0.012 225)", "color-surfaces", "Cool inset plane for dense operational context.", "Queues, wells, and contained secondary regions.", "Do not use as a separate product palette.", "C1 Axal workspace canvas"),
  aliasToken("color.surface-muted", "--sk-color-surface-muted", "color", "color.surface-inset", "color-surfaces", "Muted neutral surface.", "Low-emphasis supporting regions and neutral status backgrounds.", "Do not use when the content needs a stronger boundary.", "C1 Axal workspace canvas reused semantically"),
  valueToken("color.ink-primary", "--sk-color-ink-primary", "color", "oklch(19% 0.028 245)", "color-surfaces", "Near-black ledger ink.", "Primary text, headings, and dense data.", "Do not soften primary operational facts.", c1Foundation),
  valueToken("color.ink-secondary", "--sk-color-ink-secondary", "color", "oklch(43% 0.024 245)", "color-surfaces", "Secondary ledger ink.", "Supporting text that must still pass normal-text contrast.", "Do not use for disabled content by opacity alone.", c1Foundation),
  aliasToken("color.ink-muted", "--sk-color-ink-muted", "color", "color.ink-secondary", "color-surfaces", "Muted text role with AA contrast on canonical light planes.", "Hints, metadata, and secondary descriptions.", "Do not use for critical status or primary instructions.", c1Foundation),
  aliasToken("color.ink-inverse", "--sk-color-ink-inverse", "color", "color.surface-raised", "color-surfaces", "High-contrast text on the dark brand plane.", "Primary inverse text and icons.", "Do not use on light surfaces.", c1Foundation),
  valueToken("color.border-subtle", "--sk-color-border-subtle", "color", "oklch(82% 0.018 245)", "color-surfaces", "Quiet record divider.", "Separating related rows and sections.", "Do not rely on it as the only control boundary.", c1Foundation),
  valueToken("color.border-default", "--sk-color-border-default", "color", "oklch(64% 0.018 255)", "color-surfaces", "Default non-text control boundary.", "Controls and surfaces requiring visible separation.", "Do not use decorative borders on every container.", existingV002, { legacyAliases: [legacy("--sk-color-border-control", "Deprecated control-specific name; use border-default.")] }),
  valueToken("color.border-strong", "--sk-color-border-strong", "color", "oklch(57% 0.03 245)", "color-surfaces", "Strong structural boundary.", "Selected evidence planes and high-priority separation.", "Do not substitute it for status text.", c1Foundation),
  valueToken("color.brand-primary", "--sk-color-brand-primary", "color", "oklch(16% 0.028 235)", "color-surfaces", "Deep navy-teal authority plane.", "Primary actions and dark evidence planes.", "Do not use as an inactive-state fill.", c1Foundation),
  valueToken("color.brand-secondary", "--sk-color-brand-secondary", "color", "oklch(73% 0.09 162)", "color-surfaces", "Evidence mint supporting the navy-teal anchor.", "Source-linked, ready, and locally verified accents.", "Do not imply statutory approval or completion.", c1Foundation),
  valueToken("color.accent-seal", "--sk-color-accent-seal", "color", "oklch(76% 0.14 82)", "color-surfaces", "Oxidized-brass seal accent.", "Sparse source, review, and attention markers.", "Do not use as a universal decorative highlight.", c1Foundation, { legacyAliases: [legacy("--sk-color-accent", "Deprecated flat accent; use accent-seal.")] }),
  valueToken("color.link", "--sk-color-link", "color", "oklch(55.8% 0.12 47)", "color-surfaces", "Copper link ink adjusted from C1 to pass AA on canvas.", "Inline links and source destinations on light planes.", "Do not use as unlabeled status color.", "C1 copper accent adjusted by contrast testing"),
  aliasToken("color.link-hover", "--sk-color-link-hover", "color", "color.brand-primary", "color-surfaces", "High-contrast link hover ink.", "Hover and active link feedback on light planes.", "Do not remove underline or another link affordance.", c1Foundation),
  aliasToken("color.focus", "--sk-color-focus", "color", "color.link", "color-surfaces", "Visible focus indicator color.", "Keyboard focus outlines on canonical light planes.", "Do not disable focus in forced colors.", "C1 focus evidence"),
  aliasToken("color.selection-bg", "--sk-color-selection-bg", "color", "color.accent-seal", "color-surfaces", "Text-selection background.", "Browser text selection in the canonical light theme.", "Do not use as a status background.", c1Foundation),
  aliasToken("color.selection-text", "--sk-color-selection-text", "color", "color.brand-primary", "color-surfaces", "Text-selection foreground.", "Text selected against the seal accent.", "Do not use as inverse body text.", c1Foundation),
  valueToken("color.overlay", "--sk-color-overlay", "color", "oklch(16% 0.028 235 / 72%)", "color-surfaces", "Dark neutral overlay derived from the C1 authority plane.", "Future modal backdrops when a real primitive requires one.", "Do not use as a decorative tint or imply a z-index scale.", "C1 dark plane with restrained overlay opacity"),
  valueToken("color.success-bg", "--sk-color-success-bg", "color", "oklch(94% 0.03 162)", "color-surfaces", "Success status background.", "Positive states with visible success text.", "Do not imply government or professional approval.", c1Foundation),
  valueToken("color.success-fg", "--sk-color-success-fg", "color", "oklch(45% 0.075 148)", "color-surfaces", "Success status foreground.", "Success text and icons on success-bg.", "Do not use without visible status wording.", existingV002, { legacyAliases: [legacy("--sk-color-success", "Deprecated flat success color; use success-fg.")] }),
  aliasToken("color.success-border", "--sk-color-success-border", "color", "color.brand-secondary", "color-surfaces", "Success status border.", "Boundary for success states paired with text.", "Do not rely on the border alone.", c1Foundation),
  valueToken("color.warning-bg", "--sk-color-warning-bg", "color", "oklch(91% 0.045 55)", "color-surfaces", "Warning status background.", "Attention states with visible warning text.", "Do not use for decorative warmth.", c1Foundation),
  aliasToken("color.warning-fg", "--sk-color-warning-fg", "color", "color.ink-secondary", "color-surfaces", "Warning foreground with AA contrast.", "Warning text and icons on warning-bg.", "Do not use color as the only warning signal.", "C1 warning plane plus contrast testing", { legacyAliases: [legacy("--sk-color-warning", "Deprecated flat warning color; use warning-fg.")] }),
  aliasToken("color.warning-border", "--sk-color-warning-border", "color", "color.link", "color-surfaces", "Warning status border.", "Boundary for warning states paired with wording.", "Do not use as a generic copper accent.", c1Foundation),
  aliasToken("color.danger-bg", "--sk-color-danger-bg", "color", "color.surface", "color-surfaces", "Danger status background.", "Error and destructive states with explicit copy.", "Do not use for ordinary attention states.", existingV002),
  valueToken("color.danger-fg", "--sk-color-danger-fg", "color", "oklch(48% 0.12 32)", "color-surfaces", "Danger status foreground.", "Error text and destructive action evidence.", "Do not use without a recoverable explanation.", existingV002, { legacyAliases: [legacy("--sk-color-danger", "Deprecated flat danger color; use danger-fg.")] }),
  aliasToken("color.danger-border", "--sk-color-danger-border", "color", "color.danger-fg", "color-surfaces", "Danger status border.", "Boundary for danger states paired with wording.", "Do not rely on the border alone.", existingV002),
  aliasToken("color.info-bg", "--sk-color-info-bg", "color", "color.surface-inset", "color-surfaces", "Information status background.", "Neutral source and explanatory states.", "Do not use as a success state.", "C1 workspace inset"),
  valueToken("color.info-fg", "--sk-color-info-fg", "color", "oklch(48% 0.06 240)", "color-surfaces", "Information status foreground.", "Information text and icons on info-bg.", "Do not replace links or focus indicators with it.", existingV002, { legacyAliases: [legacy("--sk-color-info", "Deprecated flat information color; use info-fg.")] }),
  aliasToken("color.info-border", "--sk-color-info-border", "color", "color.info-fg", "color-surfaces", "Information status border.", "Boundary for information states paired with wording.", "Do not rely on the border alone.", existingV002),
  aliasToken("color.neutral-bg", "--sk-color-neutral-bg", "color", "color.surface-muted", "color-surfaces", "Neutral status background.", "Draft, pending, and unclassified states.", "Do not imply success or warning.", "C1 workspace inset"),
  aliasToken("color.neutral-fg", "--sk-color-neutral-fg", "color", "color.ink-primary", "color-surfaces", "Neutral status foreground.", "Neutral status wording and icons.", "Do not mute important pending states.", c1Foundation),
  aliasToken("color.neutral-border", "--sk-color-neutral-border", "color", "color.border-default", "color-surfaces", "Neutral status border.", "Boundary for neutral states paired with wording.", "Do not rely on the border alone.", existingV002),

  valueToken("font.display", "--sk-font-display", "font-family", "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif", "typography", "Display stack proven by C1 without a runtime font request.", "Public headings and proof-object titles.", "Do not use display styling for dense controls or tables.", c1Foundation),
  aliasToken("font.body", "--sk-font-body", "font-family", "font.display", "typography", "Body and UI sans stack.", "Body copy, controls, labels, and operational UI.", "Do not add a remote font dependency in package CSS.", c1Foundation),
  valueToken("font.mono", "--sk-font-mono", "font-family", "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace", "typography", "Runtime-safe mono stack.", "Amounts, IDs, GSTINs, dates, checksums, releases, and source references.", "Do not use for paragraphs or decorative code styling.", c1Foundation),
  valueToken("font-size.xs", "--sk-font-size-xs", "font-size", "0.72rem", "typography", "Compact caption size repeated across C1 artifacts.", "Source labels, compact metadata, and captions.", "Do not use for long body copy or primary actions.", c1Foundation),
  valueToken("font-size.sm", "--sk-font-size-sm", "font-size", "0.875rem", "typography", "Small supporting text size.", "Hints, badges, and secondary labels.", "Do not use when dense content becomes unreadable.", existingV002),
  valueToken("font-size.md", "--sk-font-size-md", "font-size", "0.9375rem", "typography", "Default compact UI size.", "Controls, labels, and compact body content.", "Do not use as the only hierarchy signal.", existingV002),
  valueToken("font-size.lg", "--sk-font-size-lg", "font-size", "1rem", "typography", "Default body size for the North Stars.", "Body copy and comfortable control text.", "Do not inflate dense tables.", c1Foundation),
  valueToken("font-size.xl", "--sk-font-size-xl", "font-size", "1.25rem", "typography", "Small heading size repeated in C1.", "Card and panel headings.", "Do not use for micro labels.", c1Foundation),
  valueToken("font-size.2xl", "--sk-font-size-2xl", "font-size", "1.55rem", "typography", "Operational section-heading size.", "Selected records and compact section titles.", "Do not use for dense row labels.", "C1 Axal and Pack headings"),
  valueToken("font-size.3xl", "--sk-font-size-3xl", "font-size", "clamp(1.55rem, 2.8vw, 2.65rem)", "typography", "Responsive section-display role.", "Public proof-section and directory headings.", "Do not use inside compact product controls.", c1Foundation),
  valueToken("font-size.4xl", "--sk-font-size-4xl", "font-size", "clamp(2.3rem, 5.2vw, 5rem)", "typography", "Responsive compact hero role.", "North Star compact page headlines.", "Do not use in tables or side panels.", c1Foundation),
  valueToken("font-size.5xl", "--sk-font-size-5xl", "font-size", "clamp(3.15rem, 7.1vw, 6rem)", "typography", "Largest C1-proven public hero role.", "A single dominant public headline when composition supports it.", "Do not use by default or in product workspace UI.", "C1 ComplyEaze hero proves a real 5xl need"),
  valueToken("font-weight.regular", "--sk-font-weight-regular", "font-weight", "400", "typography", "Regular text weight.", "Body copy and long-form reading.", "Do not lower contrast by combining with muted colors carelessly.", c1Foundation),
  valueToken("font-weight.medium", "--sk-font-weight-medium", "font-weight", "500", "typography", "Medium emphasis weight.", "Secondary emphasis and data labels.", "Do not replace structural hierarchy with weight alone.", c1Foundation),
  valueToken("font-weight.semibold", "--sk-font-weight-semibold", "font-weight", "650", "typography", "Strong UI emphasis weight.", "Controls, labels, and important state text.", "Do not apply to every sentence.", existingV002),
  valueToken("font-weight.bold", "--sk-font-weight-bold", "font-weight", "700", "typography", "Bold compact emphasis.", "Badges, headings, and critical facts.", "Do not use as a substitute for spacing and hierarchy.", existingV002),
  valueToken("line-height.ui", "--sk-line-height-ui", "line-height", "1.2", "typography", "Compact UI line height.", "Controls and short labels.", "Do not use for paragraphs.", existingV002, { legacyAliases: [legacy("--sk-line-height-control", "Deprecated control role; use line-height-ui."), legacy("--sk-line-height-label", "Deprecated label role; use line-height-ui.")] }),
  valueToken("line-height.body", "--sk-line-height-body", "line-height", "1.5", "typography", "Readable body line height.", "Body copy and supporting descriptions.", "Do not compress long-form text below this without evidence.", existingV002),
  valueToken("line-height.display", "--sk-line-height-display", "line-height", "0.95", "typography", "Tight but legible display rhythm.", "Large public headings only.", "Do not use for controls, tables, or body copy.", c1Foundation),
  valueToken("line-height.caption", "--sk-line-height-caption", "line-height", "1.25", "typography", "Compact caption rhythm.", "Metadata, source notes, and badges.", "Do not use for multi-paragraph copy.", c1Foundation, { legacyAliases: [legacy("--sk-line-height-tight", "Deprecated tight role; use line-height-caption.")] }),
  valueToken("letter-spacing.tight", "--sk-letter-spacing-tight", "letter-spacing", "-0.04em", "typography", "C1 display tracking floor.", "Large display headings with reviewed copy.", "Do not track more tightly than this role.", c1Foundation),
  valueToken("letter-spacing.normal", "--sk-letter-spacing-normal", "letter-spacing", "0", "typography", "Normal UI tracking.", "Body, controls, and data.", "Do not add decorative tracking to ordinary labels.", existingV002),
  valueToken("letter-spacing.caps", "--sk-letter-spacing-caps", "letter-spacing", "0.06em", "typography", "Compact uppercase label tracking.", "File tabs, provenance labels, and source metadata.", "Do not create an eyebrow above every section.", c1Foundation),

  ...([
    ["1", "0.25rem", "Small inline gaps"], ["2", "0.5rem", "Control and badge gaps"], ["3", "0.75rem", "Compact control padding"], ["4", "1rem", "Default control and surface spacing"],
    ["6", "1.5rem", "Large control and surface spacing"], ["8", "2rem", "Compact section spacing"], ["12", "3rem", "Large section spacing"], ["16", "4rem", "Page-level spacing"],
  ] as const).map(([step, value, usage]) => valueToken(`space.${step}`, `--sk-space-${step}`, "dimension", value, "layout-rhythm", `Base spacing step ${step}.`, usage, "Do not create a new spacing step without approved reference evidence.", existingV002)),
  valueToken("container.reading", "--sk-container-reading", "dimension", "50rem", "layout-rhythm", "Readable long-form measure.", "Documentation and policy prose.", "Do not constrain dense tables to reading width.", "C1 lede measure"),
  valueToken("container.content", "--sk-container-content", "dimension", "69rem", "layout-rhythm", "Primary content measure.", "Compact North Star pages and working content.", "Do not use for intentionally wide evidence desks.", "C1 compact intro measure"),
  valueToken("container.wide", "--sk-container-wide", "dimension", "86rem", "layout-rhythm", "Wide proof and gallery shell.", "Evidence apertures and multi-pane proof objects.", "Do not use as the default prose width.", c1Foundation),
  valueToken("container.full", "--sk-container-full", "dimension", "100%", "layout-rhythm", "Full available inline measure.", "Full-bleed or consumer-owned shell composition.", "Do not bypass safe page gutters.", "C1 shell composition"),
  aliasToken("section-padding.sm", "--sk-section-padding-sm", "dimension", "space.8", "layout-rhythm", "Small section padding.", "Compact supporting sections.", "Do not use where a major narrative pause is needed.", c1Foundation),
  valueToken("section-padding.md", "--sk-section-padding-md", "dimension", "clamp(2.75rem, 6vw, 5.5rem)", "layout-rhythm", "Responsive medium section padding.", "Compact North Star intros and proof sections.", "Do not use inside dense rows.", c1Foundation),
  valueToken("section-padding.lg", "--sk-section-padding-lg", "dimension", "clamp(3.25rem, 8vw, 7.5rem)", "layout-rhythm", "Responsive large section padding.", "Dominant public orientation sections.", "Do not repeat on every section.", c1Foundation),
  aliasToken("content-gap.sm", "--sk-content-gap-sm", "dimension", "space.3", "layout-rhythm", "Small content gap.", "Compact metadata and control groups.", "Do not use for major section separation.", c1Foundation),
  aliasToken("content-gap.md", "--sk-content-gap-md", "dimension", "space.6", "layout-rhythm", "Medium content gap.", "Panel and proof-object rhythm.", "Do not use as a universal page gap.", c1Foundation),
  aliasToken("content-gap.lg", "--sk-content-gap-lg", "dimension", "space.8", "layout-rhythm", "Large content gap.", "Major relationships inside a composition.", "Do not replace section padding with gaps.", c1Foundation),
  valueToken("page-gutter", "--sk-page-gutter", "dimension", "clamp(0.75rem, 3vw, 2.5rem)", "layout-rhythm", "Responsive page gutter proven across every C1 route.", "Page shells and full-width proof surfaces.", "Do not use as component padding.", c1Foundation),
  valueToken("control-height.sm", "--sk-control-height-sm", "dimension", "2rem", "layout-rhythm", "Small control height.", "Compact secondary controls.", "Do not use for primary mobile actions without target review.", existingV002, { legacyAliases: [legacy("--sk-size-control-sm", "Deprecated size-control name; use control-height-sm.")] }),
  valueToken("control-height.md", "--sk-control-height-md", "dimension", "2.5rem", "layout-rhythm", "Default control height.", "Standard controls and inputs.", "Do not reduce practical touch targets blindly.", existingV002, { legacyAliases: [legacy("--sk-size-control-md", "Deprecated size-control name; use control-height-md.")] }),
  valueToken("control-height.lg", "--sk-control-height-lg", "dimension", "2.875rem", "layout-rhythm", "Large control height.", "Primary actions and spacious inputs.", "Do not use to make every control visually primary.", existingV002, { legacyAliases: [legacy("--sk-size-control-lg", "Deprecated size-control name; use control-height-lg.")] }),
  aliasToken("table-row.compact", "--sk-table-row-compact", "dimension", "control-height.md", "layout-rhythm", "Compact table row floor.", "Dense operational tables.", "Do not hide wrapped content or reduce keyboard targets.", "C1 Axal queue density"),
  aliasToken("table-row.comfortable", "--sk-table-row-comfortable", "dimension", "control-height.lg", "layout-rhythm", "Comfortable table row floor.", "Review tables with longer labels.", "Do not use as arbitrary card height.", "C1 Axal queue density"),

  valueToken("border-width.hairline", "--sk-border-width-hairline", "dimension", "1px", "borders-elevation", "Hairline structural border.", "Quiet dividers and ledger rails.", "Do not use where non-text contrast requires a stronger boundary.", c1Foundation),
  aliasToken("border-width.default", "--sk-border-width-default", "dimension", "border-width.hairline", "borders-elevation", "Default border width.", "Control and surface boundaries.", "Do not stack multiple borders decoratively.", c1Foundation),
  valueToken("border-width.strong", "--sk-border-width-strong", "dimension", "0.16rem", "borders-elevation", "Strong state and evidence border.", "Selected evidence planes and high-priority states.", "Do not use as a decorative side stripe.", "C1 selected queue and evidence borders"),
  valueToken("radius.sm", "--sk-radius-sm", "dimension", "0.5rem", "borders-elevation", "Small control radius.", "Buttons, fields, and compact badges.", "Do not use pill shapes without a primitive need.", existingV002, { legacyAliases: [legacy("--sk-radius-control", "Deprecated control radius; use radius-sm.")] }),
  valueToken("radius.md", "--sk-radius-md", "dimension", "0.625rem", "borders-elevation", "Medium grouped-surface radius preserving v0.0.2 geometry.", "Cards and compact evidence records.", "Do not round large page sections excessively.", existingV002, { legacyAliases: [legacy("--sk-radius-card", "Deprecated card radius; use radius-md.")] }),
  valueToken("radius.lg", "--sk-radius-lg", "dimension", "1.1rem", "borders-elevation", "Large proof-shell radius.", "Dominant North Star proof artifacts only.", "Do not use on nested records or controls.", c1Foundation),
  valueToken("shadow.card", "--sk-shadow-card", "shadow", "0 1px 2px color-mix(in oklch, var(--sk-color-ink-muted) 14%, transparent)", "borders-elevation", "Quiet card elevation retained from v0.0.2.", "Only when a static surface genuinely lifts above canvas.", "Do not pair with a decorative wide shadow.", existingV002, { legacyAliases: [legacy("--sk-elevation-card", "Deprecated elevation name; use shadow-card.")] }),
  aliasToken("shadow.raised", "--sk-shadow-raised", "shadow", "shadow.card", "borders-elevation", "Reserved raised-surface elevation using the proven quiet card value.", "Raised content when border hierarchy is insufficient.", "Do not use to decorate ordinary sections.", existingV002),
  aliasToken("shadow.popover", "--sk-shadow-popover", "shadow", "shadow.card", "borders-elevation", "Conservative popover elevation until S5 proves a stronger need.", "Future popovers and disclosures with a real stacking need.", "Do not invent a glow or broad floating shadow.", "C1 quiet-elevation rule; stronger value deferred"),
  valueToken("shadow.focus", "--sk-shadow-focus", "shadow", "0 0 0 var(--sk-focus-outline-width) var(--sk-color-focus)", "borders-elevation", "Focus shadow counterpart for consumers that cannot use outline.", "Mechanically equivalent visible focus fallback.", "Do not replace native forced-color outlines.", "C1 focus evidence and v0.0.2 focus geometry"),
  valueToken("focus.outline-width", "--sk-focus-outline-width", "dimension", "2px", "borders-elevation", "Visible focus outline width.", "Keyboard focus rings.", "Do not reduce below visible non-text contrast needs.", existingV002),
  valueToken("focus.outline-offset", "--sk-focus-outline-offset", "dimension", "2px", "borders-elevation", "Visible focus outline offset.", "Separating focus evidence from control edges.", "Do not clip the outline inside overflow containers.", existingV002),

  valueToken("motion.duration-instant", "--sk-motion-duration-instant", "duration", "80ms", "motion", "Near-immediate state feedback.", "Pressed and focus feedback that must feel direct.", "Do not animate content entry with this role.", "Master section 6.8 instant range"),
  valueToken("motion.duration-fast", "--sk-motion-duration-fast", "duration", "140ms", "motion", "Fast C1 focus and disclosure timing.", "Focus, hover, and disclosure indicators.", "Do not use for looping progress.", c1Motion),
  valueToken("motion.duration-standard", "--sk-motion-duration-standard", "duration", "180ms", "motion", "Default state transition duration.", "Ordinary control and status transitions.", "Do not delay access to content.", existingV002),
  valueToken("motion.duration-slow", "--sk-motion-duration-slow", "duration", "240ms", "motion", "Slow end of the approved non-decorative envelope.", "Rare emphasized state transitions.", "Do not promote the C1-only 640ms progress or assist study.", "Master section 6.8 slow range; C1 640ms candidate explicitly deferred"),
  valueToken("motion.ease-standard", "--sk-motion-easing-standard", "easing", "ease-out", "motion", "Default state easing.", "Routine UI transitions.", "Do not use spring or bounce motion.", existingV002),
  valueToken("motion.ease-enter", "--sk-motion-easing-enter", "easing", "cubic-bezier(0.2, 0.8, 0.2, 1)", "motion", "Restrained enter easing from C1.", "Short state and disclosure entry.", "Do not gate content visibility on animation.", c1Motion),
  aliasToken("motion.ease-exit", "--sk-motion-easing-exit", "easing", "motion.ease-enter", "motion", "Matched exit easing for continuity.", "Short state exits where content remains accessible.", "Do not animate layout properties.", c1Motion),
  aliasToken("motion.ease-emphasized", "--sk-motion-easing-emphasized", "easing", "motion.ease-enter", "motion", "Emphasized C1 easing without bounce.", "Rare high-salience state feedback.", "Do not use as a global reveal system.", c1Motion),
  aliasToken("motion.distance-xs", "--sk-motion-distance-xs", "dimension", "space.1", "motion", "Smallest motion travel.", "Press and focus feedback where travel is necessary.", "Do not move critical content to communicate completion.", "Master section 6.8 distance range"),
  aliasToken("motion.distance-md", "--sk-motion-distance-md", "dimension", "space.4", "motion", "Maximum standard motion travel.", "Rare emphasized state continuity.", "Do not use for parallax or page choreography.", "Master section 6.8 distance range"),

  valueToken("compat.duration-loading", "--sk-motion-duration-loading", "duration", "720ms", "compatibility", "Deprecated v0.0.2 loading-loop duration.", "Existing loading indicators during the one-release compatibility window.", "Do not use for new motion; S6 will define loading behavior.", existingV002, { deprecated: true, replacement: "motion.duration-slow" }),
  valueToken("compat.easing-linear", "--sk-motion-easing-linear", "easing", "linear", "compatibility", "Deprecated v0.0.2 loading-loop easing.", "Existing loading indicators during the one-release compatibility window.", "Do not use for new transitions.", existingV002, { deprecated: true, replacement: "motion.ease-standard" }),
  valueToken("compat.badge-min", "--sk-size-badge-min", "dimension", "1.5rem", "compatibility", "Deprecated v0.0.2 badge minimum size.", "Existing Badge primitive compatibility.", "Do not use for new control sizing.", existingV002, { deprecated: true, replacement: "control-height.sm" }),
] as const satisfies readonly AuthoredToken[];

const colorCollectionEntries = [
  entry("bgBase", "color.canvas", "Page background", "--sk-color-bg-base"),
  entry("bgSurface", "color.surface", "Cards, panels, and raised surfaces", "--sk-color-bg-surface"),
  entry("inkPrimary", "color.ink-primary", "Primary text"),
  entry("inkMuted", "color.ink-muted", "Secondary text"),
  entry("borderControl", "color.border-default", "Control and input boundaries requiring non-text contrast", "--sk-color-border-control"),
  entry("brandPrimary", "color.brand-primary", "Primary action and brand anchor"),
  entry("accent", "color.accent-seal", "Sparse seal, verified, and emphasis accents", "--sk-color-accent"),
  entry("success", "color.success-fg", "Positive completion and verified states", "--sk-color-success"),
  entry("warning", "color.warning-fg", "Attention states", "--sk-color-warning"),
  entry("danger", "color.danger-fg", "Errors and destructive states", "--sk-color-danger"),
  entry("info", "color.info-fg", "Neutral informational states", "--sk-color-info"),
] as const satisfies readonly CompatibilityEntry[];

export const compatibilityCollections = [
  {
    exportName: "colorTokens", keyTypeName: "TokenRole", definitionTypeName: "ColorTokenDefinition", definitionForTypeName: "ColorTokenDefinitionFor", definitionsTypeName: "ColorTokenDefinitions", discriminator: "role", cssVariableTemplate: "--sk-${string}",
    entries: colorCollectionEntries,
  },
  {
    exportName: "spacingTokens", keyTypeName: "SpacingTokenStep", definitionTypeName: "SpacingTokenDefinition", definitionForTypeName: "SpacingTokenDefinitionFor", definitionsTypeName: "SpacingTokenDefinitions", discriminator: "step", cssVariableTemplate: "--sk-space-${string}",
    entries: [
      entry("1", "space.1", "Small inline gaps"),
      entry("2", "space.2", "Control and badge gaps"),
      entry("3", "space.3", "Compact control padding"),
      entry("4", "space.4", "Default control and card spacing"),
      entry("6", "space.6", "Large control and card spacing"),
      entry("8", "space.8", "Section spacing"),
      entry("12", "space.12", "Large section spacing"),
      entry("16", "space.16", "Page-level spacing"),
    ],
  },
  {
    exportName: "radiusTokens", keyTypeName: "RadiusTokenRole", definitionTypeName: "RadiusTokenDefinition", definitionForTypeName: "RadiusTokenDefinitionFor", definitionsTypeName: "RadiusTokenDefinitions", discriminator: "role", cssVariableTemplate: "--sk-radius-${string}",
    entries: [entry("control", "radius.sm", "Buttons, fields, badges, and other controls", "--sk-radius-control"), entry("card", "radius.md", "Grouped information surfaces", "--sk-radius-card")],
  },
  {
    exportName: "motionTokens", keyTypeName: "MotionTokenRole", definitionTypeName: "MotionTokenDefinition", definitionForTypeName: "MotionTokenDefinitionFor", definitionsTypeName: "MotionTokenDefinitions", discriminator: "role", cssVariableTemplate: "--sk-motion-${string}",
    entries: [entry("durationStandard", "motion.duration-standard", "Default state transitions"), entry("durationLoading", "compat.duration-loading", "Looping loading indicators"), entry("easingStandard", "motion.ease-standard", "Default state transition easing"), entry("easingLinear", "compat.easing-linear", "Looping loading indicator easing")],
  },
  {
    exportName: "typographyTokens", keyTypeName: "TypographyTokenRole", definitionTypeName: "TypographyTokenDefinition", definitionForTypeName: "TypographyTokenDefinitionFor", definitionsTypeName: "TypographyTokenDefinitions", discriminator: "role", cssVariableTemplate: "--sk-${string}",
    entries: [
      entry("fontSizeSm", "font-size.sm", "Small helper, badge, and hint text"), entry("fontSizeMd", "font-size.md", "Default control and label text"), entry("fontSizeLg", "font-size.lg", "Large control text"),
      entry("fontWeightSemibold", "font-weight.semibold", "Control labels and important field state text"), entry("fontWeightBold", "font-weight.bold", "Badge and compact status text"),
      entry("lineHeightTight", "line-height.caption", "Compact badge text", "--sk-line-height-tight"), entry("lineHeightControl", "line-height.ui", "Button text", "--sk-line-height-control"),
      entry("lineHeightLabel", "line-height.ui", "Field labels", "--sk-line-height-label"), entry("lineHeightBody", "line-height.body", "Card and descriptive body text"),
    ],
  },
  {
    exportName: "sizeTokens", keyTypeName: "SizeTokenRole", definitionTypeName: "SizeTokenDefinition", definitionForTypeName: "SizeTokenDefinitionFor", definitionsTypeName: "SizeTokenDefinitions", discriminator: "role", cssVariableTemplate: "--sk-${string}",
    entries: [entry("controlSm", "control-height.sm", "Small controls", "--sk-size-control-sm"), entry("controlMd", "control-height.md", "Default controls", "--sk-size-control-md"), entry("controlLg", "control-height.lg", "Large controls", "--sk-size-control-lg"), entry("badgeMin", "compat.badge-min", "Minimum badge height")],
  },
  {
    exportName: "elevationTokens", keyTypeName: "ElevationTokenRole", definitionTypeName: "ElevationTokenDefinition", definitionForTypeName: "ElevationTokenDefinitionFor", definitionsTypeName: "ElevationTokenDefinitions", discriminator: "role", cssVariableTemplate: "--sk-${string}",
    entries: [entry("card", "shadow.card", "Subtle grouped-surface elevation", "--sk-elevation-card")],
  },
  {
    exportName: "focusTokens", keyTypeName: "FocusTokenRole", definitionTypeName: "FocusTokenDefinition", definitionForTypeName: "FocusTokenDefinitionFor", definitionsTypeName: "FocusTokenDefinitions", discriminator: "role", cssVariableTemplate: "--sk-${string}",
    entries: [entry("outlineWidth", "focus.outline-width", "Visible focus outline width"), entry("outlineOffset", "focus.outline-offset", "Visible focus outline offset")],
  },
] as const satisfies readonly CompatibilityCollection[];

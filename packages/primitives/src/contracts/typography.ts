import type { PrimitiveContract } from "./types.js";

export const typographyPrimitiveSpecs = [
  {
    name: "Text",
    role: "Semantic presentation roles",
    purpose: "Applies evidence-backed display, heading, body, lead, caption, eyebrow, data, or mono presentation without choosing document semantics for the consumer.",
    whenToUse: ["Consistent type hierarchy", "Long compliance prose", "IDs, dates, amounts, versions, and checksums", "Restrained source labels"],
    whenNotToUse: ["As arbitrary font-size utilities", "To replace heading semantics", "To apply display type to dense controls or tables"],
    semanticElement: "Choose h1-h6, p, span, data, code, time, or another correct element; the class changes presentation only.",
    classHooks: [".sk-text", ".sk-text-display", ".sk-text-heading", ".sk-text-body", ".sk-text-lead", ".sk-text-caption", ".sk-text-eyebrow", ".sk-text-data", ".sk-text-mono"],
    anatomy: [{ name: "text", purpose: "Consumer-authored content on the correct semantic element." }],
    variants: [{ name: "role", values: ["display", "heading", "body", "lead", "caption", "eyebrow", "data", "mono"], defaultValue: "body" }],
    tones: [], sizes: [], requiredStates: ["default", "long-content"],
    stateEvidence: [
      { state: "default", attributes: [], selectors: [".sk-text"], notes: "Presentation roles use generated S3 typography tokens." },
      { state: "long-content", attributes: ["lang"], selectors: [".sk-text"], notes: "Long Indian compliance names and identifiers wrap without clipping." },
    ],
    keyboardObligations: ["Text roles add no keyboard behavior."],
    screenReaderObligations: ["Preserve semantic headings and data relationships", "Do not communicate hierarchy through visual size alone"],
    contentRules: ["Use display once per dominant orientation region", "Keep eyebrow labels restrained and meaningful", "Use data or mono for operational values, not paragraphs", "Keep body measure near 65–75 characters in consumer composition"],
    motion: { behavior: "Text roles add no animation or transition.", reducedMotion: "No override is needed because the primitive adds no motion." },
    forcedColorsBehavior: ["Text inherits system-adjusted foreground unless a semantic parent supplies another system color."],
    mobileBehavior: ["Long words and identifiers wrap", "Display and heading roles remain within the available inline size"],
    examples: [
      { title: "Semantic heading", className: "sk-text sk-text-heading", markup: "<h2 class=\"sk-text sk-text-heading\">Source evidence</h2>" },
      { title: "Operational data", className: "sk-text sk-text-data", markup: "<data class=\"sk-text sk-text-data\" value=\"1234567\">₹12,34,567</data>" },
    ],
    galleryCoverage: ["All eight roles", "Long compliance name", "GSTIN/date/amount/checksum examples"],
    consumerResponsibilities: ["Choose semantic HTML", "Provide correct heading order", "Avoid display roles in dense controls", "Apply lang where pronunciation or script requires it"],
    accessibility: ["semantic-html-preserved", "long-content-safe", "not-size-utility"],
  },
] as const satisfies readonly PrimitiveContract[];

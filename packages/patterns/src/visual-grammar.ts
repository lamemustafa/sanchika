export const productVisualGrammar = Object.freeze({
  ledgerRail: Object.freeze({
    principle: "A border-and-spacing rail communicates sequence, lineage, or grouped work without decorative repetition.",
    className: "sk-pattern-grammar--ledger-rail",
  }),
  fileTabLabel: Object.freeze({
    principle: "A text label names one real record or artifact type without pretending to be a browser tab or control.",
    className: "sk-pattern-grammar--file-tab-label",
  }),
  provenanceStrip: Object.freeze({
    principle: "A compact row keeps source, release or reference, checked time, status, reviewer, and limitation inspectable.",
    className: "sk-pattern-grammar--provenance-strip",
  }),
  evidenceAperture: Object.freeze({
    principle: "Selected work and source evidence remain adjacent in logical review order, then stack deliberately on mobile.",
    className: "sk-pattern-grammar--evidence-aperture",
  }),
  custodyLine: Object.freeze({
    principle: "Every step names custodian, location, crossing, never-crosses facts, source, and resulting local artifact.",
    className: "sk-pattern-grammar--custody-line",
  }),
  quietVerifiedSeal: Object.freeze({
    principle: "A restrained text treatment names source or verifier and checked time without resembling government approval.",
    className: "sk-pattern-grammar--quiet-verified-seal",
  }),
} as const);

export type ProductVisualGrammarName = keyof typeof productVisualGrammar;

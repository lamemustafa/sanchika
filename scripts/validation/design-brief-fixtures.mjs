#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./build-artifacts.mjs";

const root = fileURLToPath(new URL("../..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm design:brief:fixtures", packageNames: ["patterns"] });
const { validateDesignBrief } = await import("../../packages/patterns/dist/index.js");

const complyeazeTrustBrief = {
  id: "complyeaze-public-story",
  consumerMode: "complyeaze/core",
  register: "brand",
  surface: "ComplyEaze public story",
  userJob: "Understand what ComplyEaze does before entering any workspace flow.",
  primaryDecision: "Is this the right compliance trust layer to explore?",
  dataSensitivity: ["public-copy"],
  trustBoundaries: ["Public copy only", "No auth, tenant, document, or workspace behavior"],
  evidenceRequirements: ["Published package API", "Documented design guidance"],
  selectedPatterns: [{ name: "ProductFamilyRouter", states: ["default"] }],
  claims: [{ claim: "Public story only", evidence: "No tenant or document data is required for the surface" }],
  nonGoals: ["No auth flow", "No tenant data", "No document handling", "No workspace behavior"],
  verificationGates: ["token-only-styling", "wcag-22-aa", "non-color-state", "desktop-render", "mobile-render"],
};

const axalTrustBrief = {
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

const packTrustBrief = {
  id: "pack-local-download-proof",
  consumerMode: "pack/local-utility",
  register: "product",
  surface: "Pack local download proof",
  userJob: "Confirm what stays local before generating a proof artifact.",
  primaryDecision: "Can the user continue without uploading documents or handing off credentials?",
  dataSensitivity: ["credential-boundary", "document-or-file", "local-artifact"],
  trustBoundaries: ["No upload", "No credential handoff", "No telemetry"],
  evidenceRequirements: ["Source visibility", "Local artifact proof", "User-controlled export"],
  selectedPatterns: [{ name: "TrustBoundary", states: ["local-only"] }],
  claims: [{ claim: "Runs locally", evidence: "Boundary copy and source visibility are present before the action" }],
  nonGoals: ["No portal automation", "No backend upload"],
  verificationGates: ["token-only-styling", "wcag-22-aa", "keyboard-focus", "non-color-state", "desktop-render", "mobile-render"],
};

const validCases = [
  {
    name: "ComplyEaze public story",
    brief: {
      id: "complyeaze-public-story-design",
      trustBrief: complyeazeTrustBrief,
      register: "brand",
      surface: "ComplyEaze public story",
      firstViewportSignal: "ComplyEaze as the calm compliance trust layer for public education and product-family routing",
      emotionalIntent: "Calm authority with enough specificity that visitors know what exists now.",
      narrativeArc: ["Name the compliance pressure", "Show the product-family route", "Make the next safe action clear"],
      informationPriority: ["ComplyEaze umbrella promise", "Axal, Pack, and Tools roles", "Evidence-backed current status"],
      responsiveConstraints: ["Mobile must show ComplyEaze and the next route before scroll", "Desktop must reveal product-family context without card overload"],
      interactionStates: ["focus", "hover"],
      visualQualityGates: ["not-generic-saas", "first-viewport-product-signal", "responsive-fit", "keyboardable", "performance-budget"],
      verificationEvidence: ["Desktop render screenshot", "Mobile render screenshot", "Public copy source review"],
      nonGoals: ["No auth flow", "No tenant data", "No document handling", "No workspace behavior"],
    },
  },
  {
    name: "Axal review workbench",
    brief: {
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
      verificationEvidence: ["Desktop render screenshot", "Mobile render screenshot", "Keyboard focus walkthrough", "Reduced motion check"],
      nonGoals: ["No filing submission", "No compliance judgment"],
    },
  },
  {
    name: "Pack local proof",
    brief: {
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
    },
  },
];

const invalidCases = [
  {
    name: "Missing embedded TrustBrief",
    patch: { trustBrief: undefined },
    expectedReason: "Design briefs must embed a TrustBrief.",
  },
  {
    name: "Surface mismatch",
    patch: { surface: "Different surface" },
    expectedReason: "Design brief surface must match the embedded TrustBrief surface.",
  },
  {
    name: "Too few narrative beats",
    patch: { narrativeArc: ["Name the pressure", "Show the route"] },
    expectedReason: "Design briefs must define at least three narrative beats.",
  },
  {
    name: "Missing generic SaaS guard",
    patch: { visualQualityGates: ["first-viewport-product-signal", "responsive-fit", "keyboardable"] },
    expectedReason: "Design briefs must include not-generic-saas quality review.",
  },
  {
    name: "Unknown quality gate",
    patch: { visualQualityGates: ["not-generic-saas", "first-viewport-product-signal", "invented-polish"] },
    expectedReason: "Unknown visual quality gate invented-polish.",
  },
  {
    name: "Unknown interaction state",
    patch: { interactionStates: ["focus", "dragged"] },
    expectedReason: "Unknown interaction state dragged.",
  },
  {
    name: "Missing mobile constraint",
    patch: { responsiveConstraints: ["Desktop must support dense scanning without overflow"] },
    expectedReason: "Design briefs must define mobile constraints.",
  },
  {
    name: "Missing mobile evidence",
    patch: { verificationEvidence: ["Desktop render screenshot"] },
    expectedReason: "Design briefs must require mobile render evidence.",
  },
  {
    name: "Product missing focus state",
    patch: { register: "product", interactionStates: ["hover", "selected"] },
    expectedReason: "Product design briefs must include focus state coverage.",
  },
  {
    name: "Pack missing credential handoff non-goal",
    base: validCases[2].brief,
    patch: { nonGoals: ["No upload", "No credential storage", "No telemetry"] },
    expectedReason: "Pack design briefs must keep no credential handoff out of scope.",
  },
  {
    name: "ComplyEaze missing first viewport name",
    patch: { firstViewportSignal: "Calm compliance trust layer with product-family routing" },
    expectedReason: "ComplyEaze core design briefs must name ComplyEaze in the first viewport signal.",
  },
];

const failures = [];

for (const { name, brief } of validCases) {
  const issues = validateDesignBrief(brief);
  if (issues.length > 0) {
    failures.push(`${name} should pass, got: ${formatIssues(issues)}`);
  }
}

for (const { name, base = validCases[0].brief, patch, expectedReason } of invalidCases) {
  const issues = validateDesignBrief({ ...base, ...patch });
  if (!issues.some((issue) => issue.reason === expectedReason)) {
    failures.push(`${name} should include "${expectedReason}", got: ${formatIssues(issues)}`);
  }
}

if (failures.length > 0) {
  console.error("Design brief fixture checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Design brief fixture checks passed (${validCases.length + invalidCases.length} cases).`);

function formatIssues(issues) {
  return issues.map((issue) => `${issue.field}: ${issue.reason}`).join("; ");
}

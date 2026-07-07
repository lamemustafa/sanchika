#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./build-artifacts.mjs";

const root = fileURLToPath(new URL("../..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm evidence:loop:fixtures", packageNames: ["patterns"] });
const { validateEvidenceLoop } = await import("../../packages/patterns/dist/index.js");

const trustBrief = {
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

const designBrief = {
  id: "complyeaze-public-story-design",
  trustBrief,
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
};

const readyLoop = {
  id: "complyeaze-public-story-loop",
  trustBrief,
  designBrief,
  renderEvidence: [
    {
      type: "desktop-screenshot",
      artifact: "artifacts/complyeaze-public-story-desktop.png",
      finding: "Desktop first viewport names ComplyEaze and exposes product-family context.",
    },
    {
      type: "mobile-screenshot",
      artifact: "artifacts/complyeaze-public-story-mobile.png",
      finding: "Mobile first viewport names ComplyEaze before product routing.",
    },
    {
      type: "accessibility-note",
      artifact: "artifacts/complyeaze-public-story-a11y.md",
      finding: "Accessibility review covered focus order, link names, and non-color-only status copy.",
    },
  ],
  adoptionEvidence: {
    consumerRepo: "lamemustafa/complyeaze",
    consumerSurface: "ComplyEaze public story",
    status: "verified",
    changedFiles: ["src/app/(main)/page.tsx", "src/app/(main)/page.module.css"],
    verificationRun: "pnpm lint:check && pnpm exec tsc --noEmit",
    rollbackPlan: "Revert the consumer PR or restore the previous public page files.",
  },
  decision: "ready-for-consumer-pr",
  residualRisks: ["Visual polish remains subjective and should be re-reviewed after real traffic or customer feedback."],
  nextActions: ["Open the consumer PR with this evidence loop in the PR body."],
};

const invalidCases = [
  {
    name: "Missing mobile render evidence",
    patch: { renderEvidence: readyLoop.renderEvidence.filter((evidence) => evidence.type !== "mobile-screenshot") },
    expectedReason: "Evidence loops must include mobile render evidence.",
  },
  {
    name: "Unknown render evidence type",
    patch: { renderEvidence: [{ ...readyLoop.renderEvidence[0], type: "figma-frame" }, ...readyLoop.renderEvidence.slice(1)] },
    expectedReason: "Unknown render evidence type figma-frame.",
  },
  {
    name: "Surface mismatch",
    patch: {
      adoptionEvidence: {
        ...readyLoop.adoptionEvidence,
        consumerSurface: "Different public story",
      },
    },
    expectedReason: "Adoption evidence surface must match the TrustBrief surface.",
  },
  {
    name: "Ready without verified adoption",
    patch: {
      adoptionEvidence: {
        ...readyLoop.adoptionEvidence,
        status: "implemented",
      },
    },
    expectedReason: "Ready evidence loops require verified adoption evidence.",
  },
  {
    name: "Ready with missing residual risk",
    patch: { residualRisks: ["Missing mobile browser review remains unresolved."] },
    expectedReason: "Ready evidence loops cannot carry blocked, unknown, or missing residual risks.",
  },
];

const failures = [];
const readyIssues = validateEvidenceLoop(readyLoop);
if (readyIssues.length > 0) {
  failures.push(`Ready loop should pass, got: ${formatIssues(readyIssues)}`);
}

for (const { name, patch, expectedReason } of invalidCases) {
  const issues = validateEvidenceLoop({ ...readyLoop, ...patch });
  if (!issues.some((issue) => issue.reason === expectedReason)) {
    failures.push(`${name} should include "${expectedReason}", got: ${formatIssues(issues)}`);
  }
}

if (failures.length > 0) {
  console.error("Evidence loop fixture checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Evidence loop fixture checks passed (${invalidCases.length + 1} cases).`);

function formatIssues(issues) {
  return issues.map((issue) => `${issue.field}: ${issue.reason}`).join("; ");
}

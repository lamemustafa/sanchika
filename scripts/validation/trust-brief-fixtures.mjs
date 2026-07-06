#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./build-artifacts.mjs";

const root = fileURLToPath(new URL("../..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm trust:brief:fixtures", packageNames: ["patterns"] });
const { validateTrustBrief } = await import("../../packages/patterns/dist/index.js");

const validCases = [
  {
    name: "ComplyEaze public story",
    brief: {
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
      verificationGates: ["token-only-styling", "wcag-22-aa", "non-color-state"],
    },
  },
  {
    name: "Axal review workbench",
    brief: {
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
      verificationGates: ["token-only-styling", "wcag-22-aa", "keyboard-focus", "non-color-state"],
    },
  },
  {
    name: "Pack local proof",
    brief: {
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
      verificationGates: ["token-only-styling", "wcag-22-aa", "keyboard-focus", "non-color-state"],
    },
  },
  {
    name: "Tools local artifact",
    brief: {
      id: "tools-local-artifact",
      consumerMode: "tools/local-artifact",
      register: "product",
      surface: "Tools local artifact export",
      userJob: "Generate a local compliance helper artifact from public inputs.",
      primaryDecision: "Can the artifact be exported with source and provenance visible?",
      dataSensitivity: ["public-copy", "local-artifact"],
      trustBoundaries: ["Browser-local utility", "No account or backend upload"],
      evidenceRequirements: ["Source evidence", "Provenance timestamp", "User-controlled export"],
      selectedPatterns: [{ name: "EvidencePanel", states: ["blocked"] }],
      claims: [{ claim: "Export is source-backed", evidence: "Source and provenance fields remain visible before export" }],
      nonGoals: ["No generic route scaffold without a product spec"],
      verificationGates: ["token-only-styling", "wcag-22-aa", "keyboard-focus", "non-color-state"],
    },
  },
];

const invalidCases = [
  {
    name: "Pack missing telemetry boundary",
    patch: {
      consumerMode: "pack/local-utility",
      trustBoundaries: ["No upload", "No credential handoff"],
    },
    expectedReason: "Pack trust briefs must state no telemetry.",
  },
  {
    name: "Axal missing human review evidence",
    patch: {
      consumerMode: "axal/workspace",
      evidenceRequirements: ["Source evidence", "Review timestamp"],
    },
    expectedReason: "Axal workspace briefs must require human evidence.",
  },
  {
    name: "ComplyEaze core missing document exclusion",
    patch: {
      consumerMode: "complyeaze/core",
      dataSensitivity: ["public-copy"],
      trustBoundaries: ["Public copy only", "No auth, tenant, or workspace behavior"],
      nonGoals: ["No auth flow", "No tenant data", "No workspace behavior"],
    },
    expectedReason: "ComplyEaze core briefs must exclude document scope.",
  },
  {
    name: "Tools missing provenance evidence",
    patch: {
      consumerMode: "tools/local-artifact",
      evidenceRequirements: ["Source evidence", "User-controlled export"],
      nonGoals: ["No generic route scaffold without a product spec"],
    },
    expectedReason: "Tools local-artifact briefs must require provenance evidence.",
  },
  {
    name: "Tools missing product spec guard",
    patch: {
      consumerMode: "tools/local-artifact",
      evidenceRequirements: ["Source evidence", "Provenance timestamp", "User-controlled export"],
      nonGoals: ["No backend upload"],
    },
    expectedReason: "Tools local-artifact briefs must require a product spec before generic route or tool scaffolds.",
  },
  {
    name: "Product missing keyboard verification",
    patch: {
      register: "product",
      verificationGates: ["token-only-styling", "wcag-22-aa", "non-color-state"],
    },
    expectedReason: "Product surfaces must verify keyboard focus.",
  },
  {
    name: "Claim missing evidence",
    patch: {
      claims: [{ claim: "Ready for review", evidence: "" }],
    },
    expectedReason: "Claims must include both visible copy and evidence.",
  },
  {
    name: "Pattern state mismatch",
    patch: {
      selectedPatterns: [{ name: "TrustBoundary", states: ["reviewed"] }],
    },
    expectedReason: "TrustBoundary does not define state reviewed.",
  },
];

const failures = [];

for (const { name, brief } of validCases) {
  const issues = validateTrustBrief(brief);
  if (issues.length > 0) {
    failures.push(`${name} should pass, got: ${formatIssues(issues)}`);
  }
}

for (const { name, patch, expectedReason } of invalidCases) {
  const issues = validateTrustBrief({ ...validCases[0].brief, ...patch });
  if (!issues.some((issue) => issue.reason === expectedReason)) {
    failures.push(`${name} should include "${expectedReason}", got: ${formatIssues(issues)}`);
  }
}

if (failures.length > 0) {
  console.error("Trust brief fixture checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Trust brief fixture checks passed (${validCases.length + invalidCases.length} cases).`);

function formatIssues(issues) {
  return issues.map((issue) => `${issue.field}: ${issue.reason}`).join("; ");
}

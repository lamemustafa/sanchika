const requiredTrustBriefFragments = [
  "TrustBrief",
  "TrustBriefValidationIssue",
  "validateTrustBrief",
  "primaryDecision",
  "trustBoundaries",
  "evidenceRequirements",
  "verificationGates",
  "Pack trust briefs must state",
  "Axal workspace briefs must require",
  "ComplyEaze core briefs must",
  "Tools local-artifact briefs must",
];

const requiredTrustBriefDocs = [
  "Trust Brief Contract",
  "`TrustBrief`",
  "`validateTrustBrief`",
  "primary decision",
  "trust boundaries",
  "evidence requirements",
  "verification gates",
  "Pack trust briefs",
  "Axal workspace briefs",
  "ComplyEaze core briefs",
  "Tools local-artifact briefs",
];

export function validateTrustBriefContracts({ patternSource, patternDocs, aiNativeToolingDocs, fail }) {
  for (const fragment of requiredTrustBriefFragments) {
    if (!patternSource.includes(fragment)) {
      fail(`pattern package must include trust brief fragment ${fragment}`);
    }
  }

  for (const fragment of requiredTrustBriefDocs) {
    if (!patternDocs.includes(fragment) && !aiNativeToolingDocs.includes(fragment)) {
      fail(`trust brief docs must include ${fragment}`);
    }
  }
}

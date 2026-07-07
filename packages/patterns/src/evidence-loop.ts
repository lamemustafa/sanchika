import type {
  DesignBrief,
  DesignBriefValidationIssue,
  TrustBrief,
  TrustBriefValidationIssue,
} from "./index";

export type EvidenceLoopRenderEvidenceType =
  | "desktop-screenshot"
  | "mobile-screenshot"
  | "html-snapshot"
  | "accessibility-note"
  | "manual-review-note";

export type EvidenceLoopRenderEvidence = {
  type: EvidenceLoopRenderEvidenceType;
  artifact: string;
  finding: string;
};

export type EvidenceLoopAdoptionStatus =
  | "proposed"
  | "implemented"
  | "verified"
  | "blocked"
  | "deferred";

export type EvidenceLoopAdoptionEvidence = {
  consumerRepo: string;
  consumerSurface: string;
  status: EvidenceLoopAdoptionStatus;
  changedFiles: readonly string[];
  verificationRun: string;
  rollbackPlan: string;
};

export type EvidenceLoopDecision =
  | "ready-for-consumer-pr"
  | "needs-design-revision"
  | "needs-verification"
  | "blocked-by-boundary";

export type EvidenceLoop = {
  id: string;
  trustBrief: TrustBrief;
  designBrief: DesignBrief;
  renderEvidence: readonly EvidenceLoopRenderEvidence[];
  adoptionEvidence: EvidenceLoopAdoptionEvidence;
  decision: EvidenceLoopDecision;
  residualRisks: readonly string[];
  nextActions: readonly string[];
};

export type EvidenceLoopValidationIssue = {
  field: keyof EvidenceLoop | "renderEvidence.type" | "adoptionEvidence.changedFiles";
  reason: string;
};

type TrustBriefValidator = (brief: TrustBrief) => readonly TrustBriefValidationIssue[];
type DesignBriefValidator = (brief: DesignBrief) => readonly DesignBriefValidationIssue[];

const renderEvidenceTypes = [
  "desktop-screenshot",
  "mobile-screenshot",
  "html-snapshot",
  "accessibility-note",
  "manual-review-note",
] as const satisfies readonly EvidenceLoopRenderEvidenceType[];

const adoptionStatuses = [
  "proposed",
  "implemented",
  "verified",
  "blocked",
  "deferred",
] as const satisfies readonly EvidenceLoopAdoptionStatus[];

const decisions = [
  "ready-for-consumer-pr",
  "needs-design-revision",
  "needs-verification",
  "blocked-by-boundary",
] as const satisfies readonly EvidenceLoopDecision[];

export function validateEvidenceLoopWithValidators(
  loop: EvidenceLoop,
  validateTrustBrief: TrustBriefValidator,
  validateDesignBrief: DesignBriefValidator,
): readonly EvidenceLoopValidationIssue[] {
  const issues: EvidenceLoopValidationIssue[] = [];
  const candidate = (loop ?? {}) as Partial<Record<keyof EvidenceLoop, unknown>>;
  const trustBrief = candidate.trustBrief;
  const designBrief = candidate.designBrief;
  const renderEvidence = arrayValue(candidate.renderEvidence);
  const adoptionEvidence = candidate.adoptionEvidence;
  const decision = stringValue(candidate.decision);
  const residualRisks = stringList(candidate.residualRisks);
  const nextActions = stringList(candidate.nextActions);
  const trustId = recordString(trustBrief, "id");
  const designTrustId = recordString(recordValue(designBrief, "trustBrief"), "id");
  const trustSurface = recordString(trustBrief, "surface");
  const designSurface = recordString(designBrief, "surface");
  const adoptionSurface = recordString(adoptionEvidence, "consumerSurface");
  const adoptionStatus = recordString(adoptionEvidence, "status");
  const changedFiles = stringList(recordValue(adoptionEvidence, "changedFiles"));

  requireText(candidate.id, "id", issues);
  requireList(candidate.renderEvidence, "renderEvidence", issues);
  requireList(candidate.residualRisks, "residualRisks", issues);
  requireList(candidate.nextActions, "nextActions", issues);
  requireStringEntries(candidate.residualRisks, "residualRisks", issues);
  requireStringEntries(candidate.nextActions, "nextActions", issues);

  if (!isRecord(trustBrief)) {
    issues.push({ field: "trustBrief", reason: "Evidence loops must embed a TrustBrief." });
  } else {
    for (const trustIssue of validateTrustBrief(trustBrief as TrustBrief)) {
      issues.push({ field: "trustBrief", reason: `TrustBrief ${trustIssue.field}: ${trustIssue.reason}` });
    }
  }

  if (!isRecord(designBrief)) {
    issues.push({ field: "designBrief", reason: "Evidence loops must embed a DesignBrief." });
  } else {
    for (const designIssue of validateDesignBrief(designBrief as DesignBrief)) {
      issues.push({ field: "designBrief", reason: `DesignBrief ${designIssue.field}: ${designIssue.reason}` });
    }
  }

  if (trustId && designTrustId && trustId !== designTrustId) {
    issues.push({ field: "designBrief", reason: "Evidence loop DesignBrief must embed the same TrustBrief." });
  }
  if (trustSurface && designSurface && trustSurface !== designSurface) {
    issues.push({ field: "designBrief", reason: "Evidence loop TrustBrief and DesignBrief surfaces must match." });
  }

  const coverage = renderEvidenceCoverage(renderEvidence, issues);
  if (!coverage.hasDesktop) issues.push({ field: "renderEvidence", reason: "Evidence loops must include desktop render evidence." });
  if (!coverage.hasMobile) issues.push({ field: "renderEvidence", reason: "Evidence loops must include mobile render evidence." });
  if (!coverage.hasAccessibility) issues.push({ field: "renderEvidence", reason: "Evidence loops must include accessibility review evidence." });

  validateAdoptionEvidence(adoptionEvidence, adoptionStatus, changedFiles, issues);
  if (trustSurface && adoptionSurface && trustSurface !== adoptionSurface) {
    issues.push({ field: "adoptionEvidence", reason: "Adoption evidence surface must match the TrustBrief surface." });
  }

  if (!isOneOf(decision, decisions)) {
    issues.push({ field: "decision", reason: `Unknown evidence loop decision ${decision || "(missing)"}.` });
  }
  if (decision === "ready-for-consumer-pr" && adoptionStatus !== "verified") {
    issues.push({ field: "decision", reason: "Ready evidence loops require verified adoption evidence." });
  }
  if (decision === "ready-for-consumer-pr" && residualRisks.some((risk) => /blocked|unknown|missing/i.test(risk))) {
    issues.push({ field: "residualRisks", reason: "Ready evidence loops cannot carry blocked, unknown, or missing residual risks." });
  }
  if (decision !== "ready-for-consumer-pr" && nextActions.length === 0) {
    issues.push({ field: "nextActions", reason: "Non-ready evidence loops must name next actions." });
  }

  return issues;
}

function renderEvidenceCoverage(
  renderEvidence: readonly unknown[],
  issues: EvidenceLoopValidationIssue[],
) {
  let hasDesktop = false;
  let hasMobile = false;
  let hasAccessibility = false;

  for (const evidence of renderEvidence) {
    const type = recordString(evidence, "type");
    const artifact = recordString(evidence, "artifact");
    const finding = recordString(evidence, "finding");

    if (!isOneOf(type, renderEvidenceTypes)) {
      issues.push({ field: "renderEvidence.type", reason: `Unknown render evidence type ${type || "(missing)"}.` });
    }
    if (!artifact.trim() || !finding.trim()) {
      issues.push({ field: "renderEvidence", reason: "Render evidence must include artifact and finding." });
    }

    hasDesktop ||= type === "desktop-screenshot" || artifact.toLowerCase().includes("desktop");
    hasMobile ||= type === "mobile-screenshot" || artifact.toLowerCase().includes("mobile");
    hasAccessibility ||= type === "accessibility-note" || finding.toLowerCase().includes("accessibility");
  }

  return { hasDesktop, hasMobile, hasAccessibility };
}

function validateAdoptionEvidence(
  adoptionEvidence: unknown,
  adoptionStatus: string,
  changedFiles: readonly string[],
  issues: EvidenceLoopValidationIssue[],
) {
  if (!isRecord(adoptionEvidence)) {
    issues.push({ field: "adoptionEvidence", reason: "Evidence loops must include adoption evidence." });
    return;
  }

  for (const field of ["consumerRepo", "consumerSurface", "verificationRun", "rollbackPlan"] as const) {
    if (!recordString(adoptionEvidence, field).trim()) {
      issues.push({ field: "adoptionEvidence", reason: `Adoption evidence must include ${field}.` });
    }
  }
  if (!isOneOf(adoptionStatus, adoptionStatuses)) {
    issues.push({ field: "adoptionEvidence", reason: `Unknown adoption status ${adoptionStatus || "(missing)"}.` });
  }
  requireStringEntries(recordValue(adoptionEvidence, "changedFiles"), "adoptionEvidence.changedFiles", issues);
  if (changedFiles.length === 0) {
    issues.push({ field: "adoptionEvidence.changedFiles", reason: "Adoption evidence must list changed files." });
  }
}

function requireText(value: unknown, field: keyof EvidenceLoop, issues: EvidenceLoopValidationIssue[]) {
  if (typeof value !== "string" || !value.trim()) {
    issues.push({ field, reason: `${field} must be specific.` });
  }
}

function requireList(value: unknown, field: keyof EvidenceLoop, issues: EvidenceLoopValidationIssue[]) {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push({ field, reason: `${field} must not be empty.` });
  }
}

function requireStringEntries(
  value: unknown,
  field: keyof EvidenceLoop | "adoptionEvidence.changedFiles",
  issues: EvidenceLoopValidationIssue[],
) {
  if (!Array.isArray(value)) return;
  if (value.some((item) => typeof item !== "string" || !item.trim())) {
    issues.push({ field, reason: `${field} entries must be strings.` });
  }
}

function arrayValue(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringList(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function recordValue(value: unknown, key: string): unknown {
  return typeof value === "object" && value !== null && key in value
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

function recordString(value: unknown, key: string): string {
  return stringValue(recordValue(value, key));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOneOf<const Values extends readonly string[]>(value: string, values: Values): value is Values[number] {
  return values.includes(value);
}

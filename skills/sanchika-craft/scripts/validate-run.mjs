#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const phases = [
  "shape",
  "explore",
  "review",
  "owner_gate",
  "build",
  "reconcile",
  "verify",
];
const statuses = ["active", "awaiting_owner", "complete", "stopped"];
const ownerDecisions = ["pending", "approved", "rebrief", "rejected"];
const stopReasons = [
  "no_adoptable_direction",
  "owner_rejected",
  "capability_blocked",
  "verification_failed",
];
const evidenceLabels = [
  "ai-visual-proxy",
  "ai-recognition-proxy",
  "ai-comprehension-proxy",
  "owner-approved",
  "browser-verified",
  "not-user-validated",
];
const visualRoles = ["brand", "craft", "trust", "accessibility"];
const copyRoles = ["practitioner", "developer", "claims", "voice"];
const instructionManifestSchemaVersion = 1;
const controlIds = [
  "current-baseline",
  "generic-ai-saas",
  "off-brief-editorial",
  "fake-authority",
  "mobile-a11y-failure",
];
const controlRequirements = {
  "current-baseline": {
    seededFailures: [],
    relevantRoles: ["brand", "craft", "trust", "accessibility"],
  },
  "generic-ai-saas": {
    seededFailures: [
      "generic-purple-gradient",
      "glass-bento-cliche",
      "unsupported-accuracy-and-speed-claims",
      "generic-ai-copy",
    ],
    relevantRoles: ["brand", "craft", "trust"],
  },
  "off-brief-editorial": {
    seededFailures: [
      "attractive-but-off-brief",
      "serif-theatre",
      "mono-heavy-metadata",
      "text-only-poster-without-product-proof",
    ],
    relevantRoles: ["brand", "craft"],
  },
  "fake-authority": {
    seededFailures: [
      "fake-government-seal",
      "unsupported-ministry-approval",
      "guaranteed-statutory-accuracy",
      "automated-compliance-judgment",
    ],
    relevantRoles: ["brand", "trust"],
  },
  "mobile-a11y-failure": {
    seededFailures: [
      "low-text-contrast",
      "sub-44px-targets",
      "motion-only-status",
      "color-only-state",
      "long-identifier-overflow",
    ],
    relevantRoles: ["craft", "trust", "accessibility"],
  },
};
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonicalCalibrationMetadata = JSON.parse(
  readFileSync(join(scriptDir, "../assets/calibration/metadata.json"), "utf8"),
);

export function validateCraftRun(run, validators, options = {}) {
  const issues = [];
  const add = (field, reason) => issues.push({ field, reason });
  const allowTemplate = options.allowTemplate === true;

  if (!isRecord(run))
    return [{ field: "run", reason: "Craft run must be an object." }];
  if (run.schemaVersion !== 1) add("schemaVersion", "schemaVersion must be 1.");
  if (run.protocolVersion !== "0.1.0")
    add("protocolVersion", "protocolVersion must be 0.1.0.");
  requireText(run.runId, "runId", add);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(run.runId ?? ""))
    add("runId", "runId must be a safe lowercase kebab-case path segment.");
  if (options.expectedRunId && run.runId !== options.expectedRunId)
    add("runId", "runId must match its containing craft/runs directory.");
  if (!allowTemplate && String(run.runId).startsWith("template-"))
    add("runId", "Replace template run ID before use.");
  if (!allowTemplate) {
    const placeholders = findTemplatePlaceholders(run);
    if (placeholders.length)
      add(
        "run",
        `Persisted runs cannot contain template placeholders: ${placeholders.slice(0, 5).join(", ")}.`,
      );
  }
  validateSurface(run.surface, allowTemplate, add);
  validateCapabilities(run.capabilities, add);
  if (!phases.includes(run.phase))
    add("phase", `Unknown phase ${run.phase ?? "(missing)"}.`);
  if (!statuses.includes(run.status))
    add("status", `Unknown status ${run.status ?? "(missing)"}.`);
  if (!Number.isInteger(run.reviewRound) || run.reviewRound < 1)
    add("reviewRound", "reviewRound must be a positive integer.");
  if (!ownerDecisions.includes(run.ownerDecision))
    add(
      "ownerDecision",
      `Unknown owner decision ${run.ownerDecision ?? "(missing)"}.`,
    );
  for (const field of [
    "directions",
    "iterations",
    "reviews",
    "assets",
    "reconciliation",
  ])
    requireArray(run[field], field, add);

  validateEmbeddedContracts(run, validators ?? {}, options, add);
  validateState(run, add);
  const calibrationMetadata =
    options.calibrationMetadata ?? canonicalCalibrationMetadata;
  const calibrationMetadataValid =
    isRecord(calibrationMetadata) &&
    calibrationMetadata.schemaVersion === 1 &&
    Array.isArray(calibrationMetadata.controls) &&
    calibrationMetadata.controls.every(
      (control) =>
        isRecord(control) &&
        Array.isArray(control.relevantRoles) &&
        Array.isArray(control.seededFailures),
    );
  if (!calibrationMetadataValid)
    add(
      "calibrationMetadata.controls",
      "Calibration metadata must use schemaVersion 1 and contain structured controls.",
    );
  validateReviews(
    run,
    calibrationMetadataValid ? calibrationMetadata : { controls: [] },
    add,
  );
  validateDirections(run, options, add);
  validateIterations(run, options, add);
  validateAssets(run, options, add);
  validateEvidenceDigests(run, options, add);

  if (phaseAtLeast(run.phase, "explore") && asArray(run.directions).length === 0)
    add(
      "directions",
      "Explore and later phases require at least one direction.",
    );
  if (
    phaseAtLeast(run.phase, "review") &&
    run.capabilities?.isolatedReview !== true &&
    !(
      run.status === "stopped" &&
      run.stopReason === "capability_blocked"
    )
  )
    add(
      "capabilities.isolatedReview",
      "Review and later phases require isolated review capability.",
    );
  if (phaseAtLeast(run.phase, "owner_gate")) validateOwnerGate(run, add);
  if (
    run.status === "complete" &&
    run.evidenceLoop?.decision !== "ready-for-consumer-pr"
  )
    add(
      "evidenceLoop.decision",
      "Complete runs require a ready-for-consumer-pr evidence decision.",
    );
  if (
    run.evidenceLoop?.decision === "ready-for-consumer-pr" &&
    run.status !== "complete"
  )
    add(
      "evidenceLoop.decision",
      "ready-for-consumer-pr is reserved for complete, production-approved runs.",
    );
  if (run.status === "complete") {
    if (run.capabilities?.browser !== true)
      add(
        "capabilities.browser",
        "Complete runs require browser capability for production verification.",
      );
    if (
      !isRecord(run.productionApproval) ||
      run.productionApproval.decision !== "approved" ||
      run.productionApproval.approvedBy !== "owner" ||
      !isIsoTimestamp(run.productionApproval.approvedAt)
    )
      add(
        "productionApproval",
        "Complete runs require a distinct timestamped owner production approval.",
      );
    validateProductionReviews(run, add);
    validateProductionEvidence(run, options, add);
  } else if (
    run.productionApproval !== undefined &&
    run.productionApproval !== null
  ) {
    add(
      "productionApproval",
      "Production approval may be recorded only on a complete verify run.",
    );
  }
  return issues;
}

export function validateCraftTransition(previous, next) {
  const issues = [];
  const add = (field, reason) => issues.push({ field, reason });
  for (const field of ["runId", "schemaVersion", "protocolVersion"]) {
    if (previous?.[field] !== next?.[field])
      add(field, `${field} cannot change while resuming a run.`);
  }
  if (!isDeepStrictEqual(previous?.surface, next?.surface))
    add(
      "surface",
      "Run surface and source commit cannot change while resuming.",
    );
  if (previous?.status === "complete")
    add("status", "Complete runs cannot resume.");
  if (
    previous?.status === "stopped" &&
    previous?.stopReason !== "capability_blocked"
  )
    add("status", "Only capability-blocked runs can resume.");
  const from = phases.indexOf(previous?.phase);
  const to = phases.indexOf(next?.phase);
  const rebrief =
    next?.phase === "shape" &&
    next?.ownerDecision === "rebrief" &&
    ["review", "owner_gate"].includes(previous?.phase);
  const capabilityResume =
    previous?.status === "stopped" &&
    previous?.stopReason === "capability_blocked" &&
    previous?.phase === next?.phase;
  const expectedReviewRound = rebrief
    ? (previous?.reviewRound ?? 0) + 1
    : previous?.reviewRound;
  if (next?.reviewRound !== expectedReviewRound)
    add(
      "reviewRound",
      "Review round must remain stable except for a one-step increment during rebrief.",
    );
  if (!rebrief && !capabilityResume && to !== from && to !== from + 1)
    add(
      "phase",
      "Phase transitions must advance one step, rebrief to shape, or resume the same capability-blocked phase.",
    );
  preserveHistoryPrefix(previous?.iterations, next?.iterations, "iterations", add);
  preserveHistoryPrefix(previous?.reviews, next?.reviews, "reviews", add);
  validateAppendedReviewRounds(previous, next, "iterations", add);
  validateAppendedReviewRounds(previous, next, "reviews", add);
  const previousDirectionIds = new Set(
    asArray(previous?.directions).map((direction) => direction?.id),
  );
  if (
    asArray(next?.directions).some(
      (direction) =>
        !previousDirectionIds.has(direction?.id) &&
        direction?.reviewRound !== next?.reviewRound,
    )
  )
    add(
      "directions",
      "New directions must belong to the active review round.",
    );
  if (rebrief)
    preserveHistoryPrefix(
      previous?.directions,
      next?.directions,
      "directions",
      add,
    );
  const historicalDirections = asArray(previous?.directions).filter(
    (direction) => direction.reviewRound < next?.reviewRound,
  );
  if (
    historicalDirections.some(
      (direction, index) =>
        !isDeepStrictEqual(direction, asArray(next?.directions)[index]),
    )
  )
    add(
      "directions",
      "Prior-round directions must remain an unchanged prefix of later snapshots.",
    );
  const reviewedRounds = new Set(
    asArray(previous?.reviews)
      .map((review) => review?.reviewRound)
      .filter(Number.isInteger),
  );
  const reviewedDirectionsChanged = asArray(previous?.directions)
    .filter((direction) => reviewedRounds.has(direction?.reviewRound))
    .some((direction) => {
      const nextDirection = asArray(next?.directions).find(
        (candidate) => candidate?.id === direction?.id,
      );
      return !isDeepStrictEqual(direction, nextDirection);
    });
  if (reviewedDirectionsChanged)
    add(
      "directions",
      "Directions with retained review evidence cannot change or disappear.",
    );
  if (!rebrief) {
    for (const field of ["trustBrief", "designBrief"]) {
      if (!isDeepStrictEqual(previous?.[field], next?.[field]))
        add(
          field,
          `${field} cannot change outside an explicit rebrief transition.`,
        );
    }
  }
  if (
    previous?.phase === "owner_gate" &&
    previous?.status === "awaiting_owner" &&
    !rebrief &&
    !isDeepStrictEqual(previous?.directions, next?.directions)
  )
    add(
      "directions",
      "Directions shown at an awaiting owner gate cannot change before the owner decides.",
    );
  if (capabilityResume) {
    for (const field of ["trustBrief", "designBrief", "directions"]) {
      if (!isDeepStrictEqual(previous?.[field], next?.[field]))
        add(field, `Capability resumes cannot change ${field} acceptance thresholds.`);
    }
  }
  if (previous?.phase === "owner_gate" && next?.phase === "build") {
    const selected = asArray(previous?.directions).find(
      (direction) =>
        direction.id === next?.selectedDirectionId &&
        direction.qualified === true &&
        direction.reviewRound === previous?.reviewRound,
    );
    if (!selected)
      add(
        "selectedDirectionId",
        "Build must select a qualified direction from the immediately preceding owner gate.",
      );
    const current = asArray(next?.directions).find(
      (direction) => direction.id === next?.selectedDirectionId,
    );
    if (!selected || !isDeepStrictEqual(selected, current))
      add(
        "directions",
        "The selected owner-gate direction cannot change while entering build.",
      );
  }
  if (
    phaseAtLeast(previous?.phase, "build") &&
    previous?.ownerDecision === "approved" &&
    previous?.selectedDirectionId !== next?.selectedDirectionId
  )
    add(
      "selectedDirectionId",
      "The owner-selected direction cannot change after production build begins.",
    );
  return issues;
}

export function validateCalibrationPack(directory) {
  const issues = [];
  const add = (field, reason) => issues.push({ field, reason });
  const metadataPath = join(directory, "metadata.json");
  let metadata;
  try {
    metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  } catch {
    return [
      {
        field: "calibration",
        reason: "Calibration metadata.json must be readable JSON.",
      },
    ];
  }
  const controls = Array.isArray(metadata.controls) ? metadata.controls : [];
  if (metadata.schemaVersion !== 1)
    add("calibration.schemaVersion", "Calibration schemaVersion must be 1.");
  if (
    JSON.stringify(controls.map((item) => item.id)) !==
    JSON.stringify(controlIds)
  )
    add(
      "calibration.controls",
      "Calibration controls must use the five canonical IDs in order.",
    );
  const realDirectory = realpathSync(directory);
  let total = statSync(metadataPath).size;
  for (const control of controls) {
    requireText(control.file, `calibration.${control.id}.file`, add);
    if (control.file !== `${control.id}.webp`)
      add(
        `calibration.${control.id}.file`,
        `Calibration control ${control.id} must use its distinct canonical ${control.id}.webp artifact.`,
      );
    if (
      typeof control.file !== "string" ||
      basename(control.file) !== control.file ||
      !control.file.endsWith(".webp")
    )
      add(
        `calibration.${control.id}.file`,
        "Calibration control files must be run-local .webp filenames.",
      );
    if (control.mediaType !== "image/webp")
      add(
        `calibration.${control.id}.mediaType`,
        "Calibration controls must declare image/webp.",
      );
    if (!/^[0-9a-f]{64}$/.test(control.sha256 ?? ""))
      add(
        `calibration.${control.id}.sha256`,
        "Calibration controls must declare a lowercase SHA-256 digest.",
      );
    requireArray(
      control.seededFailures,
      `calibration.${control.id}.seededFailures`,
      add,
    );
    requireArray(
      control.relevantRoles,
      `calibration.${control.id}.relevantRoles`,
      add,
    );
    const roles = asArray(control.relevantRoles);
    const requirement = controlRequirements[control.id];
    if (
      !requirement ||
      !isDeepStrictEqual(
        asArray(control.seededFailures),
        requirement.seededFailures,
      )
    )
      add(
        `calibration.${control.id}.seededFailures`,
        "Calibration controls must retain the protocol's canonical seeded failures.",
      );
    if (
      requirement &&
      !isDeepStrictEqual(roles, requirement.relevantRoles)
    )
      add(
        `calibration.${control.id}.relevantRoles`,
        "Calibration controls must retain the protocol's canonical role coverage.",
      );
    if (
      roles.length === 0 ||
      new Set(roles).size !== roles.length ||
      roles.some((role) => !visualRoles.includes(role))
    )
      add(
        `calibration.${control.id}.relevantRoles`,
        "Calibration controls require unique, allowed visual reviewer roles.",
      );
    if (asArray(control.seededFailures).length > 0 && roles.length === 0)
      add(
        `calibration.${control.id}.relevantRoles`,
        "Every seeded-failure control requires reviewer-role coverage.",
      );
    const file = resolve(directory, control.file ?? "");
    try {
      if (
        !isContainedPath(directory, file) ||
        !isContainedPath(realDirectory, realpathSync(file))
      )
        throw new Error("Calibration control escapes its pack.");
      const bytes = readFileSync(file);
      total += bytes.length;
      if (
        bytes.length < 12 ||
        bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
        bytes.subarray(8, 12).toString("ascii") !== "WEBP"
      )
        add(
          `calibration.${control.id}.mediaType`,
          `${control.file} must contain WebP bytes.`,
        );
      if (sha256(bytes) !== control.sha256)
        add(
          `calibration.${control.id}.sha256`,
          `${control.file} SHA-256 must match calibration metadata.`,
        );
    } catch {
      add(`calibration.${control.id}.file`, `Missing ${control.file}.`);
    }
  }
  const unexpected = readdirSync(directory).filter(
    (file) =>
      file !== "metadata.json" &&
      !controls.some((control) => control.file === file),
  );
  if (unexpected.length)
    add(
      "calibration",
      `Unexpected calibration files: ${unexpected.join(", ")}.`,
    );
  if (total > 300_000)
    add(
      "calibration",
      `Calibration pack is ${total} bytes; maximum is 300000.`,
    );
  return issues;
}

function validateEmbeddedContracts(run, validators, options, add) {
  for (const issue of validators.validateTrustBrief?.(run.trustBrief) ?? [])
    add(`trustBrief.${issue.field}`, issue.reason);
  for (const issue of validators.validateDesignBrief?.(run.designBrief) ?? [])
    add(`designBrief.${issue.field}`, issue.reason);
  for (const issue of validators.validateEvidenceLoop?.(run.evidenceLoop) ?? [])
    add(`evidenceLoop.${issue.field}`, issue.reason);
  const route = run.surface?.route;
  if (route && run.trustBrief?.surface !== route)
    add("trustBrief.surface", "TrustBrief surface must match run route.");
  if (!isDeepStrictEqual(run.designBrief, run.evidenceLoop?.designBrief))
    add(
      "evidenceLoop.designBrief",
      "EvidenceLoop must embed the current DesignBrief.",
    );
  if (!isDeepStrictEqual(run.trustBrief, run.evidenceLoop?.trustBrief))
    add(
      "evidenceLoop.trustBrief",
      "EvidenceLoop must embed the current TrustBrief.",
    );
  if (!isDeepStrictEqual(run.trustBrief, run.designBrief?.trustBrief))
    add("designBrief.trustBrief", "DesignBrief must embed the current TrustBrief.");
  if (!options.allowTemplate) {
    const renderArtifacts = asArray(run.evidenceLoop?.renderEvidence)
      .map((evidence) => evidence?.artifact)
      .filter(Boolean);
    validateArtifactReferences(
      run,
      renderArtifacts,
      "evidenceLoop.renderEvidence",
      options,
      add,
    );
  }
  for (const [index, evidence] of asArray(
    run.evidenceLoop?.renderEvidence,
  ).entries()) {
    if (
      evidence?.type !== "mobile-screenshot" ||
      options?.allowTemplate ||
      !options?.repoRoot ||
      typeof evidence.artifact !== "string"
    )
      continue;
    const path = resolve(options.repoRoot, evidence.artifact);
    const dimensions = existsSync(path)
      ? readWebpDimensions(readFileSync(path))
      : null;
    if (
      !dimensions ||
      dimensions.width < 320 ||
      dimensions.width > 430 ||
      dimensions.height < 600
    )
      add(
        `evidenceLoop.renderEvidence.${index}.artifact`,
        "Mobile screenshot evidence must retain a genuine 320-430px viewport WebP render.",
      );
  }
}

function validateState(run, add) {
  if (
    run.status === "awaiting_owner" &&
    (run.phase !== "owner_gate" || run.ownerDecision !== "pending")
  )
    add("status", "awaiting_owner is valid only at a pending owner gate.");
  if (
    run.phase === "owner_gate" &&
    run.status !== "awaiting_owner" &&
    run.status !== "stopped"
  )
    add("status", "owner_gate must await the owner or be stopped.");
  if (
    run.status === "complete" &&
    (run.phase !== "verify" || run.ownerDecision !== "approved")
  )
    add("status", "complete requires verify phase and owner approval.");
  if (run.status === "stopped" && !stopReasons.includes(run.stopReason))
    add("stopReason", "Stopped runs require an allowed stopReason.");
  const requiredStopPhase = {
    no_adoptable_direction: "review",
    owner_rejected: "owner_gate",
    verification_failed: "verify",
  }[run.stopReason];
  if (run.status === "stopped" && requiredStopPhase && run.phase !== requiredStopPhase)
    add(
      "stopReason",
      `${run.stopReason} is valid only in the ${requiredStopPhase} phase.`,
    );
  if (run.status !== "stopped" && run.stopReason !== undefined)
    add("stopReason", "Only stopped runs may carry stopReason.");
  if (
    run.status === "stopped" &&
    run.stopReason === "capability_blocked"
  )
    requireText(
      run.nextAction,
      "nextAction",
      add,
    );
  if (
    run.ownerDecision === "rejected" &&
    (run.phase !== "owner_gate" ||
      run.status !== "stopped" ||
      run.stopReason !== "owner_rejected")
  )
    add(
      "ownerDecision",
      "Rejected owner decisions are valid only at owner_gate and must stop with owner_rejected.",
    );
  if (
    run.stopReason === "owner_rejected" &&
    run.ownerDecision !== "rejected"
  )
    add(
      "ownerDecision",
      "owner_rejected stops require an explicit rejected owner decision.",
    );
  if (
    run.ownerDecision === "approved" &&
    !phaseAtLeast(run.phase, "build") &&
    run.status !== "complete"
  )
    add("ownerDecision", "Owner approval advances to build or later.");
  if (run.ownerDecision === "rebrief" && run.phase !== "shape")
    add("ownerDecision", "rebrief is valid only while returning to shape.");
  if (phaseAtLeast(run.phase, "build") && run.ownerDecision !== "approved")
    add("ownerDecision", "Build and later phases require owner approval.");
  if (run.ownerDecision === "approved") {
    requireText(run.selectedDirectionId, "selectedDirectionId", add);
    const selected = asArray(run.directions).find(
      (direction) =>
        direction.id === run.selectedDirectionId &&
        direction.qualified === true &&
        direction.designBriefId === run.designBrief?.id &&
        direction.reviewRound === run.reviewRound,
    );
    if (!selected)
      add(
        "selectedDirectionId",
        "Owner approval must identify a qualified direction from the current brief and review round.",
      );
  } else if (run.selectedDirectionId !== null && run.selectedDirectionId !== undefined) {
    add("selectedDirectionId", "Only an approved owner decision may select a direction.");
  }
}

function validateDirections(run, options, add) {
  const directions = asArray(run.directions);
  const directionIds = directions.map((direction) => direction?.id);
  if (new Set(directionIds).size !== directionIds.length)
    add("directions", "Direction IDs must be unique within a craft run.");
  const artifactSetsByRound = new Map();
  for (const direction of directions) {
    const key = JSON.stringify([...asArray(direction?.artifactRefs)].sort());
    if (!key || key === "[]" || !Number.isInteger(direction?.reviewRound)) continue;
    const roundArtifactSets = artifactSetsByRound.get(direction.reviewRound) ?? new Set();
    if (roundArtifactSets.has(key))
      add(
        "directions",
        "Directions in the same review round must retain distinct artifact sets.",
      );
    roundArtifactSets.add(key);
    artifactSetsByRound.set(direction.reviewRound, roundArtifactSets);
  }
  for (const [index, direction] of directions.entries()) {
    for (const field of ["id", "designBriefId", "territory"])
      requireText(direction?.[field], `directions.${index}.${field}`, add);
    requireNonEmptyTextArray(
      direction?.artifactRefs,
      `directions.${index}.artifactRefs`,
      add,
    );
    validateArtifactReferences(run, direction?.artifactRefs, `directions.${index}.artifactRefs`, options, add);
    if (!Number.isInteger(direction?.reviewRound) || direction.reviewRound < 1)
      add(`directions.${index}.reviewRound`, "Direction reviewRound must be a positive integer.");
    else if (direction.reviewRound > run.reviewRound)
      add(`directions.${index}.reviewRound`, "Direction reviewRound cannot be in the future.");
    if (direction?.qualified === true) {
      const preference = direction.preference;
      if (
        !isRecord(preference) ||
        preference.reviewers !== 4 ||
        !Number.isInteger(preference.preferredToBaseline) ||
        preference.preferredToBaseline < 3 ||
        preference.preferredToBaseline > 4 ||
        !Number.isInteger(preference.preferredToControl) ||
        preference.preferredToControl < 3
        || preference.preferredToControl > 4
      )
        add(
          `directions.${index}.preference`,
          "Qualified directions require at least 3/4 preference over both the baseline and without-skill control.",
        );
      const visualReviews = qualifiedVisualReviews(run.reviews).filter(
        (review) => review.reviewRound === direction.reviewRound,
      );
      const baselinePreferenceCount = visualReviews.filter(
        (review) =>
          review.directionComparisons?.[direction.id]?.baseline === true,
      ).length;
      const controlPreferenceCount = visualReviews.filter(
        (review) =>
          review.directionComparisons?.[direction.id]?.withoutSkillControl ===
          true,
      ).length;
      if (
        baselinePreferenceCount < 3 ||
        controlPreferenceCount < 3 ||
        preference?.reviewers !== visualReviews.length ||
        preference?.preferredToBaseline !== baselinePreferenceCount ||
        preference?.preferredToControl !== controlPreferenceCount
      )
        add(
          `directions.${index}.preference`,
          "Qualified directions require matching per-review preference over both comparison controls.",
        );
      for (const criterion of ["relevance", "distinctiveness", "craft", "trust"]) {
        const declared = direction.medians?.[criterion];
        const scores = visualReviews
          .map((review) => review.directionScores?.[direction.id]?.[criterion])
          .filter(Number.isFinite);
        const calculated = median(scores);
        if (
          scores.length !== visualRoles.length ||
          !Number.isFinite(declared) ||
          declared < 3 ||
          calculated < 3 ||
          declared !== calculated
        )
          add(
            `directions.${index}.medians.${criterion}`,
            `Qualified directions require a ${criterion} median of at least 3 across calibrated visual reviews.`,
          );
      }
      const unresolvedVetoes = asArray(run.reviews)
        .filter(
          (review) =>
            review.reviewRound === direction.reviewRound &&
            ["trust", "accessibility"].includes(review.role),
        )
        .flatMap((review) => review.vetoes ?? [])
        .filter((veto) =>
          vetoTargetsDirection(
            veto,
            direction.id,
            directions.map((candidate) => candidate.id),
          ),
        );
      if (unresolvedVetoes.length)
        add(
          `directions.${index}.vetoes`,
          "Qualified directions cannot retain a trust or accessibility veto.",
        );
      for (const proxy of ["semanticBlind", "identityBlind"]) {
        const result = direction?.recognition?.[proxy];
        if (
          !result ||
          !Number.isInteger(result.correctMatchers) ||
          result.correctMatchers < 2 ||
          result.correctMatchers > 3 ||
          result.matcherCount !== 3 ||
          result.colorOnly !== false
        )
          add(
            `directions.${index}.recognition.${proxy}`,
            "Qualified directions require 2/3 correct recognition without color-only matching.",
          );
        requireText(
          result?.artifact,
          `directions.${index}.recognition.${proxy}.artifact`,
          add,
        );
        if (
          typeof result?.artifact === "string" &&
          !asArray(direction.artifactRefs).includes(result.artifact)
        )
          add(
            `directions.${index}.recognition.${proxy}.artifact`,
            "Recognition proxy evidence must be retained in the direction artifact set.",
          );
      }
      if (
        direction?.recognition?.semanticBlind?.artifact ===
        direction?.recognition?.identityBlind?.artifact
      )
        add(
          `directions.${index}.recognition`,
          "Semantic-blind and identity-blind recognition require distinct retained artifacts.",
        );
    }
  }
}

function validateReviews(run, calibrationMetadata, add) {
  const reviews = asArray(run.reviews);
  for (const [index, review] of reviews.entries()) {
    requireText(review?.reviewerId, `reviews.${index}.reviewerId`, add);
    if (
      typeof review?.reviewerId === "string" &&
      review.reviewerId !== review.reviewerId.trim()
    )
      add(
        `reviews.${index}.reviewerId`,
        "Reviewer IDs must not contain surrounding whitespace.",
      );
    if (!Number.isInteger(review?.reviewRound) || review.reviewRound < 1)
      add(`reviews.${index}.reviewRound`, "Review reviewRound must be a positive integer.");
    else if (review.reviewRound > run.reviewRound)
      add(`reviews.${index}.reviewRound`, "Review reviewRound cannot be in the future.");
    if (
      ![
        ...visualRoles,
        ...copyRoles,
      ].includes(review?.role)
    )
      add(`reviews.${index}.role`, "Unknown reviewer role.");
    if (review?.producer !== false)
      add(
        `reviews.${index}.producer`,
        "Reviews must explicitly record producer: false.",
      );
    if (review?.calibration?.passed !== true && review?.disqualified !== true)
      add(
        `reviews.${index}.calibration`,
        "Reviewer must pass calibration or be disqualified.",
      );
    if (review?.calibration?.passed === true)
      validateReviewCalibration(
        review,
        index,
        calibrationMetadata,
        add,
      );
    requireArray(
      review?.evidenceLabels,
      `reviews.${index}.evidenceLabels`,
      add,
    );
    for (const label of asArray(review?.evidenceLabels))
      if (!evidenceLabels.includes(label))
        add(
          `reviews.${index}.evidenceLabels`,
          `Unknown evidence label ${label}.`,
        );
    if (
      visualRoles.includes(review?.role) &&
      (!asArray(review?.evidenceLabels).includes("ai-visual-proxy") ||
        !asArray(review?.evidenceLabels).includes("not-user-validated"))
    )
      add(
        `reviews.${index}.evidenceLabels`,
        "Visual reviews require ai-visual-proxy and not-user-validated labels.",
      );
    if (
      copyRoles.includes(review?.role) &&
      (!asArray(review?.evidenceLabels).includes("ai-comprehension-proxy") ||
        !asArray(review?.evidenceLabels).includes("not-user-validated"))
    )
      add(
        `reviews.${index}.evidenceLabels`,
        "Copy reviews require ai-comprehension-proxy and not-user-validated labels.",
      );
    if (copyRoles.includes(review?.role)) {
      if (!Number.isInteger(review?.scores?.comprehension))
        add(
          `reviews.${index}.scores.comprehension`,
          "Copy reviews require an explicit 0-4 comprehension score.",
        );
      requireNonEmptyTextArray(
        review?.findings,
        `reviews.${index}.findings`,
        add,
      );
    }
    requireArray(review?.vetoes, `reviews.${index}.vetoes`, add);
    for (const [vetoIndex, veto] of asArray(review?.vetoes).entries())
      validateVetoAssessment(
        veto,
        `reviews.${index}.vetoes.${vetoIndex}`,
        asArray(run.directions).map((direction) => direction?.id),
        add,
      );
    if (visualRoles.includes(review?.role)) {
      requireNonEmptyTextArray(
        review?.preference,
        `reviews.${index}.preference`,
        add,
      );
      if (!isRecord(review?.directionComparisons))
        add(
          `reviews.${index}.directionComparisons`,
          "Visual reviews require per-direction comparison evidence.",
        );
      const reviewedDirectionIds = asArray(run.directions)
        .filter((direction) => direction.reviewRound === review.reviewRound)
        .map((direction) => direction.id);
      for (const directionId of reviewedDirectionIds)
        if (!Object.hasOwn(review?.directionComparisons ?? {}, directionId))
          add(
            `reviews.${index}.directionComparisons.${directionId}`,
            "Visual reviews require explicit comparisons for every direction in their review round.",
          );
      for (const [directionId, comparison] of Object.entries(
        review?.directionComparisons ?? {},
      )) {
        if (
          !isRecord(comparison) ||
          typeof comparison.baseline !== "boolean" ||
          typeof comparison.withoutSkillControl !== "boolean"
        )
          add(
            `reviews.${index}.directionComparisons.${directionId}`,
            "Direction comparisons require explicit baseline and withoutSkillControl booleans.",
          );
        if (
          (comparison?.baseline === true ||
            comparison?.withoutSkillControl === true) &&
          !asArray(review.preference).includes(directionId)
        )
          add(
            `reviews.${index}.preference`,
            "Preferred control comparisons must agree with the direction ranking.",
          );
      }
      for (const criterion of ["relevance", "distinctiveness", "craft", "trust"])
        if (!Number.isInteger(review?.scores?.[criterion]))
          add(
            `reviews.${index}.scores.${criterion}`,
            "Visual reviews require the complete 0-4 rubric.",
          );
    }
    for (const [criterion, score] of Object.entries(review?.scores ?? {}))
      if (!Number.isInteger(score) || score < 0 || score > 4)
        add(
          `reviews.${index}.scores.${criterion}`,
          "Rubric scores must be integers from 0 to 4.",
        );
    for (const [directionId, scores] of Object.entries(review?.directionScores ?? {}))
      for (const [criterion, score] of Object.entries(scores ?? {}))
        if (!Number.isInteger(score) || score < 0 || score > 4)
          add(
            `reviews.${index}.directionScores.${directionId}.${criterion}`,
            "Direction rubric scores must be integers from 0 to 4.",
          );
    for (const [assessmentIndex, assessment] of asArray(
      review?.revisionAssessments,
    ).entries()) {
      if (
        !Number.isInteger(assessment?.iterationIndex) ||
        assessment.iterationIndex < 0 ||
        assessment.iterationIndex >= asArray(run.iterations).length
      )
        add(
          `reviews.${index}.revisionAssessments.${assessmentIndex}.iterationIndex`,
          "Revision assessment iterationIndex must identify an existing iteration.",
        );
      if (
        !Number.isInteger(assessment?.preferCount) ||
        assessment.preferCount < 0 ||
        assessment.preferCount > 4
      )
        add(
          `reviews.${index}.revisionAssessments.${assessmentIndex}.preferCount`,
          "Revision assessment preferCount must be an integer from 0 to 4.",
        );
      for (const field of ["medianBefore", "medianAfter"])
        if (
          !Number.isFinite(assessment?.[field]) ||
          assessment[field] < 0 ||
          assessment[field] > 4
        )
          add(
            `reviews.${index}.revisionAssessments.${assessmentIndex}.${field}`,
            `${field} must be a number from 0 to 4.`,
          );
      if (!Array.isArray(assessment?.criticalRegressions))
        add(
          `reviews.${index}.revisionAssessments.${assessmentIndex}.criticalRegressions`,
          "Revision assessment criticalRegressions must be an explicit array.",
        );
    }
  }
}

function validateIterations(run, options, add) {
  const iterations = asArray(run.iterations);
  for (const [index, iteration] of iterations.entries()) {
    for (const field of ["failingCriterion", "changeHypothesis"])
      requireText(iteration?.[field], `iterations.${index}.${field}`, add);
    requireArray(iteration?.invariants, `iterations.${index}.invariants`, add);
    requireNonEmptyTextArray(
      iteration?.artifactRefs,
      `iterations.${index}.artifactRefs`,
      add,
    );
    validateArtifactReferences(run, iteration?.artifactRefs, `iterations.${index}.artifactRefs`, options, add);
    if (!Number.isInteger(iteration?.reviewRound) || iteration.reviewRound < 1)
      add(`iterations.${index}.reviewRound`, "Iteration reviewRound must be a positive integer.");
    else if (iteration.reviewRound > run.reviewRound)
      add(`iterations.${index}.reviewRound`, "Iteration reviewRound cannot be in the future.");
    if (!["improved", "not_improved"].includes(iteration?.result))
      add(
        `iterations.${index}.result`,
        "Iteration result must be improved or not_improved.",
      );
    if (iteration?.result === "improved") {
      const assessments = qualifiedVisualReviews(run.reviews)
        .flatMap((review) => asArray(review.revisionAssessments))
        .filter((item) => item.iterationIndex === index);
      const supported = assessments.some(
        (item) =>
          Number.isInteger(item.preferCount) &&
          item.preferCount >= 3 &&
          item.preferCount <= 4 &&
          Number.isFinite(item.medianBefore) &&
          item.medianBefore >= 0 &&
          item.medianBefore <= 4 &&
          Number.isFinite(item.medianAfter) &&
          item.medianAfter >= 0 &&
          item.medianAfter <= 4 &&
          item.medianAfter - item.medianBefore >= 1 &&
          Array.isArray(item.criticalRegressions) &&
          item.criticalRegressions.length === 0,
      );
      if (!supported)
        add(
          `iterations.${index}.result`,
          "Improved requires 3/4 preference, +1 median, and no critical regression evidence.",
        );
    }
  }
  const currentRoundIterations = iterations.filter(
    (iteration) => iteration.reviewRound === run.reviewRound,
  );
  for (const criterion of failedCriteriaInRound(currentRoundIterations)) {
    const failedRoundCount = countFailedRounds(
      iterations,
      criterion,
    );
    if (
      failedRoundCount === 1 &&
      !(run.phase === "shape" && run.ownerDecision === "rebrief")
    )
      add(
        "iterations",
        "Two consecutive non-improving revisions require a rebrief.",
      );
    if (failedRoundCount === 1 && run.stopReason === "no_adoptable_direction")
      add(
        "stopReason",
        "no_adoptable_direction requires the same criterion to fail on a second brief.",
      );
    if (failedRoundCount >= 2 && run.stopReason !== "no_adoptable_direction")
      add(
        "stopReason",
        "A second brief failing the same criterion must stop as no_adoptable_direction.",
      );
  }
  if (run.stopReason === "no_adoptable_direction") {
    const criteria = new Set(
      iterations.map((iteration) => iteration.failingCriterion).filter(Boolean),
    );
    if (![...criteria].some((criterion) => countFailedRounds(iterations, criterion) >= 2))
      add(
        "stopReason",
        "no_adoptable_direction requires the same criterion to fail on two review rounds.",
      );
  }
  const repeatedFailure = [
    ...new Set(iterations.map((iteration) => iteration.failingCriterion).filter(Boolean)),
  ].some((criterion) => countFailedRounds(iterations, criterion) >= 2);
  if (
    repeatedFailure &&
    !(run.status === "stopped" && run.stopReason === "no_adoptable_direction")
  )
    add(
      "stopReason",
      "Any criterion failing on two review rounds requires a terminal no_adoptable_direction stop.",
    );
}

function countFailedRounds(iterations, criterion) {
  const byRound = new Map();
  for (const iteration of iterations) {
    const entries = byRound.get(iteration.reviewRound) ?? [];
    entries.push(iteration);
    byRound.set(iteration.reviewRound, entries);
  }
  return [...byRound.values()].filter((entries) =>
    failedCriteriaInRound(entries).includes(criterion),
  ).length;
}

function failedCriteriaInRound(iterations) {
  const criteria = new Set();
  for (let index = 1; index < iterations.length; index += 1) {
    const previous = iterations[index - 1];
    const current = iterations[index];
    if (
      previous.result === "not_improved" &&
      current.result === "not_improved" &&
      previous.failingCriterion === current.failingCriterion
    )
      criteria.add(current.failingCriterion);
  }
  return [...criteria];
}

function validateOwnerGate(run, add) {
  const passedReviews = qualifiedVisualReviews(run.reviews).filter(
    (review) => review.reviewRound === run.reviewRound,
  );
  const passedRoles = new Set(passedReviews.map((review) => review.role));
  if (
    passedReviews.length !== visualRoles.length ||
    passedRoles.size !== visualRoles.length
  )
    add(
      "reviews",
      "Owner gate requires one calibrated review from each visual role.",
    );
  if (
    new Set(passedReviews.map((review) => canonicalReviewerId(review.reviewerId)))
      .size !== visualRoles.length
  )
    add("reviews", "Owner gate requires four distinct calibrated reviewer identities.");
  if (
    !asArray(run.directions).some(
      (direction) =>
        direction.qualified === true &&
        direction.reviewRound === run.reviewRound &&
        direction.designBriefId === run.designBrief?.id,
    )
  )
    add("directions", "Owner gate requires at least one qualifying direction.");
}

function validateAssets(run, options, add) {
  const assets = asArray(run.assets);
  for (const [index, asset] of assets.entries()) {
    for (const field of ["path", "origin", "licence", "sha256"])
      requireText(asset?.[field], `assets.${index}.${field}`, add);
    if (!["identity", "atmosphere", "evidence"].includes(asset?.job))
      add(
        `assets.${index}.job`,
        "Asset job must be identity, atmosphere, or evidence.",
      );
    if (asset?.retained !== false && options?.repoRoot) {
      const path = resolve(options.repoRoot, asset?.path ?? "");
      const repositoryPath = realpathSync(options.repoRoot);
      if (
        !isContainedPath(options.repoRoot, path) ||
        !existsSync(path) ||
        !statSync(path).isFile() ||
        !isContainedPath(repositoryPath, realpathSync(path))
      ) {
        add(`assets.${index}.path`, "Retained assets must exist inside the repository.");
      } else if (!/^[0-9a-f]{64}$/i.test(asset?.sha256 ?? "")) {
        add(`assets.${index}.sha256`, "Retained asset sha256 must be a 64-character digest.");
      } else if (sha256(readFileSync(path)) !== asset.sha256.toLowerCase()) {
        add(`assets.${index}.sha256`, "Retained asset sha256 must match the retained bytes.");
      }
    }
  }
}

function validateSurface(surface, allowTemplate, add) {
  if (!isRecord(surface)) return add("surface", "Surface must be an object.");
  for (const field of ["repo", "route", "sourceCommit"])
    requireText(surface[field], `surface.${field}`, add);
  if (!allowTemplate && !/^[0-9a-f]{40}$/i.test(surface.sourceCommit ?? ""))
    add(
      "surface.sourceCommit",
      "sourceCommit must be a full 40-character commit SHA.",
    );
}

function validateCapabilities(capabilities, add) {
  if (!isRecord(capabilities))
    return add("capabilities", "Capabilities must be an object.");
  for (const field of ["browser", "isolatedReview", "rasterGeneration"])
    if (typeof capabilities[field] !== "boolean")
      add(`capabilities.${field}`, "Capability flags must be boolean.");
}

function phaseAtLeast(value, minimum) {
  return phases.indexOf(value) >= phases.indexOf(minimum);
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function asArray(value) {
  return Array.isArray(value) ? value : [];
}
function isIsoTimestamp(value) {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}
function readWebpDimensions(bytes) {
  if (
    bytes.length < 30 ||
    bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
    bytes.subarray(8, 12).toString("ascii") !== "WEBP"
  )
    return null;
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = bytes.subarray(offset, offset + 4).toString("ascii");
    const size = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === "VP8X" && data + 10 <= bytes.length)
      return {
        width:
          1 +
          bytes[data + 4] +
          (bytes[data + 5] << 8) +
          (bytes[data + 6] << 16),
        height:
          1 +
          bytes[data + 7] +
          (bytes[data + 8] << 8) +
          (bytes[data + 9] << 16),
      };
    if (
      type === "VP8 " &&
      data + 10 <= bytes.length &&
      bytes[data + 3] === 0x9d &&
      bytes[data + 4] === 0x01 &&
      bytes[data + 5] === 0x2a
    )
      return {
        width: bytes.readUInt16LE(data + 6) & 0x3fff,
        height: bytes.readUInt16LE(data + 8) & 0x3fff,
      };
    if (type === "VP8L" && data + 5 <= bytes.length && bytes[data] === 0x2f) {
      const bits = bytes.readUInt32LE(data + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1,
      };
    }
    offset = data + size + (size % 2);
  }
  return null;
}
function findTemplatePlaceholders(value, path = "run") {
  if (typeof value === "string")
    return value.includes("template-") ? [path] : [];
  if (Array.isArray(value))
    return value.flatMap((item, index) =>
      findTemplatePlaceholders(item, `${path}.${index}`),
    );
  if (isRecord(value))
    return Object.entries(value).flatMap(([key, item]) =>
      findTemplatePlaceholders(item, `${path}.${key}`),
    );
  return [];
}
function isContainedPath(directory, candidate) {
  if (!directory || !candidate) return false;
  const path = relative(directory, candidate);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}
function requireText(value, field, add) {
  if (typeof value !== "string" || !value.trim())
    add(field, `${field} must be specific.`);
}
function requireArray(value, field, add) {
  if (!Array.isArray(value)) add(field, `${field} must be an array.`);
}

function requireNonEmptyTextArray(value, field, add) {
  if (!Array.isArray(value)) return add(field, `${field} must be an array.`);
  if (value.length === 0 || value.some((item) => typeof item !== "string" || !item.trim()))
    add(field, `${field} must contain at least one specific artifact reference.`);
}

function validateEvidenceDigests(run, options, add) {
  const terminal = ["stopped", "complete"].includes(run.status);
  if (terminal && !isRecord(run.evidenceDigests)) {
    add(
      "evidenceDigests",
      "Terminal runs require SHA-256 digests for retained evidence.",
    );
    return;
  }
  if (!isRecord(run.evidenceDigests) || !options?.repoRoot) return;
  const evidenceDirectory = resolve(
    options.repoRoot,
    `craft/runs/${run.runId}/evidence`,
  );
  const realEvidenceDirectory = existsSync(evidenceDirectory)
    ? realpathSync(evidenceDirectory)
    : null;
  for (const [reference, digest] of Object.entries(run.evidenceDigests)) {
    const path = resolve(options.repoRoot, reference);
    if (
      !realEvidenceDirectory ||
      !isContainedPath(evidenceDirectory, path) ||
      !existsSync(path) ||
      !statSync(path).isFile() ||
      !isContainedPath(realEvidenceDirectory, realpathSync(path))
    ) {
      add(
        `evidenceDigests.${reference}`,
        "Evidence digest paths must identify retained run-local evidence files.",
      );
      continue;
    }
    if (!/^[0-9a-f]{64}$/.test(digest) || sha256(readFileSync(path)) !== digest)
      add(
        `evidenceDigests.${reference}`,
        "Evidence SHA-256 must match the retained bytes.",
      );
  }
}

function validateArtifactReferences(run, references, field, options, add) {
  if (!Array.isArray(references)) return;
  const committedPrefix = `craft/runs/${run.runId}/evidence/`;
  const evidenceDirectory = options?.repoRoot
    ? resolve(options.repoRoot, committedPrefix)
    : null;
  const realEvidenceDirectory =
    evidenceDirectory && existsSync(evidenceDirectory)
      ? realpathSync(evidenceDirectory)
      : null;
  for (const [index, reference] of references.entries()) {
    if (typeof reference !== "string" || !reference.trim()) continue;
    const artifactPath = options?.repoRoot
      ? resolve(options.repoRoot, reference)
      : null;
    if (
      ["stopped", "complete"].includes(run.status) &&
      (!artifactPath ||
        !isContainedPath(evidenceDirectory, artifactPath) ||
        (existsSync(artifactPath) &&
          (!realEvidenceDirectory ||
            !isContainedPath(realEvidenceDirectory, realpathSync(artifactPath)))))
    )
      add(
        `${field}.${index}`,
        `Terminal run evidence must be retained under ${committedPrefix}.`,
      );
    if (
      artifactPath &&
      (!existsSync(artifactPath) || !statSync(artifactPath).isFile())
    )
      add(`${field}.${index}`, `Referenced artifact is missing: ${reference}.`);
    if (
      ["stopped", "complete"].includes(run.status) &&
      run.evidenceDigests?.[reference] !==
        (artifactPath && existsSync(artifactPath)
          ? sha256(readFileSync(artifactPath))
          : undefined)
    )
      add(
        `${field}.${index}`,
        `Terminal evidence requires a matching SHA-256 entry for ${reference}.`,
      );
  }
}

function qualifiedVisualReviews(reviews) {
  return asArray(reviews).filter(
    (review) =>
      visualRoles.includes(review.role) &&
      review.calibration?.passed === true &&
      review.disqualified !== true,
  );
}

function validateReviewCalibration(review, index, calibrationMetadata, add) {
  const expectedFailures = calibrationMetadata.controls
    .filter((control) => control.relevantRoles.includes(review.role))
    .flatMap((control) => control.seededFailures);
  const detectedFailures = review.calibration?.detectedFailures;
  if (!Array.isArray(detectedFailures)) {
    add(`reviews.${index}.calibration.detectedFailures`, "Passed calibration must list detected seeded failures.");
  } else {
    const missing = expectedFailures.filter((failure) => !detectedFailures.includes(failure));
    if (missing.length)
      add(
        `reviews.${index}.calibration.detectedFailures`,
        `Passed calibration missed seeded failures: ${missing.join(", ")}.`,
      );
  }
  for (const [field, label] of [["corrections", "prompt correction"], ["fullReruns", "full rerun"]]) {
    const value = review.calibration?.[field];
    if (!Number.isInteger(value) || value < 0 || value > 1)
      add(`reviews.${index}.calibration.${field}`, `Calibration permits at most one ${label}.`);
  }
}

function preserveHistoryPrefix(previous, next, field, add) {
  if (!Array.isArray(previous) || !Array.isArray(next)) {
    add(field, "Transition history must remain an array.");
    return;
  }
  if (next.length < previous.length || !previous.every((entry, index) => isDeepStrictEqual(entry, next[index])))
    add(field, `Resume must preserve the complete ${field} history as an unchanged prefix.`);
}

function validateAppendedReviewRounds(previous, next, field, add) {
  const previousEntries = asArray(previous?.[field]);
  const appendedEntries = asArray(next?.[field]).slice(previousEntries.length);
  if (appendedEntries.some((entry) => entry?.reviewRound !== next?.reviewRound))
    add(field, `New ${field} entries must belong to the active review round.`);
}

function validateVetoAssessment(veto, field, directionIds, add) {
  if (typeof veto === "string") {
    if (!veto.trim()) add(field, "Veto assessments must not be empty.");
    return;
  }
  if (!isRecord(veto)) {
    add(field, "Veto assessments must be a non-empty string or structured record.");
    return;
  }
  requireText(veto.reason, `${field}.reason`, add);
  if (typeof veto.resolved !== "boolean")
    add(`${field}.resolved`, "Structured veto assessments require an explicit resolved boolean.");
  if (veto.directionId !== undefined) {
    requireText(veto.directionId, `${field}.directionId`, add);
    if (!directionIds.includes(veto.directionId))
      add(`${field}.directionId`, "Structured veto assessments must identify an existing direction.");
  }
}

function vetoTargetsDirection(veto, directionId, directionIds) {
  if (typeof veto === "string") {
    const targets = directionIds.filter((candidate) => veto.includes(candidate));
    return targets.length === 0 || targets.includes(directionId);
  }
  return (
    isRecord(veto) &&
    veto.resolved !== true &&
    (!veto.directionId || veto.directionId === directionId)
  );
}

function median(values) {
  if (!values.length) return Number.NEGATIVE_INFINITY;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function validateProductionEvidence(run, options, add) {
  const evidence = run.productionEvidence;
  if (!isRecord(evidence)) return add("productionEvidence", "Complete runs require production verification evidence.");
  for (const field of ["repositoryGates", "browserAccessibilityMatrix", "rollbackEvidence", "postDeploySmoke"]) {
    const record = evidence[field];
    if (!isRecord(record) || record.status !== "passed")
      add(`productionEvidence.${field}`, `${field} must record a passed result.`);
    requireText(record?.artifact, `productionEvidence.${field}.artifact`, add);
    validateArtifactReferences(
      run,
      record?.artifact ? [record.artifact] : [],
      `productionEvidence.${field}.artifact`,
      options,
      add,
    );
  }
  const measurements = evidence.mobileMeasurements;
  if (!Array.isArray(measurements) || measurements.length !== 3) {
    add("productionEvidence.mobileMeasurements", "Complete runs require exactly three cold-cache mobile measurements.");
    return;
  }
  const profileIds = new Set();
  const runIds = new Set();
  for (const [index, measurement] of measurements.entries()) {
    requireText(measurement?.profileId, `productionEvidence.mobileMeasurements.${index}.profileId`, add);
    requireText(measurement?.runId, `productionEvidence.mobileMeasurements.${index}.runId`, add);
    profileIds.add(measurement?.profileId);
    runIds.add(measurement?.runId);
    if (measurement?.coldCache !== true)
      add(`productionEvidence.mobileMeasurements.${index}.coldCache`, "Mobile measurements must use cold cache.");
    for (const metric of ["lcpMs", "cls"])
      if (!Number.isFinite(measurement?.[metric]) || measurement[metric] < 0)
        add(`productionEvidence.mobileMeasurements.${index}.${metric}`, `${metric} must be a non-negative number.`);
  }
  if (profileIds.size !== 1) add("productionEvidence.mobileMeasurements", "Mobile measurements must use one comparable profile.");
  if (runIds.size !== 3) add("productionEvidence.mobileMeasurements", "Mobile measurements must record three distinct runs.");
}

function validateProductionReviews(run, add) {
  const reviews = asArray(run.reviews).filter(
    (review) =>
      copyRoles.includes(review?.role) &&
      review?.reviewRound === run.reviewRound &&
      review?.producer === false &&
      review?.calibration?.passed === true &&
      review?.disqualified !== true &&
      asArray(review?.evidenceLabels).includes("ai-comprehension-proxy") &&
      Number.isInteger(review?.scores?.comprehension) &&
      review.scores.comprehension >= 3 &&
      asArray(review?.findings).some(
        (finding) => typeof finding === "string" && finding.trim(),
      ),
  );
  const roles = new Set(reviews.map((review) => review.role));
  const reviewerIds = new Set(
    reviews.map((review) => canonicalReviewerId(review.reviewerId)),
  );
  if (copyRoles.some((role) => !roles.has(role)) || reviewerIds.size < copyRoles.length)
    add(
      "reviews",
      "Complete runs require one distinct, calibrated current-round review for every copy role.",
    );
}

function canonicalReviewerId(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function parseArguments(args) {
  if (
    !Array.isArray(args) ||
    (args.length !== 1 && args.length !== 3) ||
    !args[0] ||
    (args.length === 3 && (args[1] !== "--previous" || !args[2]))
  )
    throw new Error("Usage: validate-run.mjs <state.json> [--previous <state.json>]");
  return { statePath: args[0], previousPath: args[2] };
}

export function validateInstructionManifest(manifest, run, repoRoot) {
  const issues = [];
  const add = (field, reason) => issues.push({ field, reason });
  if (!isRecord(manifest))
    return [{ field: "instructionManifest", reason: "Instruction manifest must be an object." }];
  if (manifest.schemaVersion !== instructionManifestSchemaVersion)
    add(
      "instructionManifest.schemaVersion",
      `Instruction manifest schemaVersion must be ${instructionManifestSchemaVersion}.`,
    );
  if (manifest.protocolVersion !== run.protocolVersion)
    add("instructionManifest.protocolVersion", "Instruction manifest protocolVersion must match the run.");
  if (manifest.sourceCommit !== run.surface?.sourceCommit)
    add("instructionManifest.sourceCommit", "Instruction manifest sourceCommit must match the run.");
  const instructionRoot = resolve(
    repoRoot,
    `craft/runs/${run.runId}/instructions`,
  );
  const realInstructionRoot = existsSync(instructionRoot)
    ? realpathSync(instructionRoot)
    : null;
  const expectedSources = {
    canonicalSkill: `craft/runs/${run.runId}/instructions/SKILL.md`,
    protocol: `craft/runs/${run.runId}/instructions/protocol.md`,
    runTemplate: `craft/runs/${run.runId}/instructions/run-template.json`,
    calibrationMetadata: `craft/runs/${run.runId}/instructions/calibration/metadata.json`,
  };
  for (const [field, expectedSource] of Object.entries(expectedSources)) {
    const source = manifest.sources?.[field];
    const sourcePath = typeof source === "string" ? resolve(repoRoot, source) : null;
    if (
      source !== expectedSource ||
      !sourcePath ||
      !realInstructionRoot ||
      !isContainedPath(instructionRoot, sourcePath) ||
      !existsSync(sourcePath) ||
      !statSync(sourcePath).isFile() ||
      !isContainedPath(realInstructionRoot, realpathSync(sourcePath))
    ) {
      add(
        `instructionManifest.sources.${field}`,
        `Instruction manifest ${field} must reference ${expectedSource}.`,
      );
      continue;
    }
    const expected = sha256(readFileSync(sourcePath));
    if (manifest.hashes?.[field] !== expected)
      add(
        `instructionManifest.hashes.${field}`,
        `Instruction manifest ${field} hash must match its retained snapshot.`,
      );
  }
  const expectedControl = "evidence/without-skill-control.webp";
  const controlReference = manifest.plainRequestControl?.retainedArtifact;
  const controlPath = resolve(
    repoRoot,
    `craft/runs/${run.runId}/${controlReference ?? ""}`,
  );
  const evidenceRoot = resolve(
    repoRoot,
    `craft/runs/${run.runId}/evidence`,
  );
  if (
    controlReference !== expectedControl ||
    !existsSync(controlPath) ||
    !statSync(controlPath).isFile() ||
    !isContainedPath(evidenceRoot, controlPath) ||
    !isContainedPath(realpathSync(evidenceRoot), realpathSync(controlPath))
  )
    add(
      "instructionManifest.plainRequestControl.retainedArtifact",
      `Without-skill control must be retained at ${expectedControl}.`,
    );
  else if (
    !/^[0-9a-f]{64}$/.test(manifest.plainRequestControl?.sha256 ?? "") ||
    sha256(readFileSync(controlPath)) !== manifest.plainRequestControl.sha256
  )
    add(
      "instructionManifest.plainRequestControl.sha256",
      "Without-skill control SHA-256 must match its retained bytes.",
    );
  if (manifest.plainRequestControl?.codeRetained !== false)
    add(
      "instructionManifest.plainRequestControl.codeRetained",
      "Without-skill control code must not be retained.",
    );
  if (requiresTransitionEvidence(run, manifest)) {
    const expectedPrevious = `craft/runs/${run.runId}/transitions/previous-state.json`;
    const previousReference = manifest.transition?.previousState;
    const previousPath = resolve(repoRoot, previousReference ?? "");
    const transitionRoot = resolve(
      repoRoot,
      `craft/runs/${run.runId}/transitions`,
    );
    if (
      previousReference !== expectedPrevious ||
      !existsSync(previousPath) ||
      !statSync(previousPath).isFile() ||
      !isContainedPath(transitionRoot, previousPath) ||
      !isContainedPath(realpathSync(transitionRoot), realpathSync(previousPath))
    )
      add(
        "instructionManifest.transition.previousState",
        `Advanced runs must retain their prior snapshot at ${expectedPrevious}.`,
      );
    else if (
      !/^[0-9a-f]{64}$/.test(manifest.transition?.sha256 ?? "") ||
      sha256(readFileSync(previousPath)) !== manifest.transition.sha256
    )
      add(
        "instructionManifest.transition.sha256",
        "Previous-state SHA-256 must match the retained snapshot.",
      );
  }
  return issues;
}

export function loadRunCalibrationMetadata(manifest, run, repoRoot) {
  const expected = `craft/runs/${run.runId}/instructions/calibration/metadata.json`;
  if (manifest?.sources?.calibrationMetadata !== expected)
    throw new Error(
      `Run calibration metadata must be retained at ${expected}.`,
    );
  return JSON.parse(readFileSync(resolve(repoRoot, expected), "utf8"));
}

export function loadRunPreviousState(manifest, run, repoRoot) {
  const expected = `craft/runs/${run.runId}/transitions/previous-state.json`;
  if (manifest?.transition?.previousState !== expected)
    throw new Error(`Prior state must be retained at ${expected}.`);
  return JSON.parse(readFileSync(resolve(repoRoot, expected), "utf8"));
}

export function requiresTransitionEvidence(run, manifest) {
  return (
    (isRecord(manifest) && Object.hasOwn(manifest, "transition")) ||
    run?.phase !== "shape" ||
    run?.ownerDecision === "rebrief" ||
    run?.reviewRound > 1 ||
    asArray(run?.directions).length > 0 ||
    asArray(run?.iterations).length > 0 ||
    asArray(run?.reviews).length > 0
  );
}

export async function loadPatternValidators(repoRoot) {
  const entry = join(repoRoot, "packages/patterns/dist/index.js");
  const sourceMtime = latestMtime(join(repoRoot, "packages/patterns/src"));
  if (!existsSync(entry) || sourceMtime > statSync(entry).mtimeMs) {
    const build = spawnSync(
      process.execPath,
      [
        join(repoRoot, "scripts/build-package.mjs"),
        "styles.css",
        "visual-grammar.css",
        "public.css",
        "axal.css",
        "pack.css",
        "tools.css",
        "responsive.css",
      ],
      {
        cwd: join(repoRoot, "packages/patterns"),
        env: { ...process.env, PATH: `${join(repoRoot, "node_modules/.bin")}:${process.env.PATH ?? ""}` },
        stdio: "inherit",
      },
    );
    if (build.error || build.status !== 0 || !existsSync(entry))
      throw new Error("Unable to build @sanchika/patterns validators for craft-run validation.");
  }
  return import(`${pathToFileURL(entry).href}?craft-validator=${statSync(entry).mtimeMs}`);
}

function latestMtime(directory) {
  return Math.max(
    statSync(directory).mtimeMs,
    ...readdirSync(directory, { recursive: true })
      .map((path) => join(directory, path))
      .filter((path) => statSync(path).isFile())
      .map((path) => statSync(path).mtimeMs),
  );
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function main() {
  const { statePath, previousPath } = parseArguments(process.argv.slice(2));
  const repoRoot = resolve(scriptDir, "../../..");
  const validators = await loadPatternValidators(repoRoot);
  const run = JSON.parse(readFileSync(resolve(statePath), "utf8"));
  const allowTemplate = basename(statePath) === "run-template.json";
  const issues = [];
  const manifestPath = join(dirname(resolve(statePath)), "instruction-manifest.json");
  let calibrationDirectory = join(scriptDir, "../assets/calibration");
  let calibrationMetadata = canonicalCalibrationMetadata;
  let manifest;
  if (!allowTemplate && !existsSync(manifestPath)) {
    issues.push({
      field: "instructionManifest",
      reason: "Non-template craft runs require instruction-manifest.json.",
    });
  } else if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      const manifestIssues = validateInstructionManifest(manifest, run, repoRoot);
      issues.push(...manifestIssues);
      if (manifestIssues.length === 0) {
        calibrationMetadata = loadRunCalibrationMetadata(
          manifest,
          run,
          repoRoot,
        );
        calibrationDirectory = dirname(
          resolve(repoRoot, manifest.sources.calibrationMetadata),
        );
      }
    } catch {
      issues.push({
        field: "instructionManifest",
        reason: "Instruction manifest and retained snapshots must be readable.",
      });
    }
  }
  issues.push(...validateCraftRun(run, validators, {
    allowTemplate,
    repoRoot,
    expectedRunId: allowTemplate ? undefined : basename(dirname(resolve(statePath))),
    calibrationMetadata,
  }));
  issues.push(
    ...validateCalibrationPack(calibrationDirectory),
  );
  if (!allowTemplate && requiresTransitionEvidence(run, manifest) && manifest) {
    try {
      const retainedPreviousPath = resolve(
        repoRoot,
        manifest.transition?.previousState ?? "",
      );
      if (
        previousPath &&
        resolve(previousPath) !== retainedPreviousPath
      )
        issues.push({
          field: "arguments.previous",
          reason: "--previous must identify the manifest-authenticated prior snapshot.",
        });
      const previous = loadRunPreviousState(manifest, run, repoRoot);
      for (const issue of validateCraftRun(previous, validators, {
        allowTemplate: false,
        repoRoot,
        expectedRunId: run.runId,
        calibrationMetadata,
      }))
        issues.push({
          field: `previousState.${issue.field}`,
          reason: issue.reason,
        });
      issues.push(...validateCraftTransition(previous, run));
    } catch {
      issues.push({
        field: "previousState",
        reason: "Advanced runs require a readable manifest-authenticated prior snapshot.",
      });
    }
  }
  if (issues.length) {
    for (const issue of issues)
      console.error(`${issue.field}: ${issue.reason}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Craft run valid: ${run.runId} (${run.phase}/${run.status})`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await main();

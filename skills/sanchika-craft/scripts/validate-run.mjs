#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
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
const controlIds = [
  "current-baseline",
  "generic-ai-saas",
  "off-brief-editorial",
  "fake-authority",
  "mobile-a11y-failure",
];
const scriptDir = dirname(fileURLToPath(import.meta.url));
const calibrationMetadata = JSON.parse(
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
  if (!allowTemplate && String(run.runId).startsWith("template-"))
    add("runId", "Replace template run ID before use.");
  validateSurface(run.surface, allowTemplate, add);
  validateCapabilities(run.capabilities, add);
  if (!phases.includes(run.phase))
    add("phase", `Unknown phase ${run.phase ?? "(missing)"}.`);
  if (!statuses.includes(run.status))
    add("status", `Unknown status ${run.status ?? "(missing)"}.`);
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

  validateEmbeddedContracts(run, validators ?? {}, add);
  validateState(run, add);
  validateReviews(run.reviews ?? [], add);
  validateDirections(run, add);
  validateIterations(run, add);
  validateAssets(run.assets ?? [], add);

  if (phaseAtLeast(run.phase, "explore") && (run.directions?.length ?? 0) === 0)
    add(
      "directions",
      "Explore and later phases require at least one direction.",
    );
  if (
    phaseAtLeast(run.phase, "review") &&
    run.capabilities?.isolatedReview !== true
  )
    add(
      "capabilities.isolatedReview",
      "Review and later phases require isolated review capability.",
    );
  if (run.phase === "owner_gate") validateOwnerGate(run, add);
  if (
    run.status === "complete" &&
    run.evidenceLoop?.decision !== "ready-for-consumer-pr"
  )
    add(
      "evidenceLoop.decision",
      "Complete runs require a ready-for-consumer-pr evidence decision.",
    );
  if (run.status === "complete") validateProductionEvidence(run.productionEvidence, add);
  return issues;
}

export function validateCraftTransition(previous, next) {
  const issues = [];
  const add = (field, reason) => issues.push({ field, reason });
  for (const field of ["runId", "schemaVersion", "protocolVersion"]) {
    if (previous?.[field] !== next?.[field])
      add(field, `${field} cannot change while resuming a run.`);
  }
  if (JSON.stringify(previous?.surface) !== JSON.stringify(next?.surface))
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
  if (!rebrief && !capabilityResume && to !== from && to !== from + 1)
    add(
      "phase",
      "Phase transitions must advance one step, rebrief to shape, or resume the same capability-blocked phase.",
    );
  preserveHistoryPrefix(previous?.iterations, next?.iterations, "iterations", add);
  preserveHistoryPrefix(previous?.reviews, next?.reviews, "reviews", add);
  if (capabilityResume) {
    for (const field of ["trustBrief", "designBrief", "directions"]) {
      if (!isDeepStrictEqual(previous?.[field], next?.[field]))
        add(field, `Capability resumes cannot change ${field} acceptance thresholds.`);
    }
  }
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
  let total = statSync(metadataPath).size;
  for (const control of controls) {
    requireText(control.file, `calibration.${control.id}.file`, add);
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
    const file = join(directory, control.file ?? "");
    try {
      total += statSync(file).size;
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

function validateEmbeddedContracts(run, validators, add) {
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
  if (run.status !== "stopped" && run.stopReason !== undefined)
    add("stopReason", "Only stopped runs may carry stopReason.");
  if (
    run.ownerDecision === "rejected" &&
    (run.status !== "stopped" || run.stopReason !== "owner_rejected")
  )
    add(
      "ownerDecision",
      "Rejected owner decisions must stop with owner_rejected.",
    );
  if (
    run.ownerDecision === "approved" &&
    !phaseAtLeast(run.phase, "build") &&
    run.status !== "complete"
  )
    add("ownerDecision", "Owner approval advances to build or later.");
  if (phaseAtLeast(run.phase, "build") && run.ownerDecision !== "approved")
    add("ownerDecision", "Build and later phases require owner approval.");
}

function validateDirections(run, add) {
  const directions = run.directions ?? [];
  for (const [index, direction] of directions.entries()) {
    for (const field of ["id", "designBriefId", "territory"])
      requireText(direction?.[field], `directions.${index}.${field}`, add);
    requireNonEmptyTextArray(
      direction?.artifactRefs,
      `directions.${index}.artifactRefs`,
      add,
    );
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
      const visualReviews = qualifiedVisualReviews(run.reviews ?? []);
      const actualPreferenceCount = visualReviews.filter((review) =>
        review.preference?.includes(direction.id),
      ).length;
      if (actualPreferenceCount < 3)
        add(
          `directions.${index}.preference`,
          "Qualified directions require preference from at least three calibrated visual reviewers.",
        );
      for (const criterion of ["relevance", "distinctiveness", "craft", "trust"]) {
        const declared = direction.medians?.[criterion];
        const scores = visualReviews
          .map((review) => review.directionScores?.[direction.id]?.[criterion])
          .filter(Number.isFinite);
        if (
          scores.length !== visualRoles.length ||
          !Number.isFinite(declared) ||
          declared < 3 ||
          median(scores) < 3
        )
          add(
            `directions.${index}.medians.${criterion}`,
            `Qualified directions require a ${criterion} median of at least 3 across calibrated visual reviews.`,
          );
      }
      const unresolvedVetoes = (run.reviews ?? [])
        .filter((review) => ["trust", "accessibility"].includes(review.role))
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
          result.correctMatchers < 2 ||
          result.matcherCount !== 3 ||
          result.colorOnly === true
        )
          add(
            `directions.${index}.recognition.${proxy}`,
            "Qualified directions require 2/3 correct recognition without color-only matching.",
          );
      }
    }
  }
}

function validateReviews(reviews, add) {
  for (const [index, review] of reviews.entries()) {
    requireText(review?.reviewerId, `reviews.${index}.reviewerId`, add);
    if (
      ![
        ...visualRoles,
        "practitioner",
        "developer",
        "claims",
        "voice",
      ].includes(review?.role)
    )
      add(`reviews.${index}.role`, "Unknown reviewer role.");
    if (review?.producer === true)
      add(
        `reviews.${index}.producer`,
        "A producing context cannot review its own output.",
      );
    if (review?.calibration?.passed !== true && review?.disqualified !== true)
      add(
        `reviews.${index}.calibration`,
        "Reviewer must pass calibration or be disqualified.",
      );
    if (review?.calibration?.passed === true) validateReviewCalibration(review, index, add);
    requireArray(
      review?.evidenceLabels,
      `reviews.${index}.evidenceLabels`,
      add,
    );
    for (const label of review?.evidenceLabels ?? [])
      if (!evidenceLabels.includes(label))
        add(
          `reviews.${index}.evidenceLabels`,
          `Unknown evidence label ${label}.`,
        );
    for (const [criterion, score] of Object.entries(review?.scores ?? {}))
      if (!Number.isInteger(score) || score < 0 || score > 4)
        add(
          `reviews.${index}.scores.${criterion}`,
          "Rubric scores must be integers from 0 to 4.",
        );
  }
}

function validateIterations(run, add) {
  for (const [index, iteration] of (run.iterations ?? []).entries()) {
    for (const field of ["failingCriterion", "changeHypothesis"])
      requireText(iteration?.[field], `iterations.${index}.${field}`, add);
    requireArray(iteration?.invariants, `iterations.${index}.invariants`, add);
    requireNonEmptyTextArray(
      iteration?.artifactRefs,
      `iterations.${index}.artifactRefs`,
      add,
    );
    if (!["improved", "not_improved"].includes(iteration?.result))
      add(
        `iterations.${index}.result`,
        "Iteration result must be improved or not_improved.",
      );
    if (iteration?.result === "improved") {
      const assessments = (run.reviews ?? [])
        .flatMap((review) => review.revisionAssessments ?? [])
        .filter((item) => item.iterationIndex === index);
      const supported = assessments.some(
        (item) =>
          item.preferCount >= 3 &&
          item.medianAfter - item.medianBefore >= 1 &&
          (item.criticalRegressions?.length ?? 0) === 0,
      );
      if (!supported)
        add(
          `iterations.${index}.result`,
          "Improved requires 3/4 preference, +1 median, and no critical regression evidence.",
        );
    }
  }
  const tail = (run.iterations ?? []).slice(-2);
  if (
    tail.length === 2 &&
    tail.every((item) => item.result === "not_improved") &&
    tail[0].failingCriterion === tail[1].failingCriterion
  ) {
    if (
      !(run.phase === "shape" && run.ownerDecision === "rebrief") &&
      run.stopReason !== "no_adoptable_direction"
    )
      add(
        "iterations",
        "Two consecutive non-improving revisions require a rebrief.",
      );
  }
  const lastFour = (run.iterations ?? []).slice(-4);
  if (
    lastFour.length === 4 &&
    lastFour.every(
      (item) =>
        item.result === "not_improved" &&
        item.failingCriterion === lastFour[0].failingCriterion,
    ) &&
    run.stopReason !== "no_adoptable_direction"
  )
    add(
      "stopReason",
      "A second brief failing the same criterion must stop as no_adoptable_direction.",
    );
}

function validateOwnerGate(run, add) {
  const passedReviews = qualifiedVisualReviews(run.reviews ?? []);
  const passedRoles = new Set(passedReviews.map((review) => review.role));
  if (
    passedReviews.length !== visualRoles.length ||
    passedRoles.size !== visualRoles.length
  )
    add(
      "reviews",
      "Owner gate requires one calibrated review from each visual role.",
    );
  if (new Set(passedReviews.map((review) => review.reviewerId)).size !== visualRoles.length)
    add("reviews", "Owner gate requires four distinct calibrated reviewer identities.");
  if (!(run.directions ?? []).some((direction) => direction.qualified === true))
    add("directions", "Owner gate requires at least one qualifying direction.");
}

function validateAssets(assets, add) {
  for (const [index, asset] of assets.entries()) {
    for (const field of ["path", "origin", "licence", "sha256"])
      requireText(asset?.[field], `assets.${index}.${field}`, add);
    if (!["identity", "atmosphere", "evidence"].includes(asset?.job))
      add(
        `assets.${index}.job`,
        "Asset job must be identity, atmosphere, or evidence.",
      );
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

function qualifiedVisualReviews(reviews) {
  return reviews.filter(
    (review) =>
      visualRoles.includes(review.role) &&
      review.calibration?.passed === true &&
      review.disqualified !== true,
  );
}

function validateReviewCalibration(review, index, add) {
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

function validateProductionEvidence(evidence, add) {
  if (!isRecord(evidence)) return add("productionEvidence", "Complete runs require production verification evidence.");
  for (const field of ["repositoryGates", "browserAccessibilityMatrix", "rollbackEvidence", "postDeploySmoke"]) {
    const record = evidence[field];
    if (!isRecord(record) || record.status !== "passed")
      add(`productionEvidence.${field}`, `${field} must record a passed result.`);
    requireText(record?.artifact, `productionEvidence.${field}.artifact`, add);
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

export async function loadPatternValidators(repoRoot) {
  const entry = join(repoRoot, "packages/patterns/dist/index.js");
  if (!existsSync(entry)) {
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

async function main() {
  const { statePath, previousPath } = parseArguments(process.argv.slice(2));
  const repoRoot = resolve(scriptDir, "../../..");
  const validators = await loadPatternValidators(repoRoot);
  const run = JSON.parse(readFileSync(resolve(statePath), "utf8"));
  const issues = validateCraftRun(run, validators, {
    allowTemplate: basename(statePath) === "run-template.json",
  });
  issues.push(
    ...validateCalibrationPack(join(scriptDir, "../assets/calibration")),
  );
  if (previousPath)
    issues.push(
      ...validateCraftTransition(
        JSON.parse(readFileSync(resolve(previousPath), "utf8")),
        run,
      ),
    );
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

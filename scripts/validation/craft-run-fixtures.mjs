import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseArguments,
  validateCalibrationPack,
  validateCraftRun,
  validateCraftTransition,
  validateInstructionManifest,
  requiresTransitionEvidence,
} from "../../skills/sanchika-craft/scripts/validate-run.mjs";

export function runCraftRunFixtures({ baseRun, validators, repoRoot }) {
  const failures = [];
  const cases = [];
  const runCase = (name, exercise, expectedField) => {
    cases.push(name);
    let issues = [];
    try {
      issues = exercise() ?? [];
    } catch (error) {
      failures.push(
        `${name}: threw ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }
    if (expectedField === null && issues.length > 0) {
      failures.push(
        `${name}: expected no issues; found ${issues.map((issue) => issue.field).join(", ")}`,
      );
    } else if (
      expectedField !== null &&
      !issues.some((issue) => issue.field === expectedField)
    ) {
      failures.push(
        `${name}: expected ${expectedField}; found ${issues.map((issue) => issue.field).join(", ") || "none"}`,
      );
    }
  };
  const validate = (mutate) => {
    const run = structuredClone(baseRun);
    mutate?.(run);
    return validateCraftRun(run, validators, { repoRoot });
  };
  const primaryDirectionId = baseRun.directions[0].id;
  const alternateDirectionId = baseRun.directions.at(-1).id;
  const primaryArtifact = baseRun.directions[0].artifactRefs[0];
  const alternateArtifact = baseRun.directions[1].artifactRefs[0];
  const baseRunRoot = `craft/runs/${baseRun.runId}`;
  const baseManifestPath = join(
    repoRoot,
    baseRunRoot,
    "instruction-manifest.json",
  );
  const readBaseManifest = () =>
    JSON.parse(readFileSync(baseManifestPath, "utf8"));
  const withoutSkillArtifact = `${baseRunRoot}/${readBaseManifest().plainRequestControl.retainedArtifact}`;
  const makeComplete = (run, { includeCopyReviews = true } = {}) => {
    run.phase = "verify";
    run.status = "complete";
    run.ownerDecision = "approved";
    run.selectedDirectionId = primaryDirectionId;
    run.productionApproval = {
      decision: "approved",
      approvedBy: "owner",
      approvedAt: "2026-07-17T00:00:00.000Z",
    };
    run.evidenceLoop.decision = "ready-for-consumer-pr";
    run.evidenceLoop.adoptionEvidence.status = "verified";
    delete run.stopReason;
    const gate = {
      status: "passed",
      artifact: primaryArtifact,
    };
    run.productionEvidence = {
      repositoryGates: gate,
      browserAccessibilityMatrix: gate,
      rollbackEvidence: gate,
      postDeploySmoke: gate,
      mobileMeasurements: [1, 2, 3].map((number) => ({
        runId: `run-${number}`,
        profileId: "mobile-v1",
        coldCache: true,
        lcpMs: 1200,
        cls: 0,
      })),
    };
    if (includeCopyReviews)
      for (const role of ["practitioner", "developer", "claims", "voice"])
        run.reviews.push({
          reviewerId: `${role}-01`,
          reviewRound: run.reviewRound,
          role,
          producer: false,
          calibration: {
            passed: true,
            corrections: 0,
            fullReruns: 0,
            detectedFailures: [],
          },
          evidenceLabels: ["ai-comprehension-proxy", "not-user-validated"],
          scores: { comprehension: 4 },
          vetoes: [],
        });
  };

  runCase("valid terminal owner-gate run", () => validate(), null);
  runCase(
    "qualified direction below preference threshold",
    () =>
      validate((run) => {
        run.directions[0].preference.preferredToBaseline = 2;
      }),
    "directions.0.preference",
  );
  runCase(
    "qualified direction with unresolved trust veto",
    () =>
      validate((run) => {
        run.reviews
          .find((review) => review.role === "trust")
          .vetoes.push(`${primaryDirectionId} remains blocked`);
      }),
    "directions.0.vetoes",
  );
  runCase(
    "trust review requires an explicit veto assessment array",
    () =>
      validate((run) => {
        delete run.reviews.find((review) => review.role === "trust").vetoes;
      }),
    "reviews.2.vetoes",
  );
  runCase(
    "trust review rejects malformed veto assessments",
    () =>
      validate((run) => {
        run.reviews.find((review) => review.role === "trust").vetoes = [null];
      }),
    "reviews.2.vetoes.0",
  );
  runCase(
    "qualified direction below a rubric median",
    () =>
      validate((run) => {
        run.directions[0].medians.trust = 2;
      }),
    "directions.0.medians.trust",
  );
  runCase(
    "declared median differs from reviewer evidence",
    () =>
      validate((run) => {
        run.directions[0].medians.trust = 3;
      }),
    "directions.0.medians.trust",
  );
  runCase(
    "recognition result exceeds matcher bounds",
    () =>
      validate((run) => {
        run.directions[0].recognition.semanticBlind.correctMatchers = 99;
        run.directions[0].recognition.semanticBlind.colorOnly = "yes";
      }),
    "directions.0.recognition.semanticBlind",
  );
  runCase(
    "aggregate preference differs from per-review controls",
    () =>
      validate((run) => {
        run.reviews[0].directionComparisons[primaryDirectionId].baseline = false;
      }),
    "directions.0.preference",
  );
  runCase(
    "passed calibration missing a seeded failure",
    () =>
      validate((run) => {
        run.reviews[0].calibration.detectedFailures = [];
      }),
    "reviews.0.calibration.detectedFailures",
  );
  runCase(
    "passed calibration exceeds the rerun limit",
    () =>
      validate((run) => {
        run.reviews[0].calibration.fullReruns = 2;
      }),
    "reviews.0.calibration.fullReruns",
  );
  runCase(
    "visual review omits producer isolation",
    () =>
      validate((run) => {
        delete run.reviews[0].producer;
      }),
    "reviews.0.producer",
  );
  runCase(
    "visual review omits proxy evidence labels",
    () =>
      validate((run) => {
        run.reviews[0].evidenceLabels = [];
      }),
    "reviews.0.evidenceLabels",
  );
  runCase(
    "visual review omits the rubric",
    () =>
      validate((run) => {
        delete run.reviews[0].scores;
      }),
    "reviews.0.scores.relevance",
  );
  runCase(
    "revision assessment uses coercive values",
    () =>
      validate((run) => {
        const assessment = run.reviews[3].revisionAssessments[0];
        assessment.preferCount = "999";
        assessment.medianBefore = "-99";
        assessment.medianAfter = "999";
        delete assessment.criticalRegressions;
      }),
    "reviews.3.revisionAssessments.0.preferCount",
  );
  runCase(
    "direction rubric score exceeds the scale",
    () =>
      validate((run) => {
        run.reviews[0].directionScores[primaryDirectionId].trust = 100;
      }),
    `reviews.0.directionScores.${primaryDirectionId}.trust`,
  );
  runCase(
    "owner gate reuses one reviewer identity",
    () =>
      validate((run) => {
        run.reviews[1].reviewerId = run.reviews[0].reviewerId;
      }),
    "reviews",
  );
  runCase(
    "evidence loop embeds changed design brief",
    () =>
      validate((run) => {
        run.evidenceLoop.designBrief.emotionalIntent =
          "Changed after evidence capture.";
      }),
    "evidenceLoop.designBrief",
  );
  runCase(
    "build bypasses owner approval",
    () =>
      validate((run) => {
        run.phase = "build";
        run.status = "active";
        run.ownerDecision = "pending";
        delete run.stopReason;
      }),
    "ownerDecision",
  );
  runCase(
    "owner rejection occurs before the owner gate",
    () =>
      validate((run) => {
        run.phase = "review";
        run.reviews = [];
        run.directions.forEach((direction) => { direction.qualified = false; });
      }),
    "ownerDecision",
  );
  runCase(
    "complete run omits production evidence",
    () =>
      validate((run) => {
        run.phase = "verify";
        run.status = "complete";
        run.ownerDecision = "approved";
        run.evidenceLoop.decision = "ready-for-consumer-pr";
        delete run.stopReason;
      }),
    "productionEvidence",
  );
  runCase(
    "complete run references missing production evidence",
    () =>
      validate((run) => {
        run.phase = "verify";
        run.status = "complete";
        run.ownerDecision = "approved";
        run.selectedDirectionId = primaryDirectionId;
        run.evidenceLoop.decision = "ready-for-consumer-pr";
        delete run.stopReason;
        const gate = {
          status: "passed",
          artifact: `craft/runs/${run.runId}/evidence/missing.webp`,
        };
        run.productionEvidence = {
          repositoryGates: gate,
          browserAccessibilityMatrix: gate,
          rollbackEvidence: gate,
          postDeploySmoke: gate,
          mobileMeasurements: [1, 2, 3].map((number) => ({
            runId: `run-${number}`,
            profileId: "mobile-v1",
            coldCache: true,
            lcpMs: 1200,
            cls: 0,
          })),
        };
      }),
    "productionEvidence.repositoryGates.artifact.0",
  );
  runCase(
    "direction omits artifact references",
    () =>
      validate((run) => {
        run.directions[0].artifactRefs = [];
      }),
    "directions.0.artifactRefs",
  );
  runCase(
    "revision omits artifact references",
    () =>
      validate((run) => {
        run.iterations[0].artifactRefs = [];
      }),
    "iterations.0.artifactRefs",
  );
  runCase(
    "terminal revision references uncommitted output",
    () =>
      validate((run) => {
        run.iterations[0].artifactRefs = ["output/creative/revision.png"];
      }),
    "iterations.0.artifactRefs.0",
  );
  runCase(
    "terminal evidence path escapes its directory",
    () =>
      validate((run) => {
        run.iterations[0].artifactRefs = [
          `craft/runs/${run.runId}/evidence/../../../../package.json`,
        ];
      }),
    "iterations.0.artifactRefs.0",
  );
  runCase(
    "first failed brief cannot stop as no adoptable direction",
    () =>
      validate((run) => {
        run.phase = "review";
        run.ownerDecision = "pending";
        run.stopReason = "no_adoptable_direction";
        run.iterations.push(
          {
            reviewRound: 1,
            failingCriterion: "distinctiveness",
            changeHypothesis: "First attempt",
            invariants: ["trust boundary"],
            artifactRefs: [
              primaryArtifact,
            ],
            result: "not_improved",
          },
          {
            reviewRound: 1,
            failingCriterion: "distinctiveness",
            changeHypothesis: "Second attempt",
            invariants: ["trust boundary"],
            artifactRefs: [
              alternateArtifact,
            ],
            result: "not_improved",
          },
        );
      }),
    "stopReason",
  );
  runCase(
    "retained asset checksum differs from bytes",
    () =>
      validate((run) => {
        run.assets[0].retained = true;
        run.assets[0].path = `craft/runs/${run.runId}/state.json`;
        run.assets[0].sha256 = "0".repeat(64);
      }),
    "assets.0.sha256",
  );
  runCase(
    "non-array directions return structured issues",
    () =>
      validate((run) => {
        run.directions = {};
      }),
    "directions",
  );
  runCase(
    "transition rewrites review history",
    () => {
      const previous = structuredClone(baseRun);
      const next = structuredClone(baseRun);
      next.reviews[0].scores.trust = 0;
      return validateCraftTransition(previous, next);
    },
    "reviews",
  );
  runCase(
    "reviewed current-round directions remain immutable",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "review";
      previous.status = "active";
      previous.ownerDecision = "pending";
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "owner_gate";
      next.status = "awaiting_owner";
      next.directions[0].territory = "rewritten-after-review";
      return validateCraftTransition(previous, next);
    },
    "directions",
  );
  runCase(
    "reviewed artifacts remain immutable before the owner gate",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "review";
      previous.status = "active";
      previous.ownerDecision = "pending";
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "owner_gate";
      next.status = "awaiting_owner";
      next.directions[0].artifactRefs = [alternateArtifact];
      return validateCraftTransition(previous, next);
    },
    "directions",
  );
  runCase(
    "transition surface comparison ignores object key order",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "review";
      previous.status = "active";
      previous.ownerDecision = "pending";
      delete previous.stopReason;
      const next = structuredClone(baseRun);
      next.phase = "review";
      next.status = "active";
      next.ownerDecision = "pending";
      delete next.stopReason;
      next.surface = {
        sourceCommit: previous.surface.sourceCommit,
        route: previous.surface.route,
        repo: previous.surface.repo,
      };
      return validateCraftTransition(previous, next);
    },
    null,
  );
  runCase(
    "new directions cannot be backdated into a closed round",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "shape";
      previous.status = "active";
      previous.ownerDecision = "rebrief";
      previous.reviewRound = 2;
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "explore";
      next.ownerDecision = "pending";
      next.directions.push({
        ...structuredClone(next.directions[0]),
        id: "backdated-direction",
        reviewRound: 1,
      });
      return validateCraftTransition(previous, next);
    },
    "directions",
  );
  runCase(
    "new iterations cannot be backdated into a closed round",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "shape";
      previous.status = "active";
      previous.ownerDecision = "rebrief";
      previous.reviewRound = 2;
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "explore";
      next.ownerDecision = "pending";
      next.iterations.push({
        ...structuredClone(next.iterations[0]),
        reviewRound: 1,
      });
      return validateCraftTransition(previous, next);
    },
    "iterations",
  );
  runCase(
    "new reviews cannot be backdated into a closed round",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "shape";
      previous.status = "active";
      previous.ownerDecision = "rebrief";
      previous.reviewRound = 2;
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "explore";
      next.ownerDecision = "pending";
      next.reviews.push({
        ...structuredClone(next.reviews[0]),
        reviewerId: "backdated-reviewer",
        reviewRound: 1,
      });
      return validateCraftTransition(previous, next);
    },
    "reviews",
  );
  runCase(
    "new audit entries may append to the active round",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "shape";
      previous.status = "active";
      previous.ownerDecision = "rebrief";
      previous.reviewRound = 2;
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "explore";
      next.ownerDecision = "pending";
      next.directions.push({
        ...structuredClone(next.directions[0]),
        id: "active-round-direction",
        reviewRound: 2,
      });
      next.iterations.push({
        ...structuredClone(next.iterations[0]),
        reviewRound: 2,
      });
      next.reviews.push({
        ...structuredClone(next.reviews[0]),
        reviewerId: "active-round-reviewer",
        reviewRound: 2,
      });
      return validateCraftTransition(previous, next);
    },
    null,
  );
  runCase(
    "capability resume lowers design thresholds",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "review";
      previous.status = "stopped";
      previous.stopReason = "capability_blocked";
      previous.ownerDecision = "pending";
      const next = structuredClone(previous);
      next.status = "active";
      delete next.stopReason;
      next.designBrief.visualQualityGates = [];
      return validateCraftTransition(previous, next);
    },
    "designBrief",
  );
  runCase(
    "owner-gate transition swaps the selected direction",
    () => {
      const previous = structuredClone(baseRun);
      previous.status = "awaiting_owner";
      previous.ownerDecision = "pending";
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "build";
      next.status = "active";
      next.ownerDecision = "approved";
      next.selectedDirectionId = "missing-direction";
      return validateCraftTransition(previous, next);
    },
    "selectedDirectionId",
  );
  runCase(
    "later phases preserve the owner-selected direction",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "build";
      previous.status = "active";
      previous.ownerDecision = "approved";
      previous.selectedDirectionId = primaryDirectionId;
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "reconcile";
      next.selectedDirectionId = alternateDirectionId;
      return validateCraftTransition(previous, next);
    },
    "selectedDirectionId",
  );
  runCase(
    "rebriefed round advances without replaying old iteration failures",
    () => {
      const run = structuredClone(baseRun);
      run.phase = "explore";
      run.status = "active";
      run.ownerDecision = "pending";
      run.reviewRound = 2;
      delete run.stopReason;
      return validateCraftRun(run, validators, { repoRoot }).filter(
        (issue) => issue.field === "iterations",
      );
    },
    null,
  );
  runCase(
    "owner gate scopes reviewers to the current round",
    () => {
      const run = structuredClone(baseRun);
      run.reviewRound = 2;
      const currentDirection = structuredClone(run.directions[0]);
      currentDirection.id = "direction-round-2";
      currentDirection.reviewRound = 2;
      run.directions.push(currentDirection);
      for (const review of structuredClone(run.reviews)) {
        review.reviewerId = `${review.reviewerId}-round-2`;
        review.reviewRound = 2;
        review.preference = ["direction-round-2"];
        review.directionScores = {
          "direction-round-2": structuredClone(
            review.directionScores[primaryDirectionId],
          ),
        };
        review.directionComparisons = {
          "direction-round-2": {
            baseline: true,
            withoutSkillControl: true,
          },
        };
        run.reviews.push(review);
      }
      return validateCraftRun(run, validators, { repoRoot }).filter(
        (issue) => issue.field === "reviews",
      );
    },
    null,
  );
  runCase(
    "run ID is a safe directory segment",
    () =>
      validate((run) => {
        run.runId = "foo/../bar";
      }),
    "runId",
  );
  runCase(
    "run ID matches its containing directory",
    () =>
      validateCraftRun(baseRun, validators, {
        repoRoot,
        expectedRunId: "different-run",
      }),
    "runId",
  );
  runCase(
    "direction IDs are unique",
    () =>
      validate((run) => {
        run.directions[1].id = run.directions[0].id;
      }),
    "directions",
  );
  runCase(
    "visual review compares every direction",
    () =>
      validate((run) => {
        delete run.reviews[0].directionComparisons[alternateDirectionId];
      }),
    `reviews.0.directionComparisons.${alternateDirectionId}`,
  );
  runCase(
    "disqualified review cannot prove an improved revision",
    () =>
      validate((run) => {
        run.reviews[3].disqualified = true;
      }),
    "iterations.0.result",
  );
  runCase(
    "historical repeated failures require a terminal stop",
    () =>
      validate((run) => {
        run.phase = "explore";
        run.status = "active";
        run.ownerDecision = "pending";
        run.reviewRound = 3;
        delete run.stopReason;
        for (const reviewRound of [1, 2])
          for (let attempt = 0; attempt < 2; attempt += 1)
            run.iterations.push({
              reviewRound,
              failingCriterion: "distinctiveness",
              changeHypothesis: `Attempt ${attempt + 1}`,
              invariants: ["trust boundary"],
              artifactRefs: [
                primaryArtifact,
              ],
              result: "not_improved",
            });
      }),
    "stopReason",
  );
  runCase(
    "verification failure is restricted to verify",
    () =>
      validate((run) => {
        run.phase = "shape";
        run.status = "stopped";
        run.ownerDecision = "pending";
        run.stopReason = "verification_failed";
      }),
    "stopReason",
  );
  runCase(
    "awaiting owner transition freezes directions",
    () => {
      const previous = structuredClone(baseRun);
      previous.status = "awaiting_owner";
      previous.ownerDecision = "pending";
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.directions[0].territory = "rewritten-after-owner-preview";
      return validateCraftTransition(previous, next);
    },
    "directions",
  );
  runCase(
    "terminal evidence rejects symlink escapes",
    () => {
      const temporaryRoot = mkdtempSync(join(tmpdir(), "sanchika-craft-"));
      try {
        const evidenceDirectory = join(
          temporaryRoot,
          `${baseRunRoot}/evidence`,
        );
        mkdirSync(evidenceDirectory, { recursive: true });
        const outside = join(temporaryRoot, "outside.json");
        writeFileSync(outside, "{}\n");
        symlinkSync(outside, join(evidenceDirectory, "escape.json"));
        const run = structuredClone(baseRun);
        run.directions[0].artifactRefs = [
          `${baseRunRoot}/evidence/escape.json`,
        ];
        return validateCraftRun(run, validators, { repoRoot: temporaryRoot });
      } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
      }
    },
    "directions.0.artifactRefs.0",
  );
  runCase(
    "manifest rejects mutable canonical instruction sources",
    () => {
      const manifest = readBaseManifest();
      manifest.sources.canonicalSkill = "skills/sanchika-craft/SKILL.md";
      return validateInstructionManifest(manifest, baseRun, repoRoot);
    },
    "instructionManifest.sources.canonicalSkill",
  );
  runCase(
    "calibration rejects unknown reviewer roles",
    () => {
      const temporaryRoot = mkdtempSync(join(tmpdir(), "sanchika-calibration-"));
      try {
        const metadata = JSON.parse(
          readFileSync(
            join(repoRoot, "skills/sanchika-craft/assets/calibration/metadata.json"),
            "utf8",
          ),
        );
        metadata.controls[1].relevantRoles = ["brand", "typo-role"];
        for (const control of metadata.controls)
          writeFileSync(join(temporaryRoot, control.file), "fixture\n");
        writeFileSync(
          join(temporaryRoot, "metadata.json"),
          `${JSON.stringify(metadata, null, 2)}\n`,
        );
        return validateCalibrationPack(temporaryRoot);
      } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
      }
    },
    "calibration.generic-ai-saas.relevantRoles",
  );
  runCase(
    "later phases retain owner-gate consensus",
    () =>
      validate((run) => {
        run.phase = "build";
        run.status = "active";
        run.ownerDecision = "approved";
        run.selectedDirectionId = primaryDirectionId;
        delete run.stopReason;
        run.reviews = run.reviews.filter(
          (review) => review.role !== "accessibility",
        );
      }),
    "reviews",
  );
  runCase(
    "persisted run uses its calibration snapshot",
    () => {
      const metadata = JSON.parse(
        readFileSync(
          join(repoRoot, "skills/sanchika-craft/assets/calibration/metadata.json"),
          "utf8",
        ),
      );
      metadata.controls[1].seededFailures.push("run-local-required-failure");
      return validateCraftRun(baseRun, validators, {
        repoRoot,
        calibrationMetadata: metadata,
      });
    },
    "reviews.0.calibration.detectedFailures",
  );
  runCase(
    "manifest source roles cannot alias one snapshot",
    () => {
      const manifest = readBaseManifest();
      manifest.sources.protocol = manifest.sources.canonicalSkill;
      manifest.hashes.protocol = manifest.hashes.canonicalSkill;
      return validateInstructionManifest(manifest, baseRun, repoRoot);
    },
    "instructionManifest.sources.protocol",
  );
  runCase(
    "rebrief preserves prior-round directions",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "review";
      previous.status = "active";
      previous.ownerDecision = "pending";
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "shape";
      next.ownerDecision = "rebrief";
      next.reviewRound = 2;
      next.directions = next.directions.slice(1);
      return validateCraftTransition(previous, next);
    },
    "directions",
  );
  runCase(
    "later transitions preserve prior-round directions",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "shape";
      previous.status = "active";
      previous.ownerDecision = "rebrief";
      previous.reviewRound = 2;
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "explore";
      next.ownerDecision = "pending";
      next.directions[0].territory = "rewritten-old-round";
      return validateCraftTransition(previous, next);
    },
    "directions",
  );
  runCase(
    "briefs remain frozen outside rebrief",
    () => {
      const previous = structuredClone(baseRun);
      previous.phase = "review";
      previous.status = "active";
      previous.ownerDecision = "pending";
      delete previous.stopReason;
      const next = structuredClone(previous);
      next.phase = "owner_gate";
      next.status = "awaiting_owner";
      next.trustBrief.surface = "/weakened-after-review";
      return validateCraftTransition(previous, next);
    },
    "trustBrief",
  );
  runCase(
    "capability stop requires a resume action",
    () =>
      validate((run) => {
        run.phase = "review";
        run.status = "stopped";
        run.ownerDecision = "pending";
        run.stopReason = "capability_blocked";
        delete run.nextAction;
      }),
    "nextAction",
  );
  runCase(
    "completion requires distinct production approval",
    () =>
      validate((run) => {
        run.phase = "verify";
        run.status = "complete";
        run.ownerDecision = "approved";
        run.selectedDirectionId = primaryDirectionId;
        run.productionApproval = null;
        run.evidenceLoop.decision = "ready-for-consumer-pr";
        delete run.stopReason;
        const gate = {
          status: "passed",
          artifact: primaryArtifact,
        };
        run.productionEvidence = {
          repositoryGates: gate,
          browserAccessibilityMatrix: gate,
          rollbackEvidence: gate,
          postDeploySmoke: gate,
          mobileMeasurements: [1, 2, 3].map((number) => ({
            runId: `run-${number}`,
            profileId: "mobile-v1",
            coldCache: true,
            lcpMs: 1200,
            cls: 0,
          })),
        };
      }),
    "productionApproval",
  );
  runCase(
    "production completion requires every copy review role",
    () =>
      validate((run) => {
        makeComplete(run, { includeCopyReviews: false });
      }),
    "reviews",
  );
  runCase(
    "production completion accepts distinct calibrated copy reviewers",
    () =>
      validate((run) => {
        makeComplete(run);
      }),
    null,
  );
  runCase(
    "production completion rejects reused copy reviewer identities",
    () =>
      validate((run) => {
        makeComplete(run);
        for (const review of run.reviews.filter((item) =>
          ["practitioner", "developer", "claims", "voice"].includes(item.role),
        ))
          review.reviewerId = "copy-reviewer-01";
      }),
    "reviews",
  );
  runCase(
    "calibration authenticates control bytes",
    () => {
      const source = join(
        repoRoot,
        "skills/sanchika-craft/assets/calibration",
      );
      const temporaryRoot = mkdtempSync(join(tmpdir(), "sanchika-calibration-"));
      try {
        const metadata = JSON.parse(
          readFileSync(join(source, "metadata.json"), "utf8"),
        );
        for (const control of metadata.controls)
          copyFileSync(
            join(source, control.file),
            join(temporaryRoot, control.file),
          );
        writeFileSync(
          join(temporaryRoot, metadata.controls[0].file),
          "not-a-webp\n",
        );
        writeFileSync(
          join(temporaryRoot, "metadata.json"),
          `${JSON.stringify(metadata, null, 2)}\n`,
        );
        return validateCalibrationPack(temporaryRoot);
      } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
      }
    },
    "calibration.current-baseline.sha256",
  );
  runCase(
    "calibration controls require distinct canonical artifacts",
    () => {
      const source = join(
        repoRoot,
        "skills/sanchika-craft/assets/calibration",
      );
      const temporaryRoot = mkdtempSync(join(tmpdir(), "sanchika-calibration-"));
      try {
        const metadata = JSON.parse(
          readFileSync(join(source, "metadata.json"), "utf8"),
        );
        for (const control of metadata.controls)
          copyFileSync(
            join(source, control.file),
            join(temporaryRoot, control.file),
          );
        metadata.controls[1].file = metadata.controls[0].file;
        metadata.controls[1].sha256 = metadata.controls[0].sha256;
        writeFileSync(
          join(temporaryRoot, "metadata.json"),
          `${JSON.stringify(metadata, null, 2)}\n`,
        );
        return validateCalibrationPack(temporaryRoot);
      } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
      }
    },
    "calibration.generic-ai-saas.file",
  );
  runCase(
    "capability-blocked review may persist unavailable isolation",
    () =>
      validate((run) => {
        run.phase = "review";
        run.status = "stopped";
        run.ownerDecision = "pending";
        run.stopReason = "capability_blocked";
        run.capabilities.isolatedReview = false;
        run.nextAction = "Restore isolated reviewer capacity and resume review.";
      }),
    null,
  );
  runCase(
    "manifest authenticates the without-skill control",
    () => {
      const manifest = readBaseManifest();
      manifest.plainRequestControl.sha256 = "0".repeat(64);
      return validateInstructionManifest(manifest, baseRun, repoRoot);
    },
    "instructionManifest.plainRequestControl.sha256",
  );
  runCase(
    "manifest requires its supported schema version",
    () => {
      const manifest = readBaseManifest();
      manifest.schemaVersion = 999;
      return validateInstructionManifest(manifest, baseRun, repoRoot);
    },
    "instructionManifest.schemaVersion",
  );
  runCase(
    "manifest requires an explicit schema version",
    () => {
      const manifest = readBaseManifest();
      delete manifest.schemaVersion;
      return validateInstructionManifest(manifest, baseRun, repoRoot);
    },
    "instructionManifest.schemaVersion",
  );
  runCase(
    "manifest rejects retained counterfactual code",
    () => {
      const manifest = readBaseManifest();
      manifest.plainRequestControl.codeRetained = true;
      return validateInstructionManifest(manifest, baseRun, repoRoot);
    },
    "instructionManifest.plainRequestControl.codeRetained",
  );
  runCase(
    "terminal references require evidence digests",
    () =>
      validate((run) => {
        delete run.evidenceDigests[primaryArtifact];
      }),
    "directions.0.artifactRefs.0",
  );
  runCase(
    "advanced run manifest requires a prior snapshot",
    () => {
      const manifest = readBaseManifest();
      delete manifest.transition;
      return validateInstructionManifest(manifest, baseRun, repoRoot);
    },
    "instructionManifest.transition.previousState",
  );
  runCase(
    "advanced history cannot downgrade to initial shape",
    () => {
      const run = structuredClone(baseRun);
      run.phase = "shape";
      run.status = "active";
      run.ownerDecision = "pending";
      delete run.stopReason;
      const manifest = readBaseManifest();
      delete manifest.transition;
      return validateInstructionManifest(manifest, run, repoRoot);
    },
    "instructionManifest.transition.previousState",
  );
  runCase(
    "retained manifest transition survives a replacement shape reset",
    () => {
      const run = structuredClone(baseRun);
      run.phase = "shape";
      run.status = "active";
      run.ownerDecision = "pending";
      run.reviewRound = 1;
      run.directions = [];
      run.iterations = [];
      run.reviews = [];
      delete run.stopReason;
      const manifest = readBaseManifest();
      return requiresTransitionEvidence(run, manifest)
        ? []
        : [{ field: "transitionEvidence", reason: "missing" }];
    },
    null,
  );
  runCase(
    "replacement shape reset rejects a malformed retained transition",
    () => {
      const run = structuredClone(baseRun);
      run.phase = "shape";
      run.status = "active";
      run.ownerDecision = "pending";
      run.reviewRound = 1;
      run.directions = [];
      run.iterations = [];
      run.reviews = [];
      delete run.stopReason;
      const manifest = readBaseManifest();
      manifest.transition = null;
      return validateInstructionManifest(manifest, run, repoRoot);
    },
    "instructionManifest.transition.previousState",
  );
  runCase(
    "calibration retains canonical seeded failures",
    () => {
      const source = join(
        repoRoot,
        "skills/sanchika-craft/assets/calibration",
      );
      const temporaryRoot = mkdtempSync(join(tmpdir(), "sanchika-calibration-"));
      try {
        const metadata = JSON.parse(
          readFileSync(join(source, "metadata.json"), "utf8"),
        );
        metadata.controls[1].seededFailures = [];
        for (const control of metadata.controls)
          copyFileSync(
            join(source, control.file),
            join(temporaryRoot, control.file),
          );
        writeFileSync(
          join(temporaryRoot, "metadata.json"),
          `${JSON.stringify(metadata, null, 2)}\n`,
        );
        return validateCalibrationPack(temporaryRoot);
      } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
      }
    },
    "calibration.generic-ai-saas.seededFailures",
  );
  runCase(
    "owner-rejected stop requires rejected decision",
    () =>
      validate((run) => {
        run.ownerDecision = "pending";
      }),
    "ownerDecision",
  );
  runCase(
    "persisted run rejects nested template placeholders",
    () =>
      validate((run) => {
        run.trustBrief.id = "template-trust-brief";
      }),
    "run",
  );
  runCase(
    "earlier adjacent failures still require rebrief",
    () =>
      validate((run) => {
        run.phase = "review";
        run.status = "active";
        run.ownerDecision = "pending";
        delete run.stopReason;
        for (const [failingCriterion, attempt] of [
          ["distinctiveness", 1],
          ["distinctiveness", 2],
          ["trust", 1],
        ])
          run.iterations.push({
            reviewRound: 1,
            failingCriterion,
            changeHypothesis: `Attempt ${attempt}`,
            invariants: ["trust boundary"],
            artifactRefs: [
              primaryArtifact,
            ],
            result: "not_improved",
          });
      }),
    "iterations",
  );
  runCase(
    "ready-for-consumer decision requires complete status",
    () =>
      validate((run) => {
        run.evidenceLoop.decision = "ready-for-consumer-pr";
        run.evidenceLoop.adoptionEvidence.status = "verified";
        run.evidenceLoop.residualRisks = [
          "AI proxy evidence remains distinct from user validation.",
        ];
      }),
    "evidenceLoop.decision",
  );
  runCase(
    "mobile evidence requires a mobile viewport artifact",
    () =>
      validate((run) => {
        run.evidenceLoop.renderEvidence.find(
          (evidence) => evidence.type === "mobile-screenshot",
        ).artifact =
          withoutSkillArtifact;
      }),
    "evidenceLoop.renderEvidence.1.artifact",
  );
  runCase(
    "incomplete previous argument is rejected",
    () => {
      try {
        parseArguments(["state.json", "--previous"]);
        return [];
      } catch {
        return [{ field: "arguments", reason: "rejected" }];
      }
    },
    "arguments",
  );

  return { count: cases.length, failures };
}

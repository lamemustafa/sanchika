import {
  parseArguments,
  validateCraftRun,
  validateCraftTransition,
} from "../../skills/sanchika-craft/scripts/validate-run.mjs";

export function runCraftRunFixtures({ baseRun, validators }) {
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
    return validateCraftRun(run, validators);
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
          .vetoes.push("direction-alpha remains blocked");
      }),
    "directions.0.vetoes",
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

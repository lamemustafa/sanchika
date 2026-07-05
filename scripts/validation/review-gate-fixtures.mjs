#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const checker = fileURLToPath(new URL("../check-pr-review-gate.mjs", import.meta.url));
const fixturesRoot = fileURLToPath(new URL("./fixtures/review-gate/", import.meta.url));

const cases = [
  {
    name: "owner requested changes then commented",
    fixture: "owner-requested-changes-then-comment.json",
    ok: false,
    outputIncludes: "Requested-changes reviews",
  },
  {
    name: "owner requested changes then approved",
    fixture: "owner-requested-changes-then-approval.json",
    ok: true,
    outputIncludes: "PR review gate passed",
  },
  {
    name: "current-head requested changes then stale approval",
    fixture: "current-head-requested-changes-then-stale-approval.json",
    ok: false,
    outputIncludes: "Requested-changes reviews",
  },
  {
    name: "drive-by requested changes",
    fixture: "driveby-requested-changes.json",
    ok: true,
    outputIncludes: "PR review gate passed",
  },
];

const failures = [];

for (const testCase of cases) {
  const result = spawnSync(
    process.execPath,
    [
      checker,
      "--repo",
      "lamemustafa/sanchika",
      "--pr",
      "1",
      "--fixture",
      `${fixturesRoot}${testCase.fixture}`,
      "--strict-head-review",
      "--required-review-author",
      "chatgpt-codex-connector",
    ],
    { cwd: root, encoding: "utf8" },
  );

  const passedExitExpectation = testCase.ok ? result.status === 0 : result.status !== 0;
  const output = `${result.stdout}\n${result.stderr}`;
  const passedOutputExpectation = output.includes(testCase.outputIncludes);

  if (!passedExitExpectation || !passedOutputExpectation) {
    failures.push(
      [
        `${testCase.name} failed`,
        `expected ok=${testCase.ok}, status=${result.status}`,
        `expected output fragment: ${testCase.outputIncludes}`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log(`Review gate fixture checks passed (${cases.length} cases).`);

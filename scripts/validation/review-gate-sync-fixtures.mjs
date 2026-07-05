#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const syncScript = fileURLToPath(new URL("../sync-review-gate-status.mjs", import.meta.url));

const cases = [
  {
    name: "write success for missing Codex review",
    graphHead: "head-sha",
    ok: true,
    expectedStatuses: ["pending", "success"],
    expectedDescription: "No active review blockers; current-head Codex review missing.",
  },
  {
    name: "write failure for expected head mismatch",
    graphHead: "other-sha",
    ok: false,
    expectedStatuses: ["pending", "failure"],
    expectedOutput: "Expected head head-sha",
  },
];

const failures = [];

for (const testCase of cases) {
  const harnessDir = mkdtempSync(join(tmpdir(), "sanchika-review-gate-sync-"));
  const ghPath = join(harnessDir, "gh");
  const logPath = join(harnessDir, "statuses.jsonl");
  writeFileSync(ghPath, fakeGhSource(), { mode: 0o755 });
  chmodSync(ghPath, 0o755);

  const result = spawnSync(
    process.execPath,
    [
      syncScript,
      "--repo",
      "lamemustafa/sanchika",
      "--pr",
      "99",
      "--strict-head-review",
      "--allow-missing-head-review",
      "--wait-head-review-ms",
      "0",
      "--required-review-author",
      "chatgpt-codex-connector",
      "--run-url",
      "https://example.test/review-gate",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        FAKE_GH_GRAPH_HEAD: testCase.graphHead,
        FAKE_GH_STATUS_LOG: logPath,
        PATH: `${harnessDir}:${process.env.PATH}`,
      },
    },
  );

  const output = `${result.stdout}\n${result.stderr}`;
  const statuses = readStatusLog(logPath);
  const actualStates = statuses.map((status) => status.state);

  if ((testCase.ok ? result.status !== 0 : result.status === 0) || actualStates.join(",") !== testCase.expectedStatuses.join(",")) {
    failures.push(`${testCase.name} expected status ${testCase.ok ? 0 : "non-zero"} and states ${testCase.expectedStatuses.join(",")}, got status ${result.status} and states ${actualStates.join(",")}\n${output}`);
    continue;
  }

  if (testCase.expectedDescription && statuses.at(-1)?.description !== testCase.expectedDescription) {
    failures.push(`${testCase.name} expected final description "${testCase.expectedDescription}", got "${statuses.at(-1)?.description}"`);
  }

  if (testCase.expectedOutput && !output.includes(testCase.expectedOutput)) {
    failures.push(`${testCase.name} expected output fragment "${testCase.expectedOutput}"\n${output}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log(`Review gate sync fixture checks passed (${cases.length} cases).`);

function readStatusLog(logPath) {
  try {
    return readFileSync(logPath, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function fakeGhSource() {
  return `#!/usr/bin/env node
const { appendFileSync } = require("node:fs");
const args = process.argv.slice(2);

if (args[0] === "pr" && args[1] === "view") {
  process.stdout.write(JSON.stringify({ number: 99, headRefOid: "head-sha", state: "OPEN" }));
  process.exit(0);
}

if (args[0] === "api" && args[1] === "graphql") {
  process.stdout.write(JSON.stringify({
    data: {
      repository: {
        pullRequest: {
          headRefOid: process.env.FAKE_GH_GRAPH_HEAD || "head-sha",
          reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] },
          reviews: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: [
              {
                state: "COMMENTED",
                submittedAt: "2026-01-01T00:00:00Z",
                url: "https://example.test/reviews/maintainer-comment",
                author: { login: "maintainer" },
                authorAssociation: "OWNER",
                commit: { oid: process.env.FAKE_GH_GRAPH_HEAD || "head-sha" },
              },
            ],
          },
        },
      },
    },
  }));
  process.exit(0);
}

if (args[0] === "api" && args[1] === "repos/lamemustafa/sanchika/commits/head-sha/statuses") {
  process.stdout.write("[]");
  process.exit(0);
}

if (args[0] === "api" && args.includes("repos/lamemustafa/sanchika/statuses/head-sha")) {
  const status = {};
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "-f") continue;
    const [key, ...valueParts] = String(args[index + 1] || "").split("=");
    status[key] = valueParts.join("=");
    index += 1;
  }
  appendFileSync(process.env.FAKE_GH_STATUS_LOG, JSON.stringify(status) + "\\n");
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
}

console.error("unexpected fake gh args: " + JSON.stringify(args));
process.exit(1);
`;
}

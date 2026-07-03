export function validateCiWorkflow({ ciWorkflow, fail }) {
  if (!ciWorkflow.includes("\npermissions:\n  contents: read\n")) {
    fail("CI workflow must set top-level contents: read permissions");
  }

  if (/\bwrite-all\b/.test(ciWorkflow) || /^\s*[\w-]+:\s*write\b/m.test(ciWorkflow)) {
    fail("CI workflow must not request write permissions outside a future publish workflow");
  }

  if (ciWorkflow.includes("pull_request_target")) {
    fail("CI workflow must not use pull_request_target for untrusted code");
  }

  const pinnedActions = {
    "actions/checkout": "34e114876b0b11c390a56381ad16ebd13914f8d5",
    "pnpm/action-setup": "f40ffcd9367d9f12939873eb1018b921a783ffaa",
    "actions/setup-node": "49933ea5288caeca8642d1e84afbd3f7d6820020",
  };

  for (const [action, sha] of Object.entries(pinnedActions)) {
    if (!ciWorkflow.includes(`uses: ${action}@${sha}`)) {
      fail(`CI workflow must pin ${action} to ${sha}`);
    }
  }

  for (const [, actionRef] of ciWorkflow.matchAll(/uses:\s+([^\s#]+)/g)) {
    if (!/@[0-9a-f]{40}$/.test(actionRef)) {
      fail(`CI workflow action ${actionRef} must use a full-length commit SHA`);
    }
  }

  for (const requiredFragment of [
    "timeout-minutes: 10",
    "version: 10.28.2",
    "node-version: 24",
    "run: pnpm install --frozen-lockfile",
    "run: pnpm run verify",
  ]) {
    if (!ciWorkflow.includes(requiredFragment)) {
      fail(`CI workflow must include ${requiredFragment}`);
    }
  }
}

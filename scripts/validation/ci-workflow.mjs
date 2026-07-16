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

  if (!/uses:\s+actions\/checkout@[0-9a-f]{40}\s+with:\s+persist-credentials:\s+false/s.test(ciWorkflow)) {
    fail("CI workflow checkout must set persist-credentials: false");
  }

  if (!/push:\s+branches:\s+- master/s.test(ciWorkflow)) {
    fail("CI workflow must run branch pushes for the public master branch");
  }

  const pinnedActions = {
    "actions/checkout": "9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0",
    "pnpm/action-setup": "b906affcce14559ad1aafd4ab0e942779e9f58b1",
    "actions/setup-node": "48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
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
    "node-version-file: .node-version",
    "run: pnpm install --frozen-lockfile --ignore-scripts",
    "run: pnpm run verify",
    "run: pnpm publish:tarball-check",
  ]) {
    if (!ciWorkflow.includes(requiredFragment)) {
      fail(`CI workflow must include ${requiredFragment}`);
    }
  }
}

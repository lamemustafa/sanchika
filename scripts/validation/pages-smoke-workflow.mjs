export function validatePagesSmokeWorkflow({ pagesSmokeWorkflow, fail }) {
  const activeLines = pagesSmokeWorkflow
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, ""))
    .filter((line) => line.trim().length > 0);
  const activeWorkflow = activeLines.join("\n");

  for (const requiredFragment of [
    "name: Pages smoke",
    "workflow_dispatch:",
    "schedule:",
    "cron: \"17 4 * * *\"",
    "contents: read",
    "if: github.ref == 'refs/heads/master'",
    "persist-credentials: false",
    "node-version: 24",
    "run: node scripts/check-pages-smoke.mjs",
    "SANCHIKA_PAGES_URL: https://sanchika.complyeaze.com/",
  ]) {
    if (!pagesSmokeWorkflow.includes(requiredFragment)) {
      fail(`Pages smoke workflow must include ${requiredFragment}`);
    }
  }

  for (const forbiddenFragment of [
    "pages: write",
    "id-token: write",
    "pull_request_target:",
    "workflow_run:",
    "NPM_TOKEN",
    "NODE_AUTH_TOKEN",
    "npm publish",
    "pnpm install",
  ]) {
    if (activeWorkflow.includes(forbiddenFragment)) {
      fail(`Pages smoke workflow must not include ${forbiddenFragment}`);
    }
  }

  const pinnedActions = {
    "actions/checkout": "9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0",
    "actions/setup-node": "48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
  };

  for (const [action, sha] of Object.entries(pinnedActions)) {
    if (!pagesSmokeWorkflow.includes(`uses: ${action}@${sha}`)) {
      fail(`Pages smoke workflow must pin ${action} to ${sha}`);
    }
  }

  for (const [, actionRef] of pagesSmokeWorkflow.matchAll(/uses:\s+([^\s#]+)/g)) {
    if (!/@[0-9a-f]{40}$/.test(actionRef)) {
      fail(`Pages smoke workflow action ${actionRef} must use a full-length commit SHA`);
    }
  }
}

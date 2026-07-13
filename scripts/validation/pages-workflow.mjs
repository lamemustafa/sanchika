export function validatePagesWorkflow({ pagesWorkflow, fail }) {
  const activeLines = pagesWorkflow
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, ""))
    .filter((line) => line.trim().length > 0);
  const activeWorkflow = activeLines.join("\n");

  for (const requiredFragment of [
    "name: Pages",
    "workflow_dispatch:",
    "push:",
    "branches:",
    "- master",
    "paths:",
    "- \".github/workflows/pages.yml\"",
    "- \"apps/gallery/**\"",
    "- \"packages/**\"",
    "- \"pnpm-workspace.yaml\"",
    "- \"scripts/**\"",
    "contents: read",
    "pages: write",
    "id-token: write",
    "environment:",
    "name: github-pages",
    "url: ${{ steps.deployment.outputs.page_url }}",
    "if: github.ref == 'refs/heads/master'",
    "persist-credentials: false",
    "run: pnpm install --frozen-lockfile --ignore-scripts",
    "run: pnpm build",
    "run: pnpm gallery:check",
    "path: apps/gallery/dist",
  ]) {
    if (!activeWorkflow.includes(requiredFragment)) {
      fail(`Pages workflow must include ${requiredFragment}`);
    }
  }

  for (const line of activeLines) {
    const match = line.match(/^\s*retention-days:\s*(.*?)\s*$/);
    if (!match) continue;

    const rawValue = match[1];
    const value = rawValue
      .match(/^(?:"(\d+)"|'(\d+)'|(\d+))$/)
      ?.slice(1)
      .find(Boolean);
    if (!value || Number(value) < 1 || Number(value) > 7) {
      fail(
        "Pages workflow ordinary build evidence retention-days must be a literal integer from 1 to 7",
      );
    }
  }

  for (const forbiddenTrigger of [
    "pull_request:",
    "pull_request_target:",
    "schedule:",
    "workflow_run:",
  ]) {
    if (activeLines.some((line) => line.trim() === forbiddenTrigger)) {
      fail(`Pages workflow must not include ${forbiddenTrigger}`);
    }
  }

  for (const forbiddenFragment of [
    "NPM_TOKEN",
    "NODE_AUTH_TOKEN",
    "npm publish",
  ]) {
    if (activeWorkflow.includes(forbiddenFragment)) {
      fail(`Pages workflow must not include ${forbiddenFragment}`);
    }
  }

  if (!activeWorkflow.includes("workflow_dispatch:") || !activeWorkflow.includes("push:")) {
    fail("Pages workflow must support manual dispatch and scoped master push deployment");
  }

  if (activeWorkflow.includes("run: pnpm gallery:build")) {
    fail("Pages workflow must not rebuild the gallery after pnpm build");
  }

  const pinnedActions = {
    "actions/checkout": "9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0",
    "pnpm/action-setup": "b906affcce14559ad1aafd4ab0e942779e9f58b1",
    "actions/setup-node": "48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
    "actions/configure-pages": "983d7736d9b0ae728b81ab479565c72886d7745b",
    "actions/upload-pages-artifact": "56afc609e74202658d3ffba0e8f6dda462b719fa",
    "actions/deploy-pages": "d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e",
  };

  for (const [action, sha] of Object.entries(pinnedActions)) {
    if (!activeWorkflow.includes(`uses: ${action}@${sha}`)) {
      fail(`Pages workflow must pin ${action} to ${sha}`);
    }
  }

  for (const [, actionRef] of activeWorkflow.matchAll(/uses:\s+([^\s#]+)/g)) {
    if (!/@[0-9a-f]{40}$/.test(actionRef)) {
      fail(`Pages workflow action ${actionRef} must use a full-length commit SHA`);
    }
  }
}

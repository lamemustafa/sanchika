export function validatePagesWorkflow({ pagesWorkflow, fail }) {
  for (const requiredFragment of [
    "name: Pages",
    "workflow_dispatch:",
    "contents: read",
    "pages: write",
    "id-token: write",
    "environment:",
    "name: github-pages",
    "url: ${{ steps.deployment.outputs.page_url }}",
    "persist-credentials: false",
    "run: pnpm install --frozen-lockfile --ignore-scripts",
    "run: pnpm build",
    "run: pnpm gallery:build",
    "run: pnpm gallery:check",
    "path: dist/gallery",
  ]) {
    if (!pagesWorkflow.includes(requiredFragment)) {
      fail(`Pages workflow must include ${requiredFragment}`);
    }
  }

  for (const forbiddenFragment of [
    "push:",
    "pull_request:",
    "pull_request_target:",
    "schedule:",
    "workflow_run:",
    "NPM_TOKEN",
    "NODE_AUTH_TOKEN",
    "npm publish",
  ]) {
    if (pagesWorkflow.includes(forbiddenFragment)) {
      fail(`Pages workflow must not include ${forbiddenFragment}`);
    }
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
    if (!pagesWorkflow.includes(`uses: ${action}@${sha}`)) {
      fail(`Pages workflow must pin ${action} to ${sha}`);
    }
  }

  for (const [, actionRef] of pagesWorkflow.matchAll(/uses:\s+([^\s#]+)/g)) {
    if (!/@[0-9a-f]{40}$/.test(actionRef)) {
      fail(`Pages workflow action ${actionRef} must use a full-length commit SHA`);
    }
  }
}

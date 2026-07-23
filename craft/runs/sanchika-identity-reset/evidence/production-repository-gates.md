# S10 production repository gates

The released production surface is the normal gallery build; the rejected
craft-lab route is not shipped.

| Gate | Result | Evidence |
| --- | --- | --- |
| S10 identity PR #52 | passed | GitHub Actions run `30005468476` passed before squash merge `b21141278e1f27a41e2257482515e8a4e736a693`. |
| Pages smoke alignment PR #53 | passed | GitHub Actions run `30005847854` passed before squash merge `4af6a7f1df60423e87c5a21c65e52ab9d5d22e15`. |
| Current `master` CI | passed | GitHub Actions run `30006504279` passed for the `#53` merge head. |
| Normal production artifact check | passed | `pnpm exec astro build`, `pnpm gallery:check`, and `pnpm gallery:smoke` passed after the rejected lab source was removed. |

The production check continues to enforce the exact 61-route shipping set,
asset graph, local-origin policy, copy boundary, artifact budgets, and all
production fixtures. CI remains the authoritative package and hosted-build
gate.

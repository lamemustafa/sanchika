# Repository Settings

These settings apply to the public `lamemustafa/sanchika` GitHub repository.

## Core Settings

- Default branch: `master`.
- Visibility: public.
- Disable wiki.
- Keep issues enabled, but keep blank issues disabled through
  `.github/ISSUE_TEMPLATE/config.yml`.
- Enable private vulnerability reporting before inviting external security
  reports.
- Add topics after the first push: `design-system`, `accessibility`,
  `typescript`, `compliance`, and `tokens`.
- Apply the issue-template labels so GitHub forms add them reliably: `bug`,
  `enhancement`, `conduct`, and `question`.
- Keep `CODEOWNERS` active so pull requests request `@lamemustafa`.
- Keep Dependabot enabled for monthly npm and GitHub Actions update pull
  requests, grouped into one multi-ecosystem dependency hygiene bundle when
  GitHub can combine the updates safely.

## Branch Ruleset

Create a branch ruleset for `master` before accepting external contribution:

- Require pull requests before merging.
- Require status checks to pass before merging.
- required status checks: use the exact GitHub check name for CI `verify` after
  the first run records it, plus the `Review gate` status from
  `.github/workflows/review-gate.yml`.
- Pin the `Review gate` status to the GitHub Actions integration ID after the
  default-branch workflow has emitted the context. The repository rulesets API
  accepts `integration_id` on each required status check.
- Require conversation resolution.
- Block force pushes.
- Block branch deletion.
- Do not require code-owner approval while `CODEOWNERS` only names the
  repository owner.
- Restrict bypass actors to the repository owner until maintainers are added.

### Single-Maintainer Bootstrap

`CODEOWNERS` currently assigns all paths to `@lamemustafa`. Until a second real
maintainer or team exists, owner-authored PRs use the owner-bypass path. That
bypass is intentional only for the approval impossibility; required status
checks, automated review checks, conversation resolution, and squash history
remain required, while required code-owner approval stays disabled. Do not add
placeholder code owners that cannot approve.

Generate the API payload with:

```bash
pnpm github:ruleset --required-check "<github-check-context>" \
  --owner-bypass-id "$(gh api user --jq .id)" \
  --review-gate-integration-id 15368
```

Apply it only after `master` exists and GitHub has recorded the first CI check
context.

Apply and verify labels with:

```bash
pnpm github:labels -- --apply
pnpm github:labels -- --verify
```

Verify repository settings, topics, refs, and the applied ruleset with:

```bash
pnpm github:verify --required-check "<github-check-context>" \
  --owner-bypass-id "$(gh api user --jq .id)" \
  --review-gate-integration-id 15368
```

## Pull Request Policy

- Require at least one approving review only after a second real maintainer or
  team exists.
- Require review from CODEOWNERS only after `CODEOWNERS` can name a real
  maintainer other than the PR author.
- Require the `Review gate` status so current-head unresolved review threads and
  requested-changes reviews block merges independently of approval count.
- Dismiss stale approvals after changes.
- Allow squash merges for normal contribution history.
- Do not allow direct pushes to `master` after bootstrap.

## Security And Publishing

- CI stays read-only with `contents: read`.
- `id-token: write` stays out of CI and belongs only in the future tag-only
  publish workflow or the GitHub Pages deployment workflow.
- GitHub Pages uses GitHub Actions as the source and deploys only the static
  `dist/gallery` artifact.
- npm releases use Trusted Publishing and no long-lived npm publish tokens.
- Security reports, PAN, GSTIN, Aadhaar, credentials, cookies, OTPs, notices,
  screenshots, local file paths, and real taxpayer data must not be posted in
  public issues or pull requests.

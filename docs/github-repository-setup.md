# GitHub Repository Setup

Sanchika's public source repository is `lamemustafa/sanchika`.

## Creation Contract

- Create the repository under the `lamemustafa` account until a ComplyEaze
  organization account exists.
- Visibility must be public.
- Do not auto-add a README, license, or .gitignore. The local Sanchika Git
  history owns those files; GitHub auto-init creates avoidable merge conflicts.
- Keep issues enabled for public project discussion and disable the wiki so
  durable guidance stays in versioned repository files.
- Use this command for an empty remote:

```bash
gh repo create lamemustafa/sanchika --public \
  --description "AI-native design system SDK for compliance-grade interfaces." \
  --disable-wiki
```

## Initial Push Gate

The public repository already exists. Keep this section as the historical
bootstrap contract for any future re-created remote or organization transfer.
Before exporting local history to a new public remote, run:

```bash
pnpm verify
pnpm publish:tarball-check
node scripts/check-workflow-preflight.mjs --allow-new-repo-bootstrap
```

The working tree must be clean, and the maintainer must explicitly approve the
public-history push because it publishes all local commits and repository
contents.

For the initial repository creation only, after approval for a new remote, push
the verified local history:

```bash
git push -u origin HEAD:master
```

The command creates the public `master` branch from the currently verified local
history. Do not use it for routine work after `origin/master` exists. Task
branches should be pushed only when they are still active and needed for review.

## Repository Settings

- Confirm `origin` is `https://github.com/lamemustafa/sanchika.git`.
- Keep `master` as the public default branch.
- Enable private vulnerability reporting before encouraging external security
  reports.
- Keep `.github/workflows/ci.yml` read-only with `contents: read`.
- Keep checkout credentials disabled in CI with `persist-credentials: false`.
- Keep the future publish workflow separate from CI and limited to tag pushes.
- Keep `id-token: write` out of CI. It is allowed only in the future publish
  workflow and the Pages deployment workflow.
- Enable GitHub Pages with GitHub Actions as the source before manually running
  `.github/workflows/pages.yml`.
- Do not add the `sanchika.complyeaze.com` custom domain or a `CNAME` file
  until DNS and GitHub Pages domain verification are ready.
- Use npm Trusted Publishing for package releases and no long-lived npm publish
  tokens.
- Add repository topics such as `design-system`, `accessibility`, `typescript`,
  `compliance`, and `tokens` after the first push.
- Apply the managed issue labels before inviting public issue intake:

```bash
pnpm github:labels -- --apply
pnpm github:labels -- --verify
```

## Branch Ruleset

Create a branch ruleset for `master` before accepting external contribution:

- Require pull requests before merging.
- Require status checks to pass before merging.
- Required status checks should include the CI `verify` job once GitHub records
  its check name and the `Review gate` status from
  `.github/workflows/review-gate.yml`.
- Pin the `Review gate` required status to the GitHub Actions integration ID
  after the default-branch workflow emits the context; rulesets support
  `integration_id` per required status check.
- Block force pushes.
- Block branch deletion.
- Require conversation resolution.
- Do not enable required code-owner approval while `CODEOWNERS` only names the
  repository owner.
- Limit bypass actors to the repository owner until maintainers are added.

### Single-Maintainer Bootstrap

`CODEOWNERS` currently routes all paths to `@lamemustafa`. While Sanchika has
only one trusted maintainer, owner-authored PRs cannot receive an independent
code-owner approval. The intended bootstrap path is owner bypass with all
required status checks, automated review checks, and conversation resolution
still enforced, while required code-owner approval stays disabled. Add a second
real maintainer or team before enabling required code-owner approval or removing
the owner-bypass path; do not add placeholder reviewers that cannot approve.

If GitHub's check name changes after the first CI run, update the branch ruleset
to the exact required status checks reported by GitHub. Keep `Review gate`
required so current-head unresolved review threads and requested-changes reviews
block merges.

Render the ruleset payload from the verified local repo so the post-push
configuration stays reproducible:

```bash
pnpm github:ruleset --required-check "<github-check-context>" \
  --owner-bypass-id "$(gh api user --jq .id)" \
  --review-gate-integration-id 15368 \
  > /tmp/sanchika-master-ruleset.json
gh api repos/lamemustafa/sanchika/rulesets \
  --method POST \
  --input /tmp/sanchika-master-ruleset.json
```

Use the exact check context from GitHub's first CI run. Do not guess it from the
workflow file name.

After the ruleset is applied, verify the public repository state:

```bash
pnpm github:verify --required-check "<github-check-context>" \
  --owner-bypass-id "$(gh api user --jq .id)" \
  --review-gate-integration-id 15368
```

## References

- GitHub repository creation:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- GitHub CLI `gh repo create`:
  https://cli.github.com/manual/gh_repo_create
- GitHub rulesets:
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
- GitHub security policy and private vulnerability reporting:
  https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository
- npm Trusted Publishing:
  https://docs.npmjs.com/trusted-publishers/

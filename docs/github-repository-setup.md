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

Before exporting local history to the public remote, run:

```bash
pnpm verify
pnpm publish:tarball-check
node scripts/check-workflow-preflight.mjs --allow-new-repo-bootstrap
```

The working tree must be clean, and the maintainer must explicitly approve the
public-history push because it publishes all local commits and repository
contents.

After approval, push the verified local history:

```bash
git push -u origin HEAD:master
git push -u origin tapish-codex/sanchika-sdk-hardening
```

The first command creates the public `master` branch from the currently verified
local history. The second command keeps the task branch traceable while setup is
still active.

## Repository Settings

- Confirm `origin` is `https://github.com/lamemustafa/sanchika.git`.
- Keep `master` as the public default branch.
- Enable private vulnerability reporting before encouraging external security
  reports.
- Keep `.github/workflows/ci.yml` read-only with `contents: read`.
- Keep checkout credentials disabled in CI with `persist-credentials: false`.
- Keep the future publish workflow separate from CI and limited to tag pushes.
- Do not add `id-token: write` outside the future publish workflow.
- Use npm Trusted Publishing for package releases and no long-lived npm publish
  tokens.
- Add repository topics such as `design-system`, `accessibility`, `typescript`,
  `compliance`, and `tokens` after the first push.

## Branch Ruleset

Create a branch ruleset for `master` before accepting external contribution:

- Require pull requests before merging.
- Require status checks to pass before merging.
- Required status checks should include the CI `verify` job once GitHub records
  its check name.
- Block force pushes.
- Block branch deletion.
- Require conversation resolution.
- Limit bypass actors to the repository owner until maintainers are added.

If GitHub's check name changes after the first CI run, update the branch ruleset
to the exact required status checks reported by GitHub.

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

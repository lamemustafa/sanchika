# Release Policy

Sanchika is pre-1.0 and not published.

## V0 Rules

- Packages remain `private: true` until repository ownership, npm scope, and
  trademark posture are confirmed.
- Public production-readiness claims require at least one real ComplyEaze
  surface consuming Sanchika successfully.
- Release notes must state which product modes are proven and which remain
  documented future consumers.
- Generated build output stays out of source commits.

## Future Publish Gate

Before the first package publish:

1. Confirm the GitHub remote and npm scope.
2. Confirm license and brand/trademark language.
3. Run `pnpm run verify` in a clean checkout.
4. Run `pnpm publish:check` after manifests and publish workflow are changed
   for publishing. It is expected to fail in V0 while packages are private.
5. Run `pnpm publish:tarball-check` after `pnpm build` to prove packed tarballs
   install into a scratch consumer without publishing.
6. Review accessibility claims against actual primitive behavior.
7. Verify no real compliance data exists in docs, examples, tests, or fixtures.
8. Prefer npm Trusted Publishing with GitHub Actions OIDC over long-lived npm
   publish tokens.
9. Keep publish-only permissions, including `id-token: write`, out of CI and in
   a future publish workflow that runs only after repository and npm scope setup.

## Future Trusted Publishing Contract

Do not add this workflow until `lamemustafa/sanchika` exists and the npm scope
decision is confirmed. The intended publisher contract is:

- GitHub owner/repo: `lamemustafa/sanchika`.
- Workflow file: `.github/workflows/publish.yml`, separate from CI.
- Trigger: tag push only. Do not publish from pull requests, branch pushes,
  scheduled workflows, workflow-run chaining, or broad manual dispatch.
- Runner: GitHub-hosted `ubuntu-latest`.
- Build runtime: Node 24 with the repository-pinned pnpm version for install,
  build, verification, and pack checks.
- Publish runtime: npm CLI 11.5.1 or later on Node 22.14.0 or later, matching
  npm Trusted Publishing requirements. Use `npm publish` with `--provenance`
  and OIDC for the publish step, not long-lived npm tokens.
- The publish workflow must set `registry-url` to
  `https://registry.npmjs.org`, set `package-manager-cache: false`, and avoid
  `NPM_TOKEN`, `NODE_AUTH_TOKEN`, or other long-lived npm token secrets.
- The publish workflow must run `pnpm install --frozen-lockfile --ignore-scripts`,
  `pnpm run verify`, `pnpm publish:check`, and
  `pnpm publish:tarball-check` before any package publish.
- Package publishing must target package directories in dependency order:
  `npm publish ./packages/tokens --provenance`,
  `npm publish ./packages/primitives --provenance`,
  `npm publish ./packages/patterns --provenance`, then
  `npm publish ./packages/gallery --provenance`. Never publish the private orchestration root.
- Before publish, package manifests must no longer contain `workspace:*`
  dependencies, and package tarballs must include package-level README and
  LICENSE files.
- Package tarballs must expose built `dist` assets only. Do not publish
  `src/**/*.ts`, source CSS exports, or source maps in the V0 package shape.
- CI remains read-only; only the future publish workflow may request
  `id-token: write`.
- CI action references must stay pinned to full-length commit SHAs. Update those
  pins deliberately after reviewing the upstream action release.

## References

- npm Trusted Publishing:
  https://docs.npmjs.com/trusted-publishers/
- npm provenance statements:
  https://docs.npmjs.com/generating-provenance-statements/
- GitHub private vulnerability reporting:
  https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository

# Release Policy

Sanchika is pre-1.0 and not published to npm. The current stable distribution
model is a reviewed GitHub artifact release.

## V0 Rules

- Source package manifests remain `private: true` at version `0.0.0` until
  repository ownership, npm scope, and trademark posture are confirmed. The
  stable pack pipeline rewrites clean temporary copies to the release version.
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
6. Run `pnpm release:tarballs` to write the verified prerelease tarball bundle
   under `dist/release/` for GitHub release assets or CI-resolvable local
   testing.
7. For an approval-gated stable GitHub release that still avoids npm
   publishing, run `pnpm release:stable-tarballs`. This uses the same pack,
   scratch-consumer, probe, typecheck, manifest, and SHA-256 path as
   `release:tarballs`, but reads the stable version and ordered package set
   from root `release.json`.
8. Review accessibility claims against actual primitive behavior.
9. Verify no real compliance data exists in docs, examples, tests, or fixtures.
10. Prefer npm Trusted Publishing with GitHub Actions OIDC over long-lived npm
   publish tokens.
11. Keep publish-only permissions, including `id-token: write`, out of CI and in
   a future publish workflow that runs only after repository and npm scope setup.

## Packed Tarball Release Bundle

`pnpm release:tarballs` is the V0 prerelease-artifact path before npm
publishing. It builds all packages, creates simulated public package tarballs,
rewrites internal `workspace:*` dependencies to the simulated tarball version,
installs the tarballs into a scratch consumer, runs the consumer probe and
typecheck, and then writes the same verified assets to `dist/release/`.

The ignored `dist/release/manifest.json` records the source commit, simulated
version, package and screenshot filenames, SHA-256 hashes, and the deterministic
`npm pack --json` file inventory for every package. Each inventory records
archive path and byte size and is checked against the package-specific
allowlist. The same bundle emits `dist/release/SHA256SUMS` in dependency order
from the final tarball and screenshot bytes. The completed stable bundle is
exactly eleven flat files under `dist/release/`: three tarballs,
`manifest.json`, `SHA256SUMS`, and six named gallery screenshots. Upload those
eleven files directly as GitHub release assets while the npm scope is private.
The packed-consumer lane verifies both npm installation and an offline pnpm
installation with explicit tarball overrides in an empty temporary store. The
pnpm proof fails if an internal exact-version dependency falls through to the
npm registry.

`pnpm release:stable-tarballs` is the stable GitHub-release promotion path for
the releasable V0 package set. It does not publish to npm and does not create a Git
tag or GitHub release by itself. It validates root `release.json`, then
regenerates gallery browser evidence and generates matching package metadata,
tarball and screenshot filenames, checksums, and emitted manifest metadata
under `dist/release/`. It validates the current gallery build fingerprints and
final screenshot bytes before atomically replacing the release directory. A
command-line version override must
equal the release manifest version. The current stable artifact release is
`v0.1.0`, with `@sanchika/tokens`, `@sanchika/primitives`, and
`@sanchika/patterns` in dependency order. The private
`@sanchika/gallery-app` is not a consumer package and is excluded from release
tarballs.

## v0.1.0 Release Preparation And Publication Boundary

The reviewed release tree advances `release.json` to `v0.1.0`. While the
release-preparation branch is unmerged, this is a candidate declaration only.
Once the tree is merged, detached release execution regenerates artifacts from
the merge commit, verifies their final bytes, creates the tag and GitHub
release, and uploads the exact asset set. The Pages workflow is then rerun to
publish the matching gallery status. Release preparation itself creates no tag,
release, upload, npm publication, or deploy.

The gallery build runs `scripts/check-gallery-release-readiness.mjs` in the
GitHub Pages master context. It refuses the automatic post-merge deployment
until the non-draft stable GitHub release exists with exactly the eleven assets
declared above. After publishing those assets, rerun the Pages workflow to
publish the matching current-release status. This gate changes neither the
Pages workflow nor repository settings and does not publish to npm.

The release set is exactly tokens, primitives, and patterns. The gallery is a
separately deployed private application and is never packed. Internal packed
dependencies resolve to `0.1.0`; source dependencies remain `workspace:*`.
There is no npm publication and no next package release is announced unless a
separate approval records one.

## Rollback To v0.0.2

The rollback assets remain:

- `https://github.com/lamemustafa/sanchika/releases/download/v0.0.2/sanchika-tokens-0.0.2.tgz`
- `https://github.com/lamemustafa/sanchika/releases/download/v0.0.2/sanchika-primitives-0.0.2.tgz`
- `https://github.com/lamemustafa/sanchika/releases/download/v0.0.2/sanchika-patterns-0.0.2.tgz`
- `https://github.com/lamemustafa/sanchika/releases/download/v0.0.2/manifest.json`

Consumers restore all three tarballs together, regenerate and review their
lockfile, remove any v0.1-only API usage, and rerun their package-backed smoke
check. Rollback changes package artifacts only; it requires no database, DNS,
or workspace migration. See `docs/migrations/v0.0.2-to-v0.1.0.md` for the
consumer sequence.

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
  `npm publish ./packages/patterns --provenance`. Never publish the private orchestration root or `apps/gallery`.
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

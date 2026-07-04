# Contributing

Sanchika is early and primarily serves ComplyEaze product work. Contributions
should improve the SDK without adding app-specific runtime coupling.

## Before Opening A Change

- Read `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `docs/architecture.md`,
  `docs/primitives.md`, and `docs/patterns.md`.
- For consumer or adoption changes, also read the relevant adoption docs:
  `docs/adoption-evidence.md`, `docs/adoption-complyeaze.md`, `docs/adoption-axal.md`,
  `docs/adoption-pack.md`, `docs/adoption-tools.md`, and
  `docs/adoption-external.md`.
- For public repository, release, or maintenance changes, also read
  `docs/github-repository-setup.md`, `docs/repository-settings.md`,
  `SUPPORT.md`, `SECURITY.md`, and `CODE_OF_CONDUCT.md`.
- Keep changes scoped to one package or one documented cross-package contract.
- Do not add ComplyEaze, Axal, Pack, or Tools application code.
- Do not add backend, database, auth, queue, scraping, telemetry, or route
  dependencies.
- Keep fixtures synthetic and free of PAN, GSTIN, Aadhaar, taxpayer names,
  portal screenshots, local file paths, credentials, cookies, OTPs, or notices.

## Verification

```bash
pnpm install
pnpm validate
pnpm typecheck
pnpm build
pnpm typecheck:api
pnpm artifact:check
pnpm consumer:check
pnpm smoke
pnpm workflow:preflight
pnpm publish:tarball-check
pnpm verify
```

For design-facing changes, include notes on keyboard behavior, screen-reader
semantics, responsive behavior, and any remaining accessibility gaps.

For adoption-facing changes, record the Sanchika commit, package link or artifact
method, changed files, and rollback files in the consumer PR using
`docs/adoption-evidence.md`. If an approved tarball artifact is used, record the
tarball version and checksum.

## Contribution License

Unless you explicitly mark a submission as "Not a Contribution", contributions
are accepted under the Apache-2.0 license that covers this repository.

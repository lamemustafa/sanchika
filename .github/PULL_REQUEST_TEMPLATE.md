## Summary

- 

## Boundary Check

- [ ] I read `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `docs/architecture.md`,
      `docs/primitives.md`, and `docs/patterns.md`.
- [ ] For consumer/adoption changes, I read the relevant adoption docs:
      `docs/adoption-complyeaze.md`, `docs/adoption-axal.md`,
      `docs/adoption-pack.md`, and `docs/adoption-tools.md`.
- [ ] This change stays within tokens, primitives, patterns, gallery, or docs.
- [ ] This change does not add ComplyEaze, Axal, Pack, or Tools app/runtime code.
- [ ] This change does not add backend, auth, database, queue, scraping, telemetry,
      or route dependencies.
- [ ] Fixtures and examples are synthetic and contain no PAN, GSTIN, Aadhaar,
      taxpayer names, credentials, cookies, OTPs, notices, screenshots, or local
      file paths.
- [ ] If this affects consumer adoption, the consumer PR records the Sanchika commit,
      package link or artifact method, changed files, and rollback files.
- [ ] If this uses an approved tarball artifact, the consumer PR records the
      tarball version and checksum.

## Design And Accessibility

- [ ] Token changes keep OKLCH values in CSS variables only.
- [ ] Primitive or pattern changes include visible state, keyboard, and
      screen-reader considerations.
- [ ] Claims about accessibility, compliance, official sources, or production
      readiness are backed by evidence.

## Verification

- [ ] `pnpm validate`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] `pnpm typecheck:api`
- [ ] `pnpm artifact:check`
- [ ] `pnpm consumer:check`
- [ ] `pnpm smoke`
- [ ] `pnpm workflow:preflight`
- [ ] `pnpm publish:tarball-check`
- [ ] `pnpm verify`

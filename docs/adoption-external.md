# External Adoption

External adopters are independent operational SaaS teams evaluating Sanchika
outside the ComplyEaze, Axal, Pack, and Tools product family.

Sanchika V0 is public source with reviewed GitHub release artifacts, not a published npm release.
External teams can review, clone, locally link built
packages, or use the latest published stable tarballs for evaluation. Until
v0.1.1 is published, v0.1.0 remains the current artifact set. External teams
must not
treat the repository as production-ready, filing-ready, government-official,
or security-audited.

## Entry Criteria

- Sanchika `pnpm verify` passes in the Sanchika repository.
- The target surface is an operational SaaS interface where source evidence,
  trust boundaries, accessibility states, and human review are relevant.
- The target surface does not require Sanchika to provide auth, backend,
  scraping, filing, tax/legal advice, telemetry, or app routing.
- The adoption plan records whether it uses a local package-directory link or an
  approved packed artifact. direct imports from `packages/*/src` are not allowed.

## Completion Evidence

- The external adoption PR records the Sanchika commit, package link or artifact
  method, changed files, and rollback files. Approved tarball use must record the
  tarball version and checksum.
- Browser review covers the adopted surface at mobile and desktop widths.
- Accessibility review covers keyboard order, focus visibility, accessible names,
  status messages, and non-color-only state communication.
- Trust-boundary review confirms local, upload, network, and human-review copy is
  specific to the consuming product and not copied as a generic guarantee.
- Import guard search finds no `../sanchika`, `sanchika/packages/*/src`, or
  workspace inclusion of the Sanchika source tree.

## V0 Artifact Consumption Quickstart

External adoption uses the latest reviewed published GitHub artifact set or a
reviewed local package-directory link. The v0.1.1 set becomes eligible only
after publication; until then, use v0.1.0. GitHub artifacts are not npm
publication.

1. In Sanchika, run `pnpm install`, `pnpm validate`, `pnpm typecheck`,
   `pnpm build`, `pnpm typecheck:api`, and `pnpm consumer:check`.
2. Link only package entrypoints such as `@sanchika/tokens`,
   `@sanchika/primitives`, and `@sanchika/patterns`.
3. Load token CSS before primitive CSS and keep product-specific color, copy,
   routing, auth, telemetry, and persistence outside Sanchika.
4. Record changed files and rollback files in the consuming repository.
5. Roll back by removing the package link, CSS imports, and mapped primitive or
   pattern usage. Do not leave source-path imports behind.

After v0.1.1 is published, tarball adoption must declare the complete dependency
set plus the pnpm overrides in `docs/migrations/v0.1.0-to-v0.1.1.md`, then
record the version, all three checksums, changed files, and rollback files after
`pnpm publish:tarball-check` and detached release verification pass.

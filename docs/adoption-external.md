# External Adoption

External adopters are independent operational SaaS teams evaluating Sanchika
outside the ComplyEaze, Axal, Pack, and Tools product family.

Sanchika V0 is public source, not a published npm release. External teams can
review, clone, and locally link built packages for evaluation, but they must not
treat the repository as production-ready, filing-ready, government-official, or
security-audited.

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

## V0 Local Consumption Quickstart

Until Sanchika is published, external adoption must use a reviewed local
package-directory link or an adoption-approved packed artifact. The default path
is local-link evaluation.

1. In Sanchika, run `pnpm install`, `pnpm validate`, `pnpm typecheck`,
   `pnpm build`, `pnpm typecheck:api`, and `pnpm consumer:check`.
2. Link only package entrypoints such as `@sanchika/tokens`,
   `@sanchika/primitives`, and `@sanchika/patterns`.
3. Load token CSS before primitive CSS and keep product-specific color, copy,
   routing, auth, telemetry, and persistence outside Sanchika.
4. Record changed files and rollback files in the consuming repository.
5. Roll back by removing the package link, CSS imports, and mapped primitive or
   pattern usage. Do not leave source-path imports behind.

Packed tarball artifacts are a validated packaging smoke artifact after
`pnpm publish:tarball-check` passes. They are not the default V0 adoption path;
use them only when a consumer-specific adoption plan approves tarballs and
records the tarball version and checksum.

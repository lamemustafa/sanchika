# ComplyEaze Adoption

ComplyEaze is the first Sanchika consumer.

Initial adoption should be narrow:

1. Import tokens into one controlled surface.
2. Review PrimitiveGallery output.
3. Replace shared shell pieces only after token behavior is stable.
4. Extract patterns from real ComplyEaze pages instead of inventing generic SaaS
   sections.

S7 candidates for that controlled surface are `PublicHero`, `ProductRouteMap`,
`ProofStrip`, `TrustBoundary`, `SourceProvenanceStrip`, `PricingBlock`,
`FAQAccordion`, and `ReleaseStatusBanner`. Import
`@sanchika/patterns/styles.css` after token and primitive CSS and use
`patternClassName` for finite variants and states.

The package owns editorial composition, proof/boundary grammar, responsive
collapse, and forced-colors state hooks. ComplyEaze still owns real service
copy, prices, source review, route destinations, consent, analytics, and every
runtime action. Adoption must not copy gallery markup wholesale or override
undocumented pattern descendants.

Do not migrate Axal, Pack, or Tools before the ComplyEaze foundation is usable.

## Entry Criteria

- Sanchika `pnpm verify` passes in the Sanchika repository.
- The target ComplyEaze surface is public/product-scoped and does not require
  auth, tenant data, document handling, or Axal workspace behavior.
- The adoption change has a rollback path limited to CSS imports, package links,
  and the single primitive or token mapping being tested.

## Completion Evidence

- The ComplyEaze adoption PR records the Sanchika commit, package link or
  artifact method, changed files, and rollback files. Approved tarball use must
  record the tarball version and checksum. Use
  `docs/adoption-evidence.md` as the evidence template.
- Browser review covers the chosen public/product surface at desktop and mobile
  widths.
- ComplyEaze lint/typecheck commands relevant to the changed surface pass.
- Import guard search finds no `../sanchika`, `sanchika/packages/*/src`, or
  parent workspace inclusion of `sanchika/`.

## V0 Artifact Consumption Quickstart

Sanchika stable packages are distributed through reviewed GitHub release
tarballs, not npm. Until v0.1.1 is published, v0.1.0 remains the current
published artifact set. Cross-repository ComplyEaze adoption should use all
three assets from one published release and record their SHA-256 checksums. A
reviewed local package link remains valid for same-machine development. Do not
import nested source paths such as
`../sanchika`, `sanchika/packages/*/src`, or add `sanchika/` to the parent pnpm
workspace.

1. In Sanchika, run `pnpm install`, `pnpm validate`, `pnpm typecheck`, and
   `pnpm build`.
2. Install or link only package entrypoints such as `@sanchika/tokens`,
   `@sanchika/primitives`, and `@sanchika/patterns`. For release adoption,
   after v0.1.1 is published, declare all three v0.1.1 GitHub tarballs and the
   pnpm overrides documented in `docs/migrations/v0.1.0-to-v0.1.1.md` so
   internal dependencies do not fall through to npm. Until then, keep using the
   published v0.1.0 artifact set.
3. In ComplyEaze, target the public/product route group first. Add token CSS
   before primitive CSS at the chosen CSS boundary, then apply one primitive or
   token mapping to a controlled surface.
4. Keep parent lockfile or dependency changes in the ComplyEaze PR only when
   they are required for that reviewed local link.
5. Roll back by removing the package link, CSS imports, and the single mapped
   primitive or token usage. Do not leave source-path imports behind.

## Verification Checklist

- Sanchika `pnpm verify` passes.
- Sanchika `pnpm consumer:check` proves local package-directory links can import
  JS entrypoints and resolve token/primitive CSS exports.
- Sanchika `pnpm typecheck:api` proves public package-name TypeScript imports
  compile through a scratch local-link consumer after package declarations build.
- ComplyEaze lint/typecheck commands relevant to the changed surface pass.
- Browser review covers the chosen public/product surface at desktop and mobile
  widths.
- Import guard search finds no `../sanchika`, `sanchika/packages/*/src`, or
  parent workspace inclusion of `sanchika/`.
- The adoption PR records the Sanchika commit, package link or artifact method,
  changed files, and rollback files. Approved tarball use must record the
  tarball version and checksum. Use `docs/adoption-evidence.md` as the evidence
  template.

GitHub tarball artifacts become the reviewed cross-repository v0.1.1 adoption
path only after `pnpm publish:tarball-check`, detached release verification,
and publication pass. A
consumer-specific adoption plan must still record the version, all three checksums,
changed files, and rollback files.

# Architecture

Sanchika is a design-system SDK, not an application framework.

## Package Direction

```text
tokens -> primitives -> patterns
   \----------\----------> apps/gallery
```

- `tokens` has no package dependencies.
- `primitives` depends on token names and shared type contracts only.
- `patterns` composes primitives into compliance-interface structures.
  S7 adds an immutable 20-contract product registry, four product groups, a
  finite class-name helper, and package-owned visual grammar CSS. It still does
  not ship components, routes, framework adapters, or product behavior.
- `apps/gallery` is a private Astro static application. It renders package
  contract exports and CSS into the canonical gallery site without exposing a
  consumer runtime package, framework adapter, or client island by default.
  S5 permits tiny zero-dependency scripts inside gallery examples for
  SearchField and CopyButton progressive enhancement. Those scripts are app
  evidence only and are never exported from `@sanchika/primitives`.
  S6 adds no package runtime: motion-assist metadata and a finite class-name
  helper resolve package CSS only, while the `/foundations/motion/` route is
  statically derived proof.
- CSS package exports are the only declared package side effects:
  `@sanchika/tokens/theme.css`, `@sanchika/primitives/styles.css`, and
  `@sanchika/patterns/styles.css` stay side-effectful so production bundlers do
  not prune required styles.

Parent applications should consume reviewed GitHub release artifacts or
reviewed local package links. The packages are not published to npm. Consumers
must not import source files from this repository by path.
V0 local-link adoption is checked by `pnpm consumer:check` and
`pnpm typecheck:api`; packed tarballs are verified by
`pnpm publish:tarball-check` as a pre-publish packaging and consumer-smoke path.
Consumers may use tarballs only when a consumer-specific adoption plan approves
that artifact path. Consumers do not import `@sanchika/gallery-app`.

## Release Posture

V0 is internal and experimental. Public production claims require at least one
real ComplyEaze surface to consume Sanchika successfully, with accessibility and
visual review evidence.

## AI-Native Tooling

AI-native tooling is advisory until a real consumer adoption proves the review
signal is stable. Keep Impeccable, Codex, Claude, and similar assistants outside
the runtime dependency graph; use them to review rendered consumer surfaces and
repository contracts, not to add model execution or generated app scaffolds to
Sanchika. See `docs/ai-native-tooling.md`.

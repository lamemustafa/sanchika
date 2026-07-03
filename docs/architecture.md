# Architecture

Sanchika is a design-system SDK, not an application framework.

## Package Direction

```text
tokens -> primitives -> patterns -> gallery
```

- `tokens` has no package dependencies.
- `primitives` depends on token names and shared type contracts only.
- `patterns` composes primitives into compliance-interface structures.
- `gallery` renders static markup and document strings for review and
  regression checks. It must not add routes, servers, app shells, Storybook, or
  framework runtime dependencies.
- CSS package exports are the only declared package side effects:
  `@sanchika/tokens/theme.css` and `@sanchika/primitives/styles.css` stay
  side-effectful so production bundlers do not prune required styles. Code-only
  packages declare `sideEffects: false`.

Parent applications should consume published packages or reviewed local package
links. They should not import source files from this repository by path.
V0 local-link adoption is checked by `pnpm consumer:check` and
`pnpm typecheck:api`; packed tarballs are verified by
`pnpm publish:tarball-check` as a pre-publish packaging and consumer-smoke path.
Consumers may use tarballs only when a consumer-specific adoption plan approves
that artifact path.

## Release Posture

V0 is internal and experimental. Public production claims require at least one
real ComplyEaze surface to consume Sanchika successfully, with accessibility and
visual review evidence.

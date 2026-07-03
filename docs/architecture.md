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

Parent applications should consume published packages or reviewed local package
links. They should not import source files from this repository by path.
V0 local-link adoption is checked by `pnpm consumer:check` and
`pnpm typecheck:api`; packed tarball adoption remains unsupported until
workspace dependency rewriting is proven.

## Release Posture

V0 is internal and experimental. Public production claims require at least one
real ComplyEaze surface to consume Sanchika successfully, with accessibility and
visual review evidence.

# @sanchika/primitives

Typed primitive contracts and CSS classes for Sanchika compliance interfaces.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Exports

- `@sanchika/primitives` - primitive specs, type-safe class composition, and
  state/accessibility metadata.
- `@sanchika/primitives/styles.css` - primitive CSS that consumes Sanchika token
  variables.

`styles.css` is declared as the package side effect so production bundlers keep
primitive styles when the CSS export is imported.

## Boundary

This package provides framework-agnostic contracts and styles. It does not ship
React components, event handlers, validation logic, form libraries, app routes,
or product runtime behavior.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

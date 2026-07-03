# @sanchika/primitives

Typed primitive contracts and CSS classes for Sanchika compliance interfaces.

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

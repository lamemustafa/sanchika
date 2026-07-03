# @sanchika/tokens

Semantic OKLCH tokens for Sanchika compliance interfaces.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Exports

- `@sanchika/tokens` - token metadata for color, spacing, radius, and motion.
- `@sanchika/tokens/theme.css` - CSS custom properties. Import this before
  primitive styles.

`theme.css` is declared as the package side effect so production bundlers keep
the token variables when the CSS export is imported.

## Boundary

This package contains portable design tokens only. It does not include product
runtime behavior, data access, auth, scraping, or application routes.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

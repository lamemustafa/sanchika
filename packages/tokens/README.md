# @sanchika/tokens

Semantic OKLCH tokens for Sanchika compliance interfaces.

## Exports

- `@sanchika/tokens` - token metadata for color, spacing, radius, and motion.
- `@sanchika/tokens/theme.css` - CSS custom properties. Import this before
  primitive styles.

`theme.css` is declared as the package side effect so production bundlers keep
the token variables when the CSS export is imported.

## Boundary

This package contains portable design tokens only. It does not include product
runtime behavior, data access, auth, scraping, or application routes.

# @sanchika/gallery

Static proof artifacts for Sanchika primitive and pattern contracts.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Exports

- `renderPrimitiveGalleryMarkup()` - returns a framework-agnostic HTML fragment.
- `renderPrimitiveGalleryDocument()` - returns a standalone HTML document for
  CI/review proof.
- `primitiveGalleryCssImports` - token-before-primitive CSS import order.

## Boundary

The gallery emits strings for review and regression checks. It is not an app
shell, route, server, Storybook replacement, browser automation harness, or
consumer runtime.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

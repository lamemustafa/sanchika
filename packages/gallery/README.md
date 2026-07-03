# @sanchika/gallery

Static proof artifacts for Sanchika primitive and pattern contracts.

## Exports

- `renderPrimitiveGalleryMarkup()` - returns a framework-agnostic HTML fragment.
- `renderPrimitiveGalleryDocument()` - returns a standalone HTML document for
  CI/review proof.
- `primitiveGalleryCssImports` - token-before-primitive CSS import order.

## Boundary

The gallery emits strings for review and regression checks. It is not an app
shell, route, server, Storybook replacement, browser automation harness, or
consumer runtime.

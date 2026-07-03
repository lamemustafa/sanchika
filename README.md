# Sanchika

Sanchika is an AI-native design system SDK for compliance-grade interfaces.
AI-native means typed, documented, agent-consumable design contracts; it does
not mean Sanchika provides a model runtime or automated compliance judgment.

This repository is independent from the ComplyEaze application repository. It is
currently nested locally under ComplyEaze for coordinated development, but it has
its own Git history and is intended to publish from
`https://github.com/lamemustafa/sanchika.git` until a ComplyEaze organization
exists.

## V0 Scope

Sanchika starts with four packages:

- `@sanchika/tokens` - semantic OKLCH tokens, CSS variables, and token metadata.
- `@sanchika/primitives` - typed primitive contracts and class composition.
- `@sanchika/patterns` - reusable compliance-interface pattern contracts.
- `@sanchika/gallery` - a lightweight primitive proof surface.

## Consumer Order

1. ComplyEaze public/product surfaces.
2. Axal workspace surfaces.
3. Pack local-first browser-extension surfaces.
4. Tools at `tools.complyeaze.com`.

Tools is in scope as a documented future consumer only. Do not implement tool
templates, routes, or product-specific APIs until a specific Tools product spec
exists.

## Commands

```bash
pnpm install
pnpm validate
pnpm typecheck
pnpm build
pnpm typecheck:api
pnpm artifact:check
pnpm smoke
pnpm consumer:check
pnpm workflow:preflight
pnpm publish:tarball-check
pnpm verify
```

In sandboxed Codex runs, use the installed `pnpm` binary directly. `corepack
pnpm` may fail if it cannot write to the user-level Corepack cache.

## CSS Usage

Load token variables before primitive styles:

```css
@import "@sanchika/tokens/theme.css";
@import "@sanchika/primitives/styles.css";
```

Primitive styles consume Sanchika CSS variables and do not define product colors.
Use `primitiveClassName(...)` or equivalent class composition to apply
`sk-button`, `sk-card`, `sk-badge`, and `sk-field` contracts.

## Gallery Proof Artifact

`@sanchika/gallery` exports `renderPrimitiveGalleryMarkup()` for fragment-level
checks and `renderPrimitiveGalleryDocument()` for a static HTML review artifact.
The document renderer includes token CSS before primitive CSS and is intended
for CI/review proof, not as an app route, server, Storybook replacement, or
runtime shell.

## Status

Early internal scaffold. Do not claim production readiness until at least one
real ComplyEaze surface consumes Sanchika successfully.

## Governance

- [Product context](PRODUCT.md)
- [Design system guide](DESIGN.md)
- [Primitive contracts](docs/primitives.md)
- [Pattern contracts](docs/patterns.md)
- [ComplyEaze adoption](docs/adoption-complyeaze.md)
- [Axal adoption](docs/adoption-axal.md)
- [Pack adoption](docs/adoption-pack.md)
- [Tools adoption](docs/adoption-tools.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Release policy](docs/release-policy.md)
- [Brand and trademark notice](LICENSE.brand.md)

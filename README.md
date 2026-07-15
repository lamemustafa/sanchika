# Sanchika

[![Pages smoke](https://github.com/lamemustafa/sanchika/actions/workflows/pages-smoke.yml/badge.svg?branch=master)](https://github.com/lamemustafa/sanchika/actions/workflows/pages-smoke.yml)

Sanchika is an AI-native design system SDK for compliance-grade interfaces.
AI-native means typed, documented, agent-consumable design contracts; it does
not mean Sanchika provides a model runtime or automated compliance judgment.

This repository is independent from the ComplyEaze application repository. It is
currently nested locally under ComplyEaze for coordinated development, but it has
its own Git history and is intended to publish from
`https://github.com/lamemustafa/sanchika.git` until a ComplyEaze organization
exists.

## V0 Scope

Sanchika starts with three release packages and one private static application:

- `@sanchika/tokens` - semantic OKLCH tokens, CSS variables, and token metadata.
- `@sanchika/primitives` - typed primitive contracts and class composition.
- `@sanchika/patterns` - reusable compliance-interface pattern contracts.
- `@sanchika/gallery-app` - the private Astro gallery and design-evidence site.

## Consumer Order

1. ComplyEaze public/product surfaces.
2. Axal workspace surfaces.
3. Pack local-first browser-extension surfaces.
4. Tools at `tools.complyeaze.com`.
5. External operational SaaS adopters, after local-link or artifact evidence is
   reviewed.

Tools is in scope as a documented future consumer only. Do not implement tool
templates, routes, or product-specific APIs until a specific Tools product spec
exists.

External adoption is in scope as public source evaluation only. Packages remain
private and unpublished in V0; external teams must use a documented local link or
approved artifact path and record rollback evidence.

## Runtime Prerequisites

Use Node 24+ and the repository-pinned `pnpm@10.28.2` for install, build,
verification, and package checks. Package manifests currently declare
`engines.node: ">=24"`. The Node 22.14.0+ publish-runtime note in the release
policy is an npm Trusted Publishing minimum, not a supported Sanchika package
runtime floor.

## Commands

```bash
pnpm install
pnpm build:tokens
pnpm check:tokens
pnpm validate
pnpm typecheck
pnpm build
pnpm typecheck:api
pnpm artifact:check
pnpm gallery:build
pnpm gallery:check
pnpm pages:smoke
pnpm hosting:domain:check
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
@import "@sanchika/patterns/styles.css";
```

Primitive styles consume Sanchika CSS variables and do not define product colors.
Use `primitiveClassName(...)` or equivalent class composition to apply
`sk-button`, `sk-card`, `sk-badge`, and `sk-field` contracts.
Use `patternClassName(...)` for the finite S7 product pattern variants and
states. The package exports 20 canonical patterns across public/product, Axal,
Pack, and Tools groups while preserving the legacy four-entry `patternSpecs`
shape.

## Gallery Application

`apps/gallery` is a private Astro static application. It imports contract data
from the public `tokens`, `primitives`, and `patterns` package entrypoints and
loads token CSS before primitive CSS. It is a showcase and documentation
surface, not a package that consumers import.

Run `pnpm build` to build the release packages and write the openable static
site. After those package artifacts exist, `pnpm gallery:build` rebuilds only
the gallery application:

```text
apps/gallery/dist/index.html
apps/gallery/dist/_astro/*.css
```

Run `pnpm gallery:check` to fail unresolved `@sanchika/*` CSS references,
confirm token CSS precedes primitive and pattern CSS, and reject unintended
client JavaScript. The S8 gallery remains a static showcase with package-driven
primitive and pattern detail routes, local documentation search, and distinct
product-mode proofs; it is not a server, Storybook replacement, framework
adapter, runtime shell, or consumer package.

## Status

Early internal scaffold. Do not claim production readiness until at least one
real ComplyEaze surface consumes Sanchika successfully.

## Governance

- [Product context](PRODUCT.md)
- [Design system guide](DESIGN.md)
- [Primitive contracts](docs/primitives.md)
- [Pattern contracts](docs/patterns.md)
- [ComplyEaze adoption](docs/adoption-complyeaze.md)
- [Adoption evidence template](docs/adoption-evidence.md)
- [Axal adoption](docs/adoption-axal.md)
- [Pack adoption](docs/adoption-pack.md)
- [Tools adoption](docs/adoption-tools.md)
- [External adoption](docs/adoption-external.md)
- [AI-native tooling posture](docs/ai-native-tooling.md)
- [Contributing](CONTRIBUTING.md)
- [Support](SUPPORT.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Release policy](docs/release-policy.md)
- [Hosting](docs/hosting.md)
- [GitHub repository setup](docs/github-repository-setup.md)
- [Repository settings](docs/repository-settings.md)
- [Brand and trademark notice](LICENSE.brand.md)

# Sanchika Agent Guide

Sanchika is an independent nested Git repository for an AI-native design system
SDK. It is not part of the parent ComplyEaze app workspace.

## Scope

- Remote target: `https://github.com/lamemustafa/sanchika.git`.
- Public default branch: `master`.
- Package manager: pnpm only.
- V0 packages: `tokens`, `primitives`, `patterns`, and `gallery`.
- Consumer order: ComplyEaze, Axal, Pack, then Tools.
- Product/design docs: `PRODUCT.md`, `DESIGN.md`, `docs/architecture.md`,
  `docs/primitives.md`, `docs/patterns.md`, `docs/adoption-complyeaze.md`,
  `docs/adoption-axal.md`, `docs/adoption-pack.md`, and
  `docs/adoption-tools.md`.
- Governance docs: `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE.brand.md`,
  `CODE_OF_CONDUCT.md`, `docs/release-policy.md`,
  `docs/github-repository-setup.md`, and `docs/repository-settings.md`.

## Boundaries

- Do not add backend services, Prisma, auth, RBAC, BullMQ, Redis, scraping, or
  route-registry dependencies.
- Do not scaffold ComplyEaze, Axal, Pack, or Tools apps in this repository.
- Do not import source files from the parent ComplyEaze repository.
- Do not make Sanchika a Git submodule of ComplyEaze. It is a nested independent
  repo that the parent ignores.
- Keep framework claims honest: framework-agnostic design contract,
  React-ready primitive contracts, platform-portable tokens.

## Design Rules

- Read `PRODUCT.md` and `DESIGN.md` before making token, primitive, pattern, or
  gallery changes.
- OKLCH CSS variables are the token source of truth. Hex values may appear only
  as explanatory comments in docs.
- Target WCAG 2.2 AA and WAI-ARIA APG behavior for interactive primitives.
- Do not rely on color alone for status.
- Avoid generic SaaS bento overload, purple AI gradients, glassmorphism, and
  unsupported trust claims such as "bank-grade security".
- Compliance interfaces must make source, uncertainty, review state, and trust
  boundaries explicit when applicable.

## Verification

Run the smallest relevant command first, then broaden:

```bash
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

Use the installed `pnpm` binary directly. If `corepack pnpm` fails because the
sandbox cannot write to the user-level Corepack cache, report that environment
gap separately instead of treating it as a Sanchika package failure.

# ADR 0002: Independent Contract-First Repository

## Status

Accepted.

## Context

Earlier Sanchika planning considered package work inside the ComplyEaze
application workspace and a broader React-first package set. The current
repository reality is different: Sanchika is an independent public Git
repository at `lamemustafa/sanchika`, locally nestable near ComplyEaze for
coordination but not part of the parent app workspace and not a Git submodule.

The current v0 packages are:

- `@sanchika/tokens`
- `@sanchika/primitives`
- `@sanchika/patterns`
- `@sanchika/gallery`

The immediate readiness gap is not more package surface area. It is visible,
checkable proof that the existing contracts render correctly and can be adopted
by one real ComplyEaze surface without importing Sanchika source paths.

## Decision

Sanchika remains an independent contract-first design-system SDK. Its v0 scope is
tokens, primitive contracts, pattern contracts, and a static gallery proof
surface.

React adapters, a CLI package, shadcn registry output, Storybook, MCP, Web
Components, and product app scaffolds are deferred until real consumer evidence
proves repeated need. The next readiness gate is a narrow ComplyEaze adoption
that consumes Sanchika through package entrypoints or an approved artifact path
and records rollback, browser review, and verification evidence.

## Consequences

- Consumer apps must not import Sanchika source files by path.
- Sanchika must make its contracts visible through an openable gallery artifact
  before claiming broader readiness.
- Deterministic repo scripts should catch token drift, missing gallery coverage,
  and unsafe trust copy before any CLI or MCP surface is promoted.
- Pattern additions should come from current ComplyEaze, Axal, Pack, Tools, or
  external operational SaaS needs rather than generic UI-kit expansion.

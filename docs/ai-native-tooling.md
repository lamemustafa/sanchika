# AI-Native Tooling Posture

Sanchika is AI-native through contracts, not through an embedded model runtime.
The durable interface for agents is the typed package API, package READMEs,
`PRODUCT.md`, `DESIGN.md`, adoption docs, synthetic gallery output, and
verification scripts.

## Current Tooling Boundary

- Keep Impeccable, Codex, Claude, and similar assistants outside Sanchika's
  runtime dependency graph.
- Do not add agent plugins, MCP servers, prompt packs, or generated hook bundles
  to this repository without a separate trust review.
- Treat `$impeccable ...` as a harness-level skill command when the current
  agent environment exposes it. Do not document it as a package script.
- Treat `pnpm dlx impeccable detect <paths>` or a locally installed detector as
  advisory review evidence, not as a required Sanchika CI gate.

## Recommended Use

Use Impeccable-style review for consumer adoption PRs and public docs when a
real rendered surface exists:

1. Run Sanchika's package gates first: `pnpm validate`, `pnpm typecheck`,
   `pnpm build`, `pnpm typecheck:api`, `pnpm artifact:check`,
   `pnpm consumer:check`, `pnpm smoke`, and `pnpm publish:tarball-check`.
2. Review the chosen ComplyEaze, Axal, Pack, or Tools surface with the product
   register and the relevant adoption doc.
3. Record the Sanchika commit, package link or artifact method, changed files,
   rollback files, and any detector/browser findings in the consumer PR.
4. Promote a detector to CI only after it has low-noise evidence on at least one
   real ComplyEaze adoption and its failure modes are documented.

## Non-Goals

- No model runtime.
- No automated compliance judgment.
- No generated app routes, backend services, auth, database, queue, scraping, or
  telemetry.
- No production-readiness claim until a real ComplyEaze surface consumes
  Sanchika with accessibility, visual review, and rollback evidence.

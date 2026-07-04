@AGENTS.md

## Claude Code

This addendum is Claude-Code-specific context layered on top of `AGENTS.md`.
`AGENTS.md` remains the authoritative policy surface for Sanchika.

### Repository Boundary

Sanchika is an independent public design-system SDK repository, not a
ComplyEaze, Axal, Pack, or Tools app workspace. Do not add backend services,
auth, database, queues, scraping, telemetry, route dependencies, or consumer app
runtime code here.

### PR Review Gate

Run `pnpm review:gate -- --repo lamemustafa/sanchika --pr <number>
--strict-head-review --required-review-author chatgpt-codex-connector` before
claiming a PR is ready. The protected `master` ruleset should require the
`Review gate` status and conversation resolution so unresolved current-head
review threads and requested-changes reviews block merges.

For historical closed-PR cleanup, inspect GraphQL `reviewThreads`, classify each
thread against current `master`, comment with evidence or a linked tracking
issue, and resolve only after the disposition is recorded.

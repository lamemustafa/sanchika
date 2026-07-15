# Axal Adoption

Axal is the second Sanchika consumer.

Axal needs dense operational patterns: review queues, evidence panels, source
metadata, task tables, timelines, and human-review checkpoints.

The S7 candidates are `ReviewDeskPreview`, `EvidencePanel`,
`HumanReviewCheckpoint`, `AuditTrailPreview`, and `WorkQueueRow`. The package
owns their shared evidence hierarchy, state text hooks, responsive collapse,
and forced-colors treatment. Axal owns tenant authorization, real sources,
assignment, persistence, audit storage, queue mutation, decision effects, and
all route behavior. Pattern adoption is not permission to move those concerns
into Sanchika.

## Entry Criteria

- ComplyEaze completion evidence exists for a narrow public/product adoption.
- The Axal target is a single workspace surface with clear source, review,
  uncertainty, and human-action states.
- The change does not introduce Sanchika-specific Prisma, RBAC, auth, queue, AI,
  or route-registry behavior.

## Completion Evidence

- The Axal adoption PR links the ComplyEaze completion evidence and records the
  Sanchika commit, package link or artifact method, changed files, and rollback
  files. Approved tarball use must record the tarball version and checksum.
- The adopted pattern came from a real Axal workflow, not a generic SaaS section.
- Axal lint/typecheck and any relevant route/component tests pass.
- Browser review covers dense operational data, long client/compliance names,
  empty/error/loading states, and keyboard focus.

Non-goals for the current scaffold:

- No Axal app routes.
- No auth/RBAC integration.
- No Prisma schema.
- No AI action runtime.

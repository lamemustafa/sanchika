# Pack Adoption

Pack is the third Sanchika consumer.

Pack needs local-first trust boundaries: no upload, no credential handoff, no
telemetry, visible permissions, source review, and local proof states.

Pack remains its own browser-extension repository. Consume Sanchika through a
published package, reviewed local package link, or copied design guidance. Do
not import Sanchika source by parent-relative path.

## Entry Criteria

- ComplyEaze completion evidence and Axal completion evidence both exist.
- Pack adoption reads `pack/AGENTS.md` and this document before changing
  extension UI, permissions, release artifacts, or public trust copy.
- The target Pack surface is local-first and does not add telemetry, backend
  upload, credential capture, or broad host permissions.

## Completion Evidence

- The Pack adoption PR links the Axal completion evidence and records the
  Sanchika commit or copied guidance being consumed.
- Pack verification and release-evidence checks relevant to the changed surface
  pass.
- Source guard search finds no parent-relative Sanchika imports and no
  `sanchika/packages/*/src` imports.
- Browser-extension review confirms local-only trust copy, visible permissions,
  and no unsupported Chrome Web Store readiness claims.

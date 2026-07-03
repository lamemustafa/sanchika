# Tools Adoption

Tools at `tools.complyeaze.com` is the fourth Sanchika consumer after Pack.

Expected surfaces:

- Public calculators and compliance utilities.
- Browser-local artifact builders.
- Result panels with export and share states.
- Source and provenance strips.
- Handoff prompts into ComplyEaze where appropriate.

Current non-goal: do not implement `apps/tools`, route templates, tool-specific
package APIs, or product UI before the first Tools product spec exists.

## Entry Criteria

- ComplyEaze completion evidence, Axal completion evidence, and Pack completion
  evidence all exist.
- A specific Tools product spec exists for `tools.complyeaze.com`; do not use
  this document as permission to create generic tool templates.
- The target tool is a public/local artifact workflow with explicit source,
  provenance, export, and handoff states.

## Completion Evidence

- The Tools adoption PR links the Pack completion evidence and records the
  Sanchika commit, package link or artifact method, changed files, and rollback
  files. Copied guidance must identify the Sanchika source it came from.
  Approved tarball use must record the tarball version and checksum.
- The Tools product spec names the surface, user outcome, source/provenance
  requirements, and rollback files.
- Browser review covers mobile and desktop layouts, export/share states,
  source/provenance strips, and handoff prompts.
- Import guard search finds no parent-relative Sanchika source imports and no
  premature route-template scaffolding.

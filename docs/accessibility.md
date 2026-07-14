# Accessibility

Sanchika provides WCAG 2.2 AA-oriented token, primitive, and pattern contracts
and WAI-ARIA APG-informed behavior guidance for applicable interactive
primitives. It does not make page-level WCAG conformance claims; consumer
surfaces still need responsive, keyboard, screen-reader, content, and
conformance evidence in their own runtime.

## Standards References

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/

Use native HTML semantics first. Reach for ARIA only when a primitive needs
semantics that native elements cannot provide.

## Current V0 Requirements

- Status must include visible text, not color alone.
- Focus-visible states must be present on interactive controls.
- Disabled controls must remain understandable to assistive technology.
- Loading controls should expose `aria-busy="true"` or an equivalent state
  attribute in addition to visual treatment.
- Invalid fields should associate the control with visible error copy, not only
  a red border.
- Long names, GSTINs, PANs, dates, and amounts must not overflow fixed UI.
- Future data primitives must support Indian numbering and DD-MM-YYYY dates.
- SearchField requires a visible label, accessible clear name, associated
  hint/error, polite settled result status, focus retention during filtering,
  and a disabled clear action when the input is disabled.
- Skeleton places `aria-busy` on the owning region and normally hides each
  shape from assistive technology. Reduced motion removes its local pulse.
- EmptyState has no implicit alert role. ErrorState announcement semantics are
  contextual and must not steal focus.
- Progress prefers native `progress`; Stepper prefers an ordered list and
  exposes the current item with `aria-current="step"`.
- Disclosure prefers native `details`/`summary`; CopyButton success and failure
  are both visible and politely announced while focus stays on the button.
- Breadcrumb is a named navigation landmark with an ordered list and an
  unlinked `aria-current="page"` item.
- TableShell requires caption/header relationships. A genuinely wide table may
  use a named focusable scroll region with a visible overflow affordance; no
  data-grid keyboard model is implied.

## Standards Mapping

| Requirement | Primary criteria |
| --- | --- |
| Text and semantic status contrast | WCAG 2.2 SC 1.4.3, SC 1.4.11 |
| Keyboard operation and visible focus | WCAG 2.2 SC 2.1.1, SC 2.4.7 |
| Minimum pointer target floors for controls | WCAG 2.2 SC 2.5.8 |
| Labels, error text, and invalid fields | WCAG 2.2 SC 3.3.1, SC 3.3.2 |
| Information relationships, programmatic name, role, value, and status messages | WCAG 2.2 SC 1.3.1, SC 4.1.2, SC 4.1.3 |
| Button command behavior | WAI-ARIA APG Button Pattern |
| Search result announcements | WCAG 2.2 SC 4.1.3 |
| Native disclosure name, role, value | WCAG 2.2 SC 4.1.2 |
| Table caption/header relationships | WCAG 2.2 SC 1.3.1 |

Automated checks are necessary but not sufficient. Manual keyboard review is
required before production-readiness claims.

## Forced Colors

- Do not disable system colors blindly with `forced-color-adjust: none`.
- Preserve visible control borders and focus evidence; allow the browser to use
  system colors when they communicate the state more reliably.
- Keep visible status text as the semantic signal so success, warning, danger,
  information, and neutral states never depend on authored color alone.
- Sanchika package tokens are not a substitute for native forced-color behavior
  or consumer-level Windows High Contrast review.

S3 does not add a high-contrast theme. A future theme requires real primitive
and consumer evidence rather than a palette-only remap.

S5 forced-colors rules preserve control, status, table, progress, and focus
boundaries with system colors. S5 does not begin the shared S6 motion/assist
layer; Skeleton uses only a local component loading animation and removes it
under `prefers-reduced-motion: reduce`.

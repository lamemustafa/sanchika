# Primitive Contracts

Sanchika primitives define class and state contracts. They are not React
components, form libraries, or app-specific wrappers.

## Required Fields

Each primitive declares:

- `requiredStates`: the visible states the primitive must support.
- `stateEvidence`: metadata that explains how each state is proven in markup and
  CSS.
- `standards`: standards references and behavioral obligations when a primitive
  maps to a published accessibility pattern.
- `attributes`: HTML or ARIA attributes a consumer can use to expose state.
- `selectors`: class, attribute, or pseudo-class selectors implemented by
  primitive CSS.
- `notes`: accessibility and usage guidance for the state.

## APG Button Contract

`Button` follows the WAI-ARIA APG Button Pattern as guidance for command
triggers. Consumers should prefer native `<button>` elements. If a consumer uses
a non-button element with `role="button"`, it must implement keyboard activation
for `Space` and `Enter`, provide an accessible name, and keep focus behavior
predictable after activation.

Toggle buttons use `aria-pressed`; do not change the visible label only to
communicate the pressed state. Consumers must define focus after activation
based on the resulting workflow, such as returning focus after a dialog closes or
moving focus into newly opened content.

## Current Direction

- `Button` proves default, hover, focus-visible, disabled, and loading states.
- `Card` proves grouped-surface and keyboard-focus contracts without using
  side-stripe status treatment. Static cards are not focus targets; interactive
  card surfaces should use native links or buttons with visible focus treatment.
- `Badge` proves status text is visible and not color-only.
- `Field` proves label, focus, disabled, and associated error states. Use wrapper
  `data-invalid` for visual grouping, but put `aria-invalid` and
  `aria-describedby` on the actual control.

Do not add component wrappers, event handlers, validation logic, or framework
adapters here. Consumer apps own behavior; Sanchika owns portable contracts.

PrimitiveGallery coverage must prove primitive state metadata, state-specific
HTML exemplars, and token-before-primitive CSS order until a stronger visual
review tool exists.

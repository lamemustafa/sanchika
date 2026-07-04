# Sanchika Design System

Sanchika expresses calm authority for Indian compliance workflows.

Interfaces should feel safe, prepared, in control, and professionally supported.
They should not feel crypto-like, flashy, playful, generic, or like a purple
gradient AI startup.

## Product Modes

- `complyeaze/core`: calm, advisory, service-led public and product surfaces.
- `axal/workspace`: dense, operational, AI-assisted, audit-trail-first.
- `pack/local-utility`: local-first, inspectable, permission-explicit.
- `tools/local-artifact`: browser-local utilities, source-backed outputs, no
  account or upload assumptions.
- `external/operational-saas`: neutral mode for independent teams adopting
  evidence, trust-boundary, and accessibility contracts without ComplyEaze app
  runtime assumptions.

## Token Rule

Implementation source of truth is OKLCH CSS variables. Hex values in docs are
comments only and must not be copied into package or app code.

## Starting Token Roles

- `--sk-color-bg-base`
- `--sk-color-bg-surface`
- `--sk-color-ink-primary`
- `--sk-color-ink-muted`
- `--sk-color-border-control`
- `--sk-color-brand-primary`
- `--sk-color-accent`
- `--sk-color-success`
- `--sk-color-warning`
- `--sk-color-danger`
- `--sk-color-info`

Spacing uses a base-8 scale. Motion uses 150-200ms ease-out transitions. Do not
use spring or bounce motion on critical filing, review, or proof actions.

## Definition Of Done For Reusable UI

1. Token-only styling.
2. Keyboard and screen-reader behavior for applicable controls.
3. Mobile, tablet, and desktop behavior.
4. Loading, empty, error, disabled, focus, hover, and selected states where
   applicable.
5. Usage guidance for agents.
6. PrimitiveGallery coverage until Storybook exists.
7. Accessibility check when tooling exists.
8. Example usage in at least one real pattern before production claims.

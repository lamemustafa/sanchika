# Pattern Contracts

Sanchika patterns are contracts, not app components. They describe the slots,
states, and semantic obligations a consumer surface must satisfy before building
or extracting reusable UI.

## Required Fields

Each pattern declares:

- `requiredSlots`: named content regions a consumer must provide.
- `requiredStates`: visible states the pattern must support, with state-specific
  purpose, `requiredVisibleSignals`, optional state-scoped slots, and
  structured `a11yChecks`.
- `programmaticStatus`: optional state-level status semantics for states that
  change after user or system action. Status contracts name the expected
  `role`, `ariaLive`, related slots, and announcement requirement.
- `a11yChecks`: structured WCAG-backed checks with `id`, `criterion`,
  `sourceUrl`, `requirement`, optional `slotRefs`, and `manualTest`.
- `semanticObligations`: product, accessibility, and trust-boundary rules that
  cannot be reduced to color or layout.
- `nonGoals`: runtime behavior or claims the pattern does not provide.

## Type Contracts

Consumers can use derived TypeScript unions to bind implementation code to a
known pattern contract without stringly typed slots or states:

- `PatternName`
- `PatternA11yCheck`
- `PatternA11yCheckFor<Name, StateName>`
- `PatternA11yCriterion`
- `PatternA11ySourceReference`
- `PatternProgrammaticStatus`
- `PatternProgrammaticStatusFor<Name, StateName>`
- `PatternSpecFor<Name>`
- `PatternSlotName`
- `PatternSlotNameFor<Name>`
- `PatternStateName`
- `PatternStateNameFor<Name>`
- `PatternStateFor<Name, StateName>`
- `PatternStateRequiredSlotNameFor<Name, StateName>`

These types are generated from `patternSpecs`. They do not introduce runtime
components or framework adapters.

## Current Direction

- `EvidencePanel` proves source, review, uncertainty, provenance, and next-action
  obligations without introducing an AI runtime.
- `TrustBoundary` makes local, upload, permission, and source visibility
  boundaries explicit for Pack and Tools.
- `ServiceSection` keeps public ComplyEaze service surfaces specific and
  human-led instead of generic SaaS cards.

Do not add React wrappers, route templates, product APIs, or persistence here.
Extract those only after a real consumer surface needs them.

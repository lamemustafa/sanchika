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
  `role`, `ariaLive`, `ariaAtomic`, related slots, and announcement requirement.
- `a11yChecks`: structured WCAG-backed checks with `id`, `criterion`,
  `sourceUrl`, `requirement`, optional `slotRefs`, and `manualTest`.
- `semanticObligations`: product, accessibility, and trust-boundary rules that
  cannot be reduced to color or layout.
- `nonGoals`: runtime behavior or claims the pattern does not provide.

## WCAG Criterion Vocabulary

Pattern a11y checks may use only the criteria documented here, and each
criterion must keep its W3C WCAG 2.2 source URL:

| Criterion | Source |
| --- | --- |
| `WCAG22:1.3.1` | https://www.w3.org/TR/WCAG22/#info-and-relationships |
| `WCAG22:1.4.3` | https://www.w3.org/TR/WCAG22/#contrast-minimum |
| `WCAG22:1.4.11` | https://www.w3.org/TR/WCAG22/#non-text-contrast |
| `WCAG22:2.1.1` | https://www.w3.org/TR/WCAG22/#keyboard |
| `WCAG22:2.4.7` | https://www.w3.org/TR/WCAG22/#focus-visible |
| `WCAG22:2.5.8` | https://www.w3.org/TR/WCAG22/#target-size-minimum |
| `WCAG22:3.3.1` | https://www.w3.org/TR/WCAG22/#error-identification |
| `WCAG22:3.3.2` | https://www.w3.org/TR/WCAG22/#labels-or-instructions |
| `WCAG22:4.1.2` | https://www.w3.org/TR/WCAG22/#name-role-value |
| `WCAG22:4.1.3` | https://www.w3.org/TR/WCAG22/#status-messages |

Every state that declares `programmaticStatus` must include a `WCAG22:4.1.3`
a11y check so visual state changes are also status messages.

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

## Pattern State Exemplars

PrimitiveGallery must include Pattern state exemplars for every required pattern
state. Each exemplar must render all visible signals and required slots. Every
required state that declares `programmaticStatus` must also include concrete
`role` markup, `aria-live` markup, and `aria-atomic` markup. The gallery must
cover visible state copy and slot IDs instead of only displaying the
`programmaticStatus` requirement prose.

## Current Direction

- `EvidencePanel` proves source, review, uncertainty, provenance, and next-action
  obligations without introducing an AI runtime.
- `TrustBoundary` makes local, upload, permission, and source visibility
  boundaries explicit for Pack and Tools.
- `ServiceSection` keeps public ComplyEaze service surfaces specific and
  human-led instead of generic SaaS cards.

Do not add React wrappers, route templates, product APIs, or persistence here.
Extract those only after a real consumer surface needs them.

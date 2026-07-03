# @sanchika/patterns

Compliance-interface pattern contracts for Sanchika consumer products.

## Exports

- `@sanchika/patterns` - pattern specs for evidence, trust-boundary, and service
  presentation contracts.
- Derived contract types:
  - `PatternName`
  - `PatternSpecFor<Name>`
  - `PatternSlotName`
  - `PatternSlotNameFor<Name>`
  - `PatternStateName`
  - `PatternStateNameFor<Name>`
  - `PatternStateFor<Name, StateName>`
  - `PatternStateRequiredSlotNameFor<Name, StateName>`

## Boundary

Patterns describe required slots, states, visible signals, accessibility checks,
semantic obligations, and non-goals. They are not React components, app
templates, APIs, persistence models, AI runtimes, or legal/compliance advice.

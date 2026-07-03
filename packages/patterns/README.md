# @sanchika/patterns

Compliance-interface pattern contracts for Sanchika consumer products.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Exports

- `@sanchika/patterns` - pattern specs for evidence, trust-boundary, and service
  presentation contracts.
- Derived contract types:
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

## Boundary

Patterns describe required slots, states, visible signals, accessibility checks,
semantic obligations, and non-goals. They are not React components, app
templates, APIs, persistence models, AI runtimes, or legal/compliance advice.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

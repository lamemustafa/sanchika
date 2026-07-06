# Pattern Contracts

Sanchika patterns are contracts, not app components. They describe the slots,
states, and semantic obligations a consumer surface must satisfy before building
or extracting reusable UI.

## Required Fields

Each pattern declares:

- `consumerModes`: product or external adopter modes where the pattern is
  expected to apply. Current modes are `complyeaze/core`, `axal/workspace`,
  `pack/local-utility`, `tools/local-artifact`, and
  `external/operational-saas`.
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

## Trust Brief Contract

`TrustBrief` is the first AI-native harness contract. It captures the brief an
agent or engineer must satisfy before a surface is Sanchika-contract-reviewed.

Required fields include consumer mode, register, surface, user job, primary
decision, data sensitivity, trust boundaries, evidence requirements, selected
patterns, visible claims, non-goals, and verification gates.

Use `validateTrustBrief` before implementation or extraction. It returns
`TrustBriefValidationIssue` entries when the brief is too vague or misses a
mode-specific safety requirement. Pack trust briefs must state no upload, no
credential handoff, and no telemetry. Axal workspace briefs must require source,
review, and human evidence. ComplyEaze core briefs must stay public-copy scoped
and exclude auth, tenant, document, and workspace scope. Tools local-artifact briefs
must require source, provenance, export evidence, and a product-spec guard before
generic route or tool scaffolds. Product-register briefs must include keyboard
focus verification.

The trust brief does not generate UI, route files, product APIs, or compliance
judgment. It is a contract for shaping, review, and verification.

## Design Brief Contract

`DesignBrief` is the second AI-native harness contract. It embeds a valid
`TrustBrief` and records the surface-specific design direction an agent or
engineer must preserve while producing UI.

Required fields include register, surface, first viewport signal, emotional
intent, narrative arc, information priority, responsive constraints,
interaction states, visual quality gates, verification evidence, and non-goals.

Use `validateDesignBrief` after `validateTrustBrief` and before implementation.
It returns `DesignBriefValidationIssue` entries when a design brief is too vague,
does not match the embedded trust brief, misses mobile or desktop constraints,
skips render evidence, omits focus coverage on product surfaces, or lacks
quality gates for `not-generic-saas` and `first-viewport-product-signal`.

Current visual quality gates include `not-generic-saas`,
`first-viewport-product-signal`, `source-visible`, `human-review-visible`,
`responsive-fit`, `keyboardable`, `reduced-motion`, and `performance-budget`.
Current interaction states include `loading`, `empty`, `error`, `disabled`,
`focus`, `hover`, `selected`, and `blocked`.

Pack design briefs must keep no upload, no credential handoff, and no telemetry
out of scope. ComplyEaze core design briefs must name ComplyEaze in the first
viewport signal. The design brief does not generate components, routes, product
APIs, or app-specific implementations.

## Pattern State Exemplars

PrimitiveGallery must include Pattern state exemplars for every required pattern
state. Each exemplar must render all visible signals and required slots. Every
required state that declares `programmaticStatus` must also include a dedicated
status element with concrete `role` markup, `aria-live` markup, and
`aria-atomic` markup. Do not put live-region attributes on the whole exemplar
article. The gallery must cover visible state copy and slot IDs instead of only
displaying the `programmaticStatus` requirement prose.

## Current Direction

- `EvidencePanel` proves source, review, uncertainty, provenance, and next-action
  obligations without introducing an AI runtime.
- `TrustBoundary` makes local, upload, permission, and source visibility
  boundaries explicit for Pack and Tools.
- `ProductFamilyRouter` routes between ComplyEaze, Axal, Pack, Tools, and
  external operational SaaS surfaces while making product mode, availability,
  externality, and trust boundary visible.
- `ServiceSection` keeps public ComplyEaze service surfaces specific and
  human-led instead of generic SaaS cards.

Do not add React wrappers, route templates, product APIs, or persistence here.
Extract those only after a real consumer surface needs them.

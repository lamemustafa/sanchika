# Pattern Contracts

Sanchika patterns are contracts, not app components. They describe the slots,
states, and semantic obligations a consumer surface must satisfy before building
or extracting reusable UI.

## S7 Product Pattern Inventory

S7 adds an immutable `productPatternContracts` registry and four immutable
`productPatternGroups`. These are richer adopter contracts beside the legacy
`patternSpecs` array; they do not turn the package into a component library.

| Group | Pattern | Core anatomy | Variants | Required states |
| --- | --- | --- | --- | --- |
| Public/product | `PublicHero` | eyebrow, title, lede, actions, proof, boundary | editorial, compact | default, with-proof-artifact, compact-mobile |
| Public/product | `ProductRouteMap` | route summary, primary route, alternatives, boundary labels, status, actions, colophon | family | default, compact, limited, unavailable, colophon |
| Public/product | `ProofStrip` | proof items, checked time | inline | verified, limited |
| Public/product | `TrustBoundary` | boundary summary, facts, safe action | workspace, local, draft, inverse | local-only, permission-required, upload-required, unavailable |
| Public/product | `SourceProvenanceStrip` | source type, source, release/reference, status, checked time, reviewer, limitation | ledger | current, stale, unavailable, limited, unverified |
| Public/product | `PricingBlock` | offer, price, inclusions, exclusions, review boundary, action | single-offer | available |
| Public/product | `FAQAccordion` | question, answer, source | stack | collapsed, expanded |
| Public/product | `ReleaseStatusBanner` | product, release, status, scope, reviewed time, source, limitation, safe action | notice, warning | current, alpha, stale, limited, planned, unavailable |
| Axal | `ReviewDeskPreview` | desk header, synthetic marker, queue, selected work, evidence, owner/due/review, blocker, checkpoint, audit | three-pane, stacked | ca-review-needed, client-input-pending, evidence-requested, source-unavailable, ready-for-reviewer, blocked |
| Axal | `EvidencePanel` | source, evidence state, uncertainty, checked time, reviewer, action | rail, embedded | available, requested, missing, stale, disputed, under-review |
| Axal | `HumanReviewCheckpoint` | preparation, owner, source readiness, blocker, decision, evidence, actions, history | inverse, inline | preparation, review-needed, held, approved, rejected-returned, blocked |
| Axal | `AuditTrailPreview` | actor, action, time, source, resulting state, scope, optional note | rail, list | compact, expanded, empty |
| Axal | `WorkQueueRow` | identity, synthetic entity, priority, source, owner, due/review state, blocker, next action | compact, card | selected, waiting, ready, overdue |
| Pack | `LocalArtifactFlow` | source, local action, destination, custody facts, receipt | three-stage, compact | ready, running, complete, blocked |
| Pack | `PermissionExplainer` | permission, purpose, scope, touched/not-touched data, denial, fallback, source, request | inline, panel | required, optional, granted, denied, unavailable, not-requested |
| Pack | `CustodyBoundary` | claim, owner, inside/outside, crossing, never-crosses, user control, custody facts, network destination, source proof | ledger, banner | local-only, workspace-scoped, public-metadata-only, transfer-pending, no-transfer |
| Tools | `ToolDirectory` | header, result status, search, filters, tool list, no-results state, reset, local boundary, handoff | rows, cards | default, filtered, no-results |
| Tools | `ToolCard` | category, title, outcome, input, output, review, boundary, status, action | row, card | available, limited, unavailable |
| Tools | `LocalBoundaryBanner` | boundary claim, processing, account, upload, network/telemetry, review, source | draft, local | local-only, handoff |
| Tools | `OutputArtifactSummary` | artifact type/output, source, destination, draft/review, reviewer, limitation, next action | receipt, summary | generated-draft, ready-for-review, copied-downloaded, failed, unavailable |

Every contract also carries purpose, primary product mode, user job, semantic
root, maturity, evidence status, intended products, required anatomy fields,
copy obligations, prohibited claims, non-color rules, accessibility hooks,
trust boundaries, responsive behavior, reduced-motion behavior, forced-colors
behavior, a synthetic-data requirement, consumer responsibilities, the CSS
contract, exemplar routes, adopter guidance, and non-goals. The source registry
is authoritative; the gallery contract ledger and rendered state proofs derive
from it rather than a second inventory.

`requiredFields` covers every anatomy slot unless that slot's contract purpose
explicitly marks it optional or conditional. Validation derives this rule from
the authoritative contract itself, so adding anatomy cannot silently create an
optional implementation gap.

### Product visual grammar

The authoritative `productVisualGrammar` metadata exposes the approved semantic
hooks. These are not decorative utilities.

| Hook | Class | Meaning | Misuse prevented |
| --- | --- | --- | --- |
| Ledger rail | `sk-pattern-grammar--ledger-rail` | sequence, lineage, or grouped work | random decorative lines |
| File tab label | `sk-pattern-grammar--file-tab-label` | one real record or artifact type | fake browser tabs, icon-only labels, or seals |
| Provenance strip | `sk-pattern-grammar--provenance-strip` | source, release/reference, status, checked time, reviewer, limitation | evidence-free verification claims |
| Evidence aperture | `sk-pattern-grammar--evidence-aperture` | selected work beside source and review evidence | generic split panes without review meaning |
| Custody line | `sk-pattern-grammar--custody-line` | custodian, crossing, never-crosses facts, source, destination | implied automatic transfers |
| Quiet verified seal | `sk-pattern-grammar--quiet-verified-seal` | restrained source/verifier/time proof | government-approval resemblance |

### CSS and class helper

Load existing token and primitive CSS first, then the single public pattern CSS
entrypoint:

```css
@import "@sanchika/tokens/theme.css";
@import "@sanchika/primitives/styles.css";
@import "@sanchika/patterns/styles.css";
```

Use `patternClassName(name, { variant, state })` (also exported as
`productPatternClassName`) for finite hooks. The result order is base, variant,
then state, for example:

```ts
patternClassName("EvidencePanel", { variant: "rail", state: "under-review" });
// sk-pattern-evidence-panel sk-pattern-evidence-panel--rail sk-pattern-evidence-panel--state-under-review
```

Unknown names, variants, states, option keys, and inherited-property options
throw. Product code may compose around documented pattern classes, but must not
override package internals or invent private implementation variables.

### Compatibility

- `patternSpecs` remains the exact four-entry legacy array in its existing
  order and with its existing enumerable object shape.
- `ProductFamilyRouter` is the only approved alias and resolves by identity to
  the canonical `ProductRouteMap` contract.
- `ServiceSection` remains a retained legacy contract; it is not a synonym for
  one of the S7 canonical patterns.
- Speculative historical aliases such as `PublicPageHero`,
  `ReviewWorkbenchPreview`, `LocalArtifactBoundary`, `ReleaseProvenance`, and
  `SourceEvidenceSummary` are not exported because no repository or consumer
  evidence requires them.

Rendered package references live at `/patterns/` and at package-derived detail
routes such as `/patterns/publichero/`, `/patterns/reviewdeskpreview/`,
`/patterns/localartifactflow/`, and `/patterns/tooldirectory/`. S8 retired the
temporary `/lab/*` North Stars after final comparison; they do not ship or
remain as public compatibility routes.

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
- `TrustBrief`
- `TrustBriefValidationIssue`
- `validateTrustBrief`
- `DesignBrief`
- `DesignBriefValidationIssue`
- `validateDesignBrief`
- `EvidenceLoop`
- `EvidenceLoopAdoptionEvidence`
- `EvidenceLoopDecision`
- `EvidenceLoopRenderEvidence`
- `EvidenceLoopValidationIssue`
- `validateEvidenceLoop`

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

## Evidence Loop Contract

`EvidenceLoop` is the third AI-native harness contract. It connects a valid
`TrustBrief`, a matching valid `DesignBrief`, rendered browser evidence,
consumer adoption evidence, a decision, residual risks, and next actions into
one reviewable object.

Use `validateEvidenceLoop` after a surface has been implemented or prototyped
enough to inspect. It returns `EvidenceLoopValidationIssue` entries when the
loop is missing desktop render evidence, mobile render evidence, accessibility
review evidence, adoption evidence, changed files, rollback plan, or a valid
decision.

Current render evidence types are `desktop-screenshot`, `mobile-screenshot`,
`html-snapshot`, `accessibility-note`, and `manual-review-note`. Current adoption
statuses are `proposed`, `implemented`, `verified`, `blocked`, and `deferred`.
Current decisions are `ready-for-consumer-pr`, `needs-design-revision`,
`needs-verification`, and `blocked-by-boundary`.

An evidence loop can choose `ready-for-consumer-pr` only when adoption evidence
is `verified`. Ready loops cannot carry blocked, unknown, or missing residual
risks. Non-ready loops must name the next actions that would move the surface
toward verified adoption.

The evidence loop does not run a browser, generate screenshots, merge a consumer
PR, create routes, or publish packages. It is the typed handoff that forces
agents and engineers to record what the browser showed, what changed in the
consumer, how to roll back, and why the next decision is safe.

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

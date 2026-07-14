# Primitive Contracts

Sanchika primitives are framework-agnostic class and semantic contracts. They
do not ship components, event handlers, validation, application state, or
product-specific markup. The authoritative rich records are exported through
`primitiveSpecs` and the immutable `primitiveGroups`; this document explains
their shared architecture and usage.

## Contract architecture

Every new or materially refined primitive records:

- purpose, when to use it, and when not to use it;
- semantic element recommendation;
- class hooks and anatomy/slots;
- finite supported variants and required visible states;
- keyboard and screen-reader obligations;
- content rules;
- motion and reduced-motion behavior;
- forced-colors behavior;
- mobile behavior;
- examples and gallery coverage;
- consumer implementation responsibility.

`PrimitiveSpec` remains the exact v0.0.2 source-compatible contract: name,
role, tones, sizes, required states, state evidence, optional standards, and
accessibility. `PrimitiveContract` extends that shape with the richer S4
fields above. Existing source that declares a `PrimitiveSpec` does not need to
invent S4-only fields.

`stateEvidence` records the `attributes`, `selectors`, and `notes` that prove a
visible state. CSS selectors are styling evidence only. They do not imply that
Sanchika implements behavior that belongs to a consumer.

## Typed class API

The exported type surface includes `PrimitiveSpec`, `PrimitiveContract`,
`PrimitiveClassOptions`, `PrimitiveClassOptionsFor`, and
`LegacyPrimitiveName` alongside `textClassName`. The `primitiveSpecs` array
preserves the exact v0.0.2 ordered prefix (`Button`, `Card`, `Badge`, `Field`)
with the S4 inventory appended. `primitiveGroups.legacy` and
`primitiveGroups.foundation` provide immutable package-owned inventories for
gallery and consumer enumeration without changing that compatibility prefix.

Existing v0.0.2 calls remain unchanged:

```ts
primitiveClassName("Button", "brand", "md");
primitiveClassName("Card", "warning", "lg");
primitiveClassName("Badge", "success", "sm");
primitiveClassName("Field", "danger", "lg");
```

S4 primitives use a finite options object:

```ts
primitiveClassName("Container", { width: "wide" });
primitiveClassName("Stack", { gap: "md", align: "start" });
primitiveClassName("Split", { ratio: "primary", gap: "lg" });
primitiveClassName("Surface", { variant: "inset", padding: "md" });
primitiveClassName("Link", { variant: "quiet" });
textClassName("data");
```

Unknown primitives, option names, and variant values fail type checking and
throw at runtime. The API does not expose arbitrary spacing, breakpoints,
columns, colors, font sizes, or utility aliases.

Motion assists remain a separate finite API and are never added to
`primitiveSpecs`. Use `motionAssistUtilities` for immutable metadata and
`motionAssistClassName` for the exact eight opt-in class names. See
[`motion.md`](./motion.md) for semantic-first usage and reduced-motion rules.

## Foundation inventory

### Container

- Purpose: bound and center content with safe logical inline gutters.
- Use: reading, content, wide proof, and full-width shell regions.
- Do not use: page-specific widths, negative-margin full bleed, or component
  padding.
- Semantic element: consumer-owned `main`, `section`, `article`, `nav`, or
  neutral wrapper.
- Hooks: `.sk-container` plus `-width-reading`, `-width-content`,
  `-width-wide`, or `-width-full`.
- Anatomy: one root region.
- Variants: `width` = `reading | content | wide | full`.
- States: fluid default.
- Keyboard/screen reader: no added behavior or role.
- Content: long names and identifiers must wrap; full bleed is composed as a
  sibling rather than a negative-margin child.
- Motion/reduced motion: none.
- Forced colors: no authored color.
- Mobile: fluid with gutters and no horizontal overflow.
- Gallery: reading copy, content shell, and wide proof object.
- Consumer responsibility: choose the semantic region and full-bleed
  composition.

### Section

- Purpose: finite vertical rhythm and an optional real structural boundary.
- Use: major labelled or narrative regions.
- Do not use: dense controls, arbitrary padding, or as a Stack replacement.
- Semantic element: use `section` only with a heading; otherwise choose the
  correct landmark or neutral wrapper.
- Hooks: `.sk-section`, `-space-sm|md|lg`, `.sk-section-bordered`.
- Anatomy: root and optional visible heading.
- Variants: `space` = `sm | md | lg`; `boundary` = `none | bordered`.
- States: default and forced-colors boundary.
- Keyboard: none. Screen reader: preserve heading relationships and avoid
  unnamed section landmarks.
- Content: no first/last-child margin hacks.
- Motion/reduced motion: none.
- Mobile: token rhythm remains intentional.
- Gallery: labelled Section and Surface/Section composition.
- Consumer responsibility: heading hierarchy and landmark choice.

### Stack

- Purpose: one-dimensional vertical composition using `gap`.
- Use: forms, long compliance copy, records, and nested vertical groups.
- Do not use: two-dimensional peers or arbitrary spacing.
- Semantic element: consumer-owned list, fieldset, section, or neutral wrapper.
- Hooks: `.sk-stack`, `-gap-sm|md|lg`, `-align-start|center|stretch`.
- Anatomy: root and ordered children.
- Variants: finite gap and alignment values.
- States: default.
- Keyboard/screen reader: keep DOM and tab order; preserve list semantics.
- Content: child margins are not required; nesting owns only its selected gap.
- Motion/reduced motion: none.
- Forced colors: no authored color.
- Mobile: remains vertical and overflow-safe.
- Gallery: long text, nested stacks, and dense facts.
- Consumer responsibility: semantic markup and logical source order.

### Cluster

- Purpose: wrapping inline groups for actions, metadata, and compact facts.
- Use: action bars and metadata rows.
- Do not use: vertical prose, equal-card grids, or automatic pill styling.
- Semantic element: consumer-owned `nav`, list, or neutral wrapper.
- Hooks: `.sk-cluster`, finite `gap`, `align`, and `justify` modifiers.
- Anatomy: wrapping root and ordered children.
- Variants: gap `sm|md|lg`, alignment `start|center|end`, justification
  `start|between|end`.
- States: default wrap.
- Keyboard/screen reader: never reorder controls or invent roles.
- Content: visible labels and natural wrapping.
- Motion/reduced motion: none.
- Forced colors: no authored color.
- Mobile: wraps without overflow.
- Gallery: actions, metadata, and narrow wrapping.
- Consumer responsibility: semantic grouping and DOM order.

### Grid

- Purpose: repeated peer items with one intrinsic mode and explicit two- or
  three-column modes.
- Use: evidence groups and real peer directories.
- Do not use: one-dimensional actions, twelve-column utilities, or decorative
  bento layouts.
- Semantic element: prefer `ul`/`ol` for lists.
- Hooks: `.sk-grid`, `-columns-auto|2|3`, `-gap-sm|md|lg`.
- Anatomy: grid root and peer items.
- Variants: `columns` = `auto | 2 | 3`; finite gap.
- States: intrinsic/default and narrow one-column resolution.
- Keyboard/screen reader: source order and list semantics remain intact.
- Content: Grid does not imply Card children.
- Motion/reduced motion: none.
- Forced colors: no authored color.
- Mobile: explicit modes collapse to one column without overflow.
- Gallery: intrinsic evidence group and dense workbench facts.
- Consumer responsibility: peer meaning, semantic list markup, and item order.

### Split

- Purpose: asymmetrical primary and supporting regions.
- Use: proof plus explanation, work area plus evidence, and approved North Star
  structure.
- Do not use: equal peer groups, CSS/DOM reordering, or page-specific hero
  geometry.
- Semantic element: wrapper and child regions remain consumer-owned.
- Hooks: `.sk-split`, `-ratio-balanced|primary|supporting`, `-gap-sm|md|lg`,
  `.sk-split-primary`, `.sk-split-supporting`.
- Anatomy: primary and supporting slots.
- Variants: evidence-backed ratios and finite gaps.
- States: desktop split and narrow stacked state.
- Keyboard/screen reader: no CSS order changes; DOM reading order remains
  logical.
- Content: supporting content is not hidden on mobile.
- Motion/reduced motion: none.
- Forced colors: no authored color.
- Mobile: deliberate one-column stack.
- Gallery: page skeleton, Axal shell, and mobile stack.
- Consumer responsibility: semantic regions and source order.

### Surface

- Purpose: the canonical token-driven visual plane.
- Use: real default, raised, inset, muted, or inverse regions.
- Do not use: every section, decorative nesting, glow, glass, or implied
  semantics.
- Semantic element: consumer chooses `article`, `section`, `aside`, `fieldset`,
  or a neutral wrapper. Surface adds no role.
- Hooks: `.sk-surface`, finite variant and padding classes, or matching
  `data-surface` values.
- Anatomy: semantic root and consumer-owned content.
- Variants: `default | raised | inset | muted | inverse`; padding
  `none | sm | md | lg`.
- States: default and forced colors.
- Keyboard/screen reader: static surfaces are not focus targets; appearance
  adds no role.
- Content: borders lead hierarchy; nesting requires a real subrecord plane.
- Motion/reduced motion: none.
- Forced colors: CanvasText boundary; inverse returns to system colors.
- Mobile: finite padding and no inline overflow.
- Gallery: all variants plus good/bad nesting guidance.
- Consumer responsibility: semantic element, visible state copy, and restrained
  nesting.

### Divider

- Purpose: meaningful horizontal thematic separation.
- Use: native `hr` or correct `role="separator"` relationships.
- Do not use: decorative noise between every item. No vertical variant ships in
  S4 because no repeated composition requires it.
- Hooks/anatomy: `.sk-divider` on one separator root.
- Variants: none.
- States: default and forced colors.
- Keyboard: never focusable. Screen reader: semantics only when meaningful.
- Content: no visible content inside the divider.
- Motion/reduced motion: none.
- Mobile: full available inline size.
- Gallery: native thematic break and forced-colors boundary.
- Consumer responsibility: decide whether the separation is thematic.

### VisuallyHidden

- Purpose: keep concise assistive text in the accessibility tree.
- Use: accessible-name context and non-visual clarification.
- Do not use: visible instructions/errors, screen-reader hiding, or permanently
  hidden focusable controls.
- Semantic element: usually `span`; never apply permanently to a control.
- Hook/anatomy: `.sk-visually-hidden` on text.
- Variants: none. State: assistive-only default.
- Keyboard: focusable controls remain visible; skip links need a separate
  focus-reveal composition.
- Screen reader: content remains available and should not duplicate nearby copy
  unnecessarily.
- Motion/reduced motion: none.
- Forced colors: no authored color.
- Mobile/zoom: remains available without clipping failure.
- Gallery: assistive label and negative focusable-control guidance.
- Consumer responsibility: screen-reader and zoom testing.

## Typography roles

`Text` is a presentation contract, not a replacement for semantic HTML.

| Role | Use | Avoid |
| --- | --- | --- |
| `display` | one dominant public orientation heading | dense controls and tables |
| `heading` | section and proof-object headings | choosing heading level by appearance |
| `body` | normal prose | arbitrary size utilities |
| `lead` | concise introductory copy | long policy text |
| `caption` | hints and source metadata | critical instructions |
| `eyebrow` | restrained file/source/category labels | an eyebrow above every section |
| `data` | IDs, dates, amounts, versions, checksums | prose paragraphs |
| `mono` | literal source and code-like values | decorative monospace |

All roles wrap long Indian compliance names and identifiers. They add no motion,
role, or heading semantics. Consumers own semantic elements, heading order,
language metadata, and reading measure.

## Link versus Button

`Button` means command. `Link` means navigation.

- Button: prefer native `<button>` with explicit `type`. It follows the
  WAI-ARIA APG Button Pattern. A non-button `role="button"` implementation must
  support `Space` and `Enter`, provide an accessible name, and define focus after activation.
- Toggle Button: use `aria-pressed` and keep the visible label stable.
- Disabled Button: prefer native `disabled`. When `aria-disabled` or
  `data-disabled` is required, the consumer must suppress click, `Space`,
  `Enter`, and shortcuts and keep a visible disabled reason.
- Loading Button: `aria-busy` is the semantic loading state. `data-loading` is a
  visual hook only. Sanchika overlays the indicator so loading causes no layout
  shift; consumers implement runtime loading behavior.
- Link: use native `<a href>`, persistent underline, visible focus, deliberate
  visited behavior, and external/download naming where necessary.

Neither primitive silently converts the other semantic.

## LinkCard

LinkCard has exactly one accessible navigation target. Prefer a root anchor. A
single named-link pattern is acceptable only when the rest of the group is not
interactive.

Never nest buttons, links, checkboxes, menus, fields, or other controls inside
LinkCard. Its title and purpose must make sense outside visual position, focus
must cover the boundary, hover cannot be the only affordance, and the link must
work without JavaScript.

## Surface versus Card

Surface is the visual plane. Card is a specialized content grouping built on
that plane and retained for compatibility.

- Existing `.sk-card`, tone, size, and `primitiveClassName(...)` behavior stays
  valid.
- Existing consumers do not need new markup merely to keep rendering.
- Card keeps grouped-content padding and quiet elevation.
- Surface is preferred when the need is only a semantic visual plane.
- Card is not the default wrapper for every section.
- Nested Card-on-Card is discouraged unless the inner content is a real
  subrecord or evidence plane.

## Badge and Field compatibility

Badge and Field remain exported without removal or rename. Badge status remains
visible in text and never relies on color alone. Field keeps visible label,
focus, disabled, and associated error states; `aria-invalid` and
`aria-describedby` belong on the actual control, not the wrapper.

## Gallery and consumer proof

`/primitives/foundations/` renders the S4 contracts, all composition classes,
Link/Button distinction, LinkCard prohibition, Surface/Card model, nested
layouts, mobile behavior, and forced-colors boundaries. The four noindex North
Stars use S4 classes for major structure while retaining product-local
composition. Automated checks prove API, class, markup, and artifact coverage;
they do not prove visual quality.

## S5 search, state, and feedback primitives

All S5 records append after the complete S4-compatible registry. The
`Button`, `Card`, `Badge`, `Field` legacy prefix, enumerable own-property
shapes, and byte-equivalent legacy class outputs remain unchanged.
`primitiveGroups.searchStateFeedback` is the package-owned gallery inventory.

### SearchField

- Use for local filtering over a complete server-rendered collection. Avoid
  remote search, analytics, placeholder-only labels, and combobox behavior.
- Native contract: labelled `role="search"` form, `input type="search"`, named
  clear button, hint, polite atomic result status, and associated error.
- States: default, focus-visible, has-value, filtering, results, no-results,
  disabled, and error.
- Consumer owns filtering, announcement settling, Escape/clear/reset, focus
  retention, native search-affordance handling, and restoring the full list.
- Reference implementations scope queries to each root, require instance-unique
  label/status IDs, defer updates during IME composition, and mutate the live
  count only after the current result set settles.
- Mobile keeps the label, control, clear target, hint, result, and error
  reachable. Forced colors retain input/clear boundaries. No S5 motion occurs.

### InlineStatus

- Use for a compact visible operational state with optional source/time
  metadata. Avoid decorative badge clouds and color-only severity.
- Tones are `neutral`, `success`, `warning`, `danger`, and `info`, using the S3
  background/foreground/border triads.
- A visible marker plus understandable text is required. There is no implicit
  live region; consumers add status semantics only for a genuine dynamic update.
- Badge remains a separate v0.0.2 compatibility primitive.

### Skeleton

- Forms are finite: `text`, `block`, `row`, and `avatar`. Use avatar only when a
  real consumer requires it.
- Put `aria-busy` on the owning region and hide decorative shapes from
  assistive technology. A truthful textual pending state is safer when layout
  is unknown.
- The local component pulse uses existing S3 tokens, stops under reduced
  motion, and yields to a system-color outline in forced colors. It is not an
  S6 shared motion utility.

### EmptyState and ErrorState

- EmptyState distinguishes `empty`, `filtered`, and `unavailable`; it requires
  title, explanation, and a native Link/Button next action. It has no implicit
  alert role and no decorative illustration substitutes for guidance.
- ErrorState requires title, explanation, explicit retry/recovery, and may add
  support, source/reference ID, or native technical disclosure. Consumers
  choose alert/status semantics for context and must not move focus.
- Public examples are synthetic and contain no raw stack trace, blame, or false
  certainty. Both primitives wrap concisely on mobile and retain boundaries in
  forced colors.

### Progress and Stepper

- Progress prefers native `progress` for determinate values and always includes
  visible label/value text associated through `aria-labelledby` and
  `aria-describedby`. Indeterminate, complete, and meaningful error states must
  remain truthful; no JavaScript runtime or completion animation ships.
- Stepper prefers an ordered list. Complete, current, upcoming, and genuinely
  blocked states include visible wording/symbols; current uses
  `aria-current="step"`. Source order is process order.
- Stepper does not imply clickability. Pack may reuse its styling for a custody
  sequence, but S7 owns `LocalArtifactFlow` and S5 does not begin it.

### Disclosure and CopyButton

- Disclosure uses native `details`/`summary` for FAQ and simple reveal. It has
  closed, open, long-content, and nesting-guidance proof. No height animation,
  Tabs, Dialog, Popover, Accordion runtime, or S6 shared motion ships.
- CopyButton copies an explicitly named source/reference/version/checksum/ID
  only after user activation. Success and failure are visible and politely
  announced without moving focus; the consumer resets the label after the
  documented interval and provides a manual fallback on failure.
- Empty targets are disabled or rejected before clipboard access. Consumers
  serialize concurrent activation and own one bounded reset timer per button.
- Package CSS/contracts implement neither clipboard access nor event handlers.
  The gallery reference script is zero-dependency and app-local.

### Breadcrumb, Stat, and TableShell

- Breadcrumb is a named navigation landmark with an ordered list, decorative
  assistive-hidden separators, and an unlinked `aria-current="page"` item.
  Consumers own canonical route logic and any JSON-LD.
- Stat associates a label with its data/mono value and may include visible-word
  direction, source/time, and explanation. It adds no chart, count-up animation,
  or unsupported KPI certainty.
- TableShell is a native table wrapper, not a data grid. It requires caption and
  column headers, row headers where appropriate, compact/comfortable density,
  opt-in sticky header, right-aligned mono numeric cells, and a visible overflow
  affordance when horizontal scrolling is genuinely necessary.
- A viewport enters the tab order only when overflow is guaranteed or detected;
  a fitting table remains outside the tab order. The focused overflow region is
  associated with visible guidance.
- Sorting, filtering, pagination, selection, virtualization, grid keyboard
  behavior, and universal row-to-card transformation remain consumer-owned or
  out of S5. Priority data must remain reachable at mobile, 200%, and 400% zoom.

## Indian formatting utilities

`@sanchika/primitives` exports:

```ts
formatIndianNumber(value, options?)
formatIndianCurrency(value, options?)
formatIndianDate(value, options?)
formatIndianDateTime(value, options?)
formatGSTINDisplay(value)
formatPANDisplay(value)
formatPercentage(value, options?)
```

- Invalid/empty/non-finite numeric and invalid date input throws the typed
  `IndianFormatError` with code `ERR_SANCHIKA_FORMAT`.
- Exact `en-IN` grouping is the default. `display: "compact"` explicitly returns
  labelled lakh/crore output; exact mode never silently becomes approximate.
  Unless `maximumFractionDigits` is supplied explicitly, number and currency
  output preserves every fractional digit supplied by a finite number or strict
  decimal string. Use bigint or a decimal numeric string when a value exceeds
  JavaScript's safe-number range; both retain their exact digits. Numeric strings
  accept decimal notation only, so hexadecimal and other coercion syntax is
  rejected with `IndianFormatError`. Exact fractional input is bounded to the
  100 digits supported by `Intl.NumberFormat`; longer input is rejected rather
  than rounded. Default exact number output, and default INR output, also retain
  strings beyond the finite `Intl` number range; non-INR or additional formatting
  options on such values are rejected rather than approximated.
- ISO date-only input preserves its calendar day and defaults to `DD-MM-YYYY`.
  Date-time string input must be an ISO instant with `Z` or an explicit numeric
  offset; offset-less and invalid calendar strings throw `IndianFormatError`.
  Date-time output defaults to `Asia/Kolkata`; pass `timeZone` explicitly when
  a different instant presentation is required. Machine values remain ISO in
  the consumer data model.
- Percentage input defaults to fractions (`0.18` to `18%`); use
  `input: "percent"` for whole units (`18` to `18%`).
- PAN and GSTIN values are uppercased/grouped for display only. The helpers do
  not validate identity, format correctness, checksum, registration, or status;
  non-empty non-standard strings are returned normalized without a validity
  claim. Inputs are never mutated.

The focused `/primitives/search-state-feedback/` route renders all S5 contracts,
important states, no-JavaScript search evidence, reduced-motion Skeleton,
forced-colors boundaries, zoom-safe TableShell, and Indian formatter outputs.
Only SearchField and CopyButton use tiny gallery-local progressive enhancement.

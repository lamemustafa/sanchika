# @sanchika/primitives

Typed primitive contracts and CSS classes for Sanchika compliance interfaces.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Exports

- `@sanchika/primitives` - primitive specs, type-safe class composition, and
  state/accessibility metadata.
- `@sanchika/primitives/styles.css` - primitive CSS that consumes Sanchika token
  variables.
- Indian operational display helpers: `formatIndianNumber`,
  `formatIndianCurrency`, `formatIndianDate`, `formatIndianDateTime`,
  `formatGSTINDisplay`, `formatPANDisplay`, and `formatPercentage`.

`styles.css` is declared as the package side effect so production bundlers keep
primitive styles when the CSS export is imported.

## Boundary

This package provides framework-agnostic contracts and styles. It does not ship
React components, event handlers, validation logic, form libraries, app routes,
or product runtime behavior.

SearchField and CopyButton export semantic contracts and CSS only. Consumers
own filtering, settled result announcements, Escape/reset behavior, clipboard
activation, failure recovery, and feedback reset. The gallery contains tiny
zero-dependency reference scripts; they are not a universal package runtime.

Indian formatters throw `IndianFormatError` for empty, non-finite, or invalid
numeric/date input. Exact Indian grouping is the default and preserves supplied
fractional digits unless `maximumFractionDigits` explicitly requests rounding;
lakh/crore output requires `display: "compact"`; bigint and strict decimal
numeric strings retain exact digits beyond the safe-number range. Date-only ISO
values preserve their calendar day,
date-time output defaults to `Asia/Kolkata`, and an explicit `timeZone` may
override it. PAN and GSTIN helpers group display text only and do not validate
identity, checksum, registration, or status.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

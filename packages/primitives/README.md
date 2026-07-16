# @sanchika/primitives

Typed primitive contracts and CSS classes for Sanchika compliance interfaces.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Install From The GitHub Release

After the v0.1.0 GitHub release is published, declare both tarballs and map the
packed exact token dependency to its GitHub asset:

```json
{
  "dependencies": {
    "@sanchika/tokens": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.0/sanchika-tokens-0.1.0.tgz",
    "@sanchika/primitives": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.0/sanchika-primitives-0.1.0.tgz"
  }
}
```

Add the internal dependency mapping to `pnpm-workspace.yaml`:

```yaml
overrides:
  "@sanchika/tokens@0.1.0": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.0/sanchika-tokens-0.1.0.tgz"
```

Run `pnpm install`, review the lockfile, and verify the package-backed consumer.

These packages are not available from npm. Release tarballs are version 0.1.0;
private source manifests remain version 0.0.0 with `workspace:*` dependencies
and are rewritten only in verified temporary pack copies.

## Exports

- `@sanchika/primitives` - primitive specs, type-safe class composition, and
  state/accessibility metadata.
- `@sanchika/primitives/styles.css` - primitive CSS that consumes Sanchika token
  variables.
- Indian operational display helpers: `formatIndianNumber`,
  `formatIndianCurrency`, `formatIndianDate`, `formatIndianDateTime`,
  `formatGSTINDisplay`, `formatPANDisplay`, and `formatPercentage`.
- Motion-assist metadata and `motionAssistClassName` for the eight finite,
  opt-in CSS utilities documented in `docs/motion.md`.

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

Motion-assist exports contain metadata, a finite class-name lookup, and CSS
only. Consumers own state, announcements, timing, async work, native
interaction, authorization, evidence, and workflow meaning. Skeleton is the
only repeating package animation; reduced motion preserves settled content,
focus, and status boundaries.

Indian formatters throw `IndianFormatError` for empty, non-finite, or invalid
numeric/date input. Exact Indian grouping is the default and preserves supplied
fractional digits unless `maximumFractionDigits` explicitly requests rounding;
lakh/crore output requires `display: "compact"`; bigint and strict decimal
numeric strings retain exact digits beyond the safe-number range. Date-only ISO
values preserve their calendar day. Date-time strings require an ISO instant
with `Z` or an explicit numeric offset; output defaults to `Asia/Kolkata`, and
an explicit `timeZone` may override it. PAN and GSTIN helpers group display text
only and do not validate identity, checksum, registration, or status.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

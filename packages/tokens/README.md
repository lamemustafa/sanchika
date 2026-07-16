# @sanchika/tokens

Semantic OKLCH tokens for Sanchika compliance interfaces.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Install From The GitHub Release

After the v0.1.1 GitHub release is published:

```bash
pnpm add https://github.com/lamemustafa/sanchika/releases/download/v0.1.1/sanchika-tokens-0.1.1.tgz
```

This package is not available from npm. The release tarball is version 0.1.1;
the private source manifest deliberately remains version 0.0.0 and is rewritten
only in the verified temporary pack copy.

## Exports

- `@sanchika/tokens` - generated semantic metadata, groups, lookup helpers, and
  the one-release v0.0.2 compatibility collections.
- `@sanchika/tokens/theme.css` - CSS custom properties. Import this before
  primitive styles.

`theme.css` is declared as the package side effect so production bundlers keep
the token variables when the CSS export is imported.

## Authoring And Generation

`src/tokens.ts` is the only hand-authored token-value source. Run
`pnpm build:tokens` from the repository root to deterministically generate
`src/theme.css`, `src/generated.ts`, and `docs/tokens.md`. Generated files carry
an explicit header and must not be edited manually. `pnpm check:tokens` verifies
that generated output is current, validates aliases and metadata, runs contrast
and compatibility fixtures, and compares repeated clean-directory hashes.

The package makes no runtime font request and ships no font binary. Consumers
or the gallery own any later reviewed font asset and loading strategy.

## Boundary

This package contains portable design tokens only. It does not include product
runtime behavior, data access, auth, scraping, or application routes.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

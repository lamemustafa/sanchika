# @sanchika/patterns

Compliance-interface pattern contracts for Sanchika consumer products.

## Runtime And Status

This V0 package is private and unpublished. Its manifest declares
`engines.node: ">=24"`, so use Node 24+ for local build, typecheck, and consumer
verification. Do not lower the package runtime floor without a separate
compatibility pass against built artifacts and consumer checks.

## Install From The GitHub Release

After the v0.1.1 GitHub release is published, declare all three tarballs and
map the packed exact internal dependencies to their GitHub assets:

```json
{
  "dependencies": {
    "@sanchika/tokens": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.1/sanchika-tokens-0.1.1.tgz",
    "@sanchika/primitives": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.1/sanchika-primitives-0.1.1.tgz",
    "@sanchika/patterns": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.1/sanchika-patterns-0.1.1.tgz"
  }
}
```

Add the internal dependency mappings to `pnpm-workspace.yaml`:

```yaml
overrides:
  "@sanchika/tokens@0.1.1": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.1/sanchika-tokens-0.1.1.tgz"
  "@sanchika/primitives@0.1.1": "https://github.com/lamemustafa/sanchika/releases/download/v0.1.1/sanchika-primitives-0.1.1.tgz"
```

Run `pnpm install`, review the lockfile, and verify the package-backed consumer.

These packages are not available from npm. Release tarballs are version 0.1.1;
private source manifests remain version 0.0.0 with `workspace:*` dependencies
and are rewritten only in verified temporary pack copies.

## Exports

- `@sanchika/patterns` - the legacy `patternSpecs` compatibility collection,
  the 20-contract `productPatternContracts` inventory, four
  `productPatternGroups`, `patternAliases`, `productVisualGrammar`,
  `resolveProductPatternContract`, and the finite `patternClassName` helper.
- `@sanchika/patterns/styles.css` - the single public product-pattern CSS
  entrypoint. It consumes existing token variables and does not author tokens.
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
  - `ProductPatternName`
  - `ProductPatternContractFor<Name>`
  - `ProductPatternVariantNameFor<Name>`
  - `ProductPatternStateNameFor<Name>`
  - `ProductPatternResolvableName`

## Usage

```css
@import "@sanchika/tokens/theme.css";
@import "@sanchika/primitives/styles.css";
@import "@sanchika/patterns/styles.css";
```

```ts
import { patternClassName, resolveProductPatternContract } from "@sanchika/patterns";

patternClassName("LocalArtifactFlow", { variant: "three-stage", state: "complete" });
resolveProductPatternContract("ProductFamilyRouter"); // ProductRouteMap contract
```

The package owns shared composition, trust/state grammar, responsive collapse,
forced-colors hooks, and restrained motion behavior. Adopters own real data,
authorization, persistence, routing, product actions, and consumer-specific
copy. Do not override undocumented descendant classes or define private pattern
variables.

`ProductFamilyRouter` is the only compatibility alias. `ServiceSection` remains
in the exact legacy `patternSpecs` collection and has no S7 canonical alias.

## Boundary

Patterns describe required slots, states, visible signals, accessibility checks,
semantic obligations, product mode, user job, semantic root, required anatomy,
copy obligations, responsive and accessibility behavior, source/trust
boundaries, synthetic-data rules, consumer responsibilities, and non-goals.
They are not React components, app templates, APIs, persistence models, AI
runtimes, or legal/compliance advice.

## License And Marks

Source code is Apache-2.0. The Sanchika, ComplyEaze, Axal, Pack, and Tools names
and marks are not licensed for endorsement, official affiliation, or product
ownership claims.

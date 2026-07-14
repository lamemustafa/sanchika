import type {
  ProductPatternAccessibilityHooks,
  ProductPatternContract,
  ProductPatternCssContract,
  ProductPatternEvidenceStatus,
  ProductPatternMaturity,
} from "./product-pattern-types.ts";

type PatternDefinition = Omit<
  ProductPatternContract,
  "maturity" | "evidenceStatus" | "nonColorRules" | "css"
> & {
  maturity?: ProductPatternMaturity;
  evidenceStatus?: ProductPatternEvidenceStatus;
  nonColorRules?: readonly string[];
  accessibilityHooks: ProductPatternAccessibilityHooks;
};

const defaultNonColorRules = Object.freeze([
  "Every status includes visible text; hue, border, and position are supplementary signals only.",
  "Selected, blocked, pending, and unavailable states remain distinguishable in forced-colors mode.",
]);

export function defineProductPattern<const Definition extends PatternDefinition>(
  definition: Definition,
): Readonly<Definition & ProductPatternContract> {
  const slug = kebabCase(definition.name);
  const css = Object.freeze({
    entrypoint: "@sanchika/patterns/styles.css",
    baseClass: `sk-pattern-${slug}`,
    variantClassPrefix: `sk-pattern-${slug}--`,
    stateClassPrefix: `sk-pattern-${slug}--state-`,
  }) satisfies ProductPatternCssContract;

  return Object.freeze({
    maturity: "candidate",
    evidenceStatus: "synthetic-reference",
    ...definition,
    accessibilityHooks: Object.freeze({ ...definition.accessibilityHooks }),
    anatomy: freezeEntries(definition.anatomy),
    requiredFields: Object.freeze([...definition.requiredFields]),
    variants: freezeEntries(definition.variants),
    states: Object.freeze(definition.states.map((state) => Object.freeze({
      ...state,
      requiredVisibleSignals: Object.freeze([...state.requiredVisibleSignals]),
    }))),
    intendedProducts: Object.freeze([...definition.intendedProducts]),
    copyObligations: Object.freeze([...definition.copyObligations]),
    prohibitedClaims: Object.freeze([...definition.prohibitedClaims]),
    nonColorRules: Object.freeze([...(definition.nonColorRules ?? defaultNonColorRules)]),
    trustBoundaries: Object.freeze([...definition.trustBoundaries]),
    responsiveBehavior: Object.freeze([...definition.responsiveBehavior]),
    reducedMotionBehavior: Object.freeze([...definition.reducedMotionBehavior]),
    forcedColorsBehavior: Object.freeze([...definition.forcedColorsBehavior]),
    consumerResponsibilities: Object.freeze([...definition.consumerResponsibilities]),
    css,
    exemplarRoutes: Object.freeze([...definition.exemplarRoutes]),
    adopterGuidance: Object.freeze([...definition.adopterGuidance]),
    nonGoals: Object.freeze([...definition.nonGoals]),
  }) as Readonly<Definition & ProductPatternContract>;
}

function freezeEntries<Entry extends Record<string, unknown>>(entries: readonly Entry[]): readonly Readonly<Entry>[] {
  return Object.freeze(entries.map((entry) => Object.freeze({ ...entry })));
}

export function kebabCase(value: string): string {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

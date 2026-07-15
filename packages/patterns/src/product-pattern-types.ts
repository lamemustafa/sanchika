import type { ConsumerMode } from "./index.ts";

export type ProductPatternGroupName =
  | "public-product"
  | "axal-workspace"
  | "pack-local-utility"
  | "tools-local-artifact";

export type ProductPatternMaturity = "candidate" | "adoption-ready";

export type ProductPatternEvidenceStatus =
  | "synthetic-reference"
  | "browser-verified"
  | "consumer-verified";

export type ProductPatternPart = {
  name: string;
  purpose: string;
};

export type ProductPatternState = ProductPatternPart & {
  requiredVisibleSignals: readonly string[];
};

export type ProductPatternAccessibilityHooks = {
  semantics: string;
  keyboard: string;
  announcements: string;
  focusOrder: string;
};

export type ProductPatternCssContract = {
  entrypoint: "@sanchika/patterns/styles.css";
  baseClass: `sk-pattern-${string}`;
  variantClassPrefix: `sk-pattern-${string}--`;
  stateClassPrefix: `sk-pattern-${string}--state-`;
};

export type ProductPatternContract = {
  name: string;
  group: ProductPatternGroupName;
  purpose: string;
  primaryProductMode: ConsumerMode;
  userJob: string;
  maturity: ProductPatternMaturity;
  evidenceStatus: ProductPatternEvidenceStatus;
  intendedProducts: readonly ConsumerMode[];
  semanticRoot: string;
  anatomy: readonly ProductPatternPart[];
  requiredFields: readonly string[];
  variants: readonly ProductPatternPart[];
  states: readonly ProductPatternState[];
  copyObligations: readonly string[];
  prohibitedClaims: readonly string[];
  nonColorRules: readonly string[];
  accessibilityHooks: ProductPatternAccessibilityHooks;
  trustBoundaries: readonly string[];
  responsiveBehavior: readonly string[];
  reducedMotionBehavior: readonly string[];
  forcedColorsBehavior: readonly string[];
  syntheticRequirement: string;
  consumerResponsibilities: readonly string[];
  css: ProductPatternCssContract;
  exemplarRoutes: readonly `/${string}`[];
  adopterGuidance: readonly string[];
  nonGoals: readonly string[];
};

export type ProductPatternGroup<
  Name extends ProductPatternGroupName = ProductPatternGroupName,
  Contract extends ProductPatternContract = ProductPatternContract,
> = {
  name: Name;
  label: string;
  visualCharacter: string;
  patterns: readonly Contract[];
};

export type ProductPatternClassOptions<Contract extends ProductPatternContract> = {
  variant?: Contract["variants"][number]["name"];
  state?: Contract["states"][number]["name"];
};

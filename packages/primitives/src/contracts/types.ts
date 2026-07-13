export type PrimitiveTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";
export type PrimitiveSize = "sm" | "md" | "lg";

export type PrimitiveStateEvidence = {
  state: string;
  attributes: readonly string[];
  selectors: readonly string[];
  notes: string;
};

export type PrimitiveStandardReference = {
  id: string;
  sourceUrl: string;
  requirements: readonly string[];
};

export type PrimitiveAnatomy = {
  name: string;
  purpose: string;
};

export type PrimitiveVariant = {
  name: string;
  values: readonly string[];
  defaultValue?: string;
};

export type PrimitiveExample = {
  title: string;
  className: string;
  markup: string;
};

export type PrimitiveMotionContract = {
  behavior: string;
  reducedMotion: string;
};

export type PrimitiveSpec = {
  name: string;
  role: string;
  tones: readonly PrimitiveTone[];
  sizes: readonly PrimitiveSize[];
  requiredStates: readonly string[];
  stateEvidence: readonly PrimitiveStateEvidence[];
  standards?: readonly PrimitiveStandardReference[];
  accessibility: readonly string[];
};

export type PrimitiveContract = PrimitiveSpec & {
  purpose: string;
  whenToUse: readonly string[];
  whenNotToUse: readonly string[];
  semanticElement: string;
  classHooks: readonly string[];
  anatomy: readonly PrimitiveAnatomy[];
  variants: readonly PrimitiveVariant[];
  keyboardObligations: readonly string[];
  screenReaderObligations: readonly string[];
  contentRules: readonly string[];
  motion: PrimitiveMotionContract;
  forcedColorsBehavior: readonly string[];
  mobileBehavior: readonly string[];
  examples: readonly PrimitiveExample[];
  galleryCoverage: readonly string[];
  consumerResponsibilities: readonly string[];
};

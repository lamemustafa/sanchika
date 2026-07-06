export type TokenRole =
  | "bgBase"
  | "bgSurface"
  | "inkPrimary"
  | "inkMuted"
  | "borderControl"
  | "brandPrimary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type ColorTokenDefinition = {
  cssVariable: `--sk-${string}`;
  role: TokenRole;
  usage: string;
};

export type ColorTokenDefinitionFor<Role extends TokenRole> = Omit<ColorTokenDefinition, "role"> & {
  role: Role;
};

export type ColorTokenDefinitions = {
  [Role in TokenRole]: ColorTokenDefinitionFor<Role>;
};

export type SpacingTokenStep = "1" | "2" | "3" | "4" | "6" | "8" | "12" | "16";
export type RadiusTokenRole = "control" | "card";
export type TypographyTokenRole =
  | "fontSizeSm"
  | "fontSizeMd"
  | "fontSizeLg"
  | "fontWeightSemibold"
  | "fontWeightBold"
  | "lineHeightTight"
  | "lineHeightControl"
  | "lineHeightLabel"
  | "lineHeightBody";
export type SizeTokenRole = "controlSm" | "controlMd" | "controlLg" | "badgeMin";
export type ElevationTokenRole = "card";
export type FocusTokenRole = "outlineWidth" | "outlineOffset";
export type MotionTokenRole = "durationStandard" | "durationLoading" | "easingStandard" | "easingLinear";

export type SpacingTokenDefinition = {
  cssVariable: `--sk-space-${string}`;
  step: SpacingTokenStep;
  usage: string;
};

export type SpacingTokenDefinitionFor<Step extends SpacingTokenStep> = Omit<SpacingTokenDefinition, "step"> & {
  step: Step;
};

export type SpacingTokenDefinitions = {
  [Step in SpacingTokenStep]: SpacingTokenDefinitionFor<Step>;
};

export type RadiusTokenDefinition = {
  cssVariable: `--sk-radius-${string}`;
  role: RadiusTokenRole;
  usage: string;
};

export type RadiusTokenDefinitionFor<Role extends RadiusTokenRole> = Omit<RadiusTokenDefinition, "role"> & {
  role: Role;
};

export type RadiusTokenDefinitions = {
  [Role in RadiusTokenRole]: RadiusTokenDefinitionFor<Role>;
};

export type MotionTokenDefinition = {
  cssVariable: `--sk-motion-${string}`;
  role: MotionTokenRole;
  usage: string;
};

export type MotionTokenDefinitionFor<Role extends MotionTokenRole> = Omit<MotionTokenDefinition, "role"> & {
  role: Role;
};

export type MotionTokenDefinitions = {
  [Role in MotionTokenRole]: MotionTokenDefinitionFor<Role>;
};

export type TypographyTokenDefinition = {
  cssVariable: `--sk-${string}`;
  role: TypographyTokenRole;
  usage: string;
};

export type TypographyTokenDefinitionFor<Role extends TypographyTokenRole> = Omit<TypographyTokenDefinition, "role"> & {
  role: Role;
};

export type TypographyTokenDefinitions = {
  [Role in TypographyTokenRole]: TypographyTokenDefinitionFor<Role>;
};

export type SizeTokenDefinition = {
  cssVariable: `--sk-${string}`;
  role: SizeTokenRole;
  usage: string;
};

export type SizeTokenDefinitionFor<Role extends SizeTokenRole> = Omit<SizeTokenDefinition, "role"> & {
  role: Role;
};

export type SizeTokenDefinitions = {
  [Role in SizeTokenRole]: SizeTokenDefinitionFor<Role>;
};

export type ElevationTokenDefinition = {
  cssVariable: `--sk-${string}`;
  role: ElevationTokenRole;
  usage: string;
};

export type ElevationTokenDefinitionFor<Role extends ElevationTokenRole> = Omit<ElevationTokenDefinition, "role"> & {
  role: Role;
};

export type ElevationTokenDefinitions = {
  [Role in ElevationTokenRole]: ElevationTokenDefinitionFor<Role>;
};

export type FocusTokenDefinition = {
  cssVariable: `--sk-${string}`;
  role: FocusTokenRole;
  usage: string;
};

export type FocusTokenDefinitionFor<Role extends FocusTokenRole> = Omit<FocusTokenDefinition, "role"> & {
  role: Role;
};

export type FocusTokenDefinitions = {
  [Role in FocusTokenRole]: FocusTokenDefinitionFor<Role>;
};

export const colorTokens = {
  bgBase: {
    cssVariable: "--sk-color-bg-base",
    role: "bgBase",
    usage: "Page background",
  },
  bgSurface: {
    cssVariable: "--sk-color-bg-surface",
    role: "bgSurface",
    usage: "Cards, panels, and raised surfaces",
  },
  inkPrimary: {
    cssVariable: "--sk-color-ink-primary",
    role: "inkPrimary",
    usage: "Primary text",
  },
  inkMuted: {
    cssVariable: "--sk-color-ink-muted",
    role: "inkMuted",
    usage: "Secondary text",
  },
  borderControl: {
    cssVariable: "--sk-color-border-control",
    role: "borderControl",
    usage: "Control and input boundaries requiring non-text contrast",
  },
  brandPrimary: {
    cssVariable: "--sk-color-brand-primary",
    role: "brandPrimary",
    usage: "Primary action and brand anchor",
  },
  accent: {
    cssVariable: "--sk-color-accent",
    role: "accent",
    usage: "Sparse seal, verified, and emphasis accents",
  },
  success: {
    cssVariable: "--sk-color-success",
    role: "success",
    usage: "Positive completion and verified states",
  },
  warning: {
    cssVariable: "--sk-color-warning",
    role: "warning",
    usage: "Attention states",
  },
  danger: {
    cssVariable: "--sk-color-danger",
    role: "danger",
    usage: "Errors and destructive states",
  },
  info: {
    cssVariable: "--sk-color-info",
    role: "info",
    usage: "Neutral informational states",
  },
} as const satisfies ColorTokenDefinitions;

export const spacingTokens = {
  1: { cssVariable: "--sk-space-1", step: "1", usage: "Small inline gaps" },
  2: { cssVariable: "--sk-space-2", step: "2", usage: "Control and badge gaps" },
  3: { cssVariable: "--sk-space-3", step: "3", usage: "Compact control padding" },
  4: { cssVariable: "--sk-space-4", step: "4", usage: "Default control and card spacing" },
  6: { cssVariable: "--sk-space-6", step: "6", usage: "Large control and card spacing" },
  8: { cssVariable: "--sk-space-8", step: "8", usage: "Section spacing" },
  12: { cssVariable: "--sk-space-12", step: "12", usage: "Large section spacing" },
  16: { cssVariable: "--sk-space-16", step: "16", usage: "Page-level spacing" },
} as const satisfies SpacingTokenDefinitions;

export const radiusTokens = {
  control: {
    cssVariable: "--sk-radius-control",
    role: "control",
    usage: "Buttons, fields, badges, and other controls",
  },
  card: {
    cssVariable: "--sk-radius-card",
    role: "card",
    usage: "Grouped information surfaces",
  },
} as const satisfies RadiusTokenDefinitions;

export const motionTokens = {
  durationStandard: {
    cssVariable: "--sk-motion-duration-standard",
    role: "durationStandard",
    usage: "Default state transitions",
  },
  durationLoading: {
    cssVariable: "--sk-motion-duration-loading",
    role: "durationLoading",
    usage: "Looping loading indicators",
  },
  easingStandard: {
    cssVariable: "--sk-motion-easing-standard",
    role: "easingStandard",
    usage: "Default state transition easing",
  },
  easingLinear: {
    cssVariable: "--sk-motion-easing-linear",
    role: "easingLinear",
    usage: "Looping loading indicator easing",
  },
} as const satisfies MotionTokenDefinitions;

export const typographyTokens = {
  fontSizeSm: { cssVariable: "--sk-font-size-sm", role: "fontSizeSm", usage: "Small helper, badge, and hint text" },
  fontSizeMd: { cssVariable: "--sk-font-size-md", role: "fontSizeMd", usage: "Default control and label text" },
  fontSizeLg: { cssVariable: "--sk-font-size-lg", role: "fontSizeLg", usage: "Large control text" },
  fontWeightSemibold: {
    cssVariable: "--sk-font-weight-semibold",
    role: "fontWeightSemibold",
    usage: "Control labels and important field state text",
  },
  fontWeightBold: { cssVariable: "--sk-font-weight-bold", role: "fontWeightBold", usage: "Badge and compact status text" },
  lineHeightTight: { cssVariable: "--sk-line-height-tight", role: "lineHeightTight", usage: "Compact badge text" },
  lineHeightControl: { cssVariable: "--sk-line-height-control", role: "lineHeightControl", usage: "Button text" },
  lineHeightLabel: { cssVariable: "--sk-line-height-label", role: "lineHeightLabel", usage: "Field labels" },
  lineHeightBody: { cssVariable: "--sk-line-height-body", role: "lineHeightBody", usage: "Card and descriptive body text" },
} as const satisfies TypographyTokenDefinitions;

export const sizeTokens = {
  controlSm: { cssVariable: "--sk-size-control-sm", role: "controlSm", usage: "Small controls" },
  controlMd: { cssVariable: "--sk-size-control-md", role: "controlMd", usage: "Default controls" },
  controlLg: { cssVariable: "--sk-size-control-lg", role: "controlLg", usage: "Large controls" },
  badgeMin: { cssVariable: "--sk-size-badge-min", role: "badgeMin", usage: "Minimum badge height" },
} as const satisfies SizeTokenDefinitions;

export const elevationTokens = {
  card: { cssVariable: "--sk-elevation-card", role: "card", usage: "Subtle grouped-surface elevation" },
} as const satisfies ElevationTokenDefinitions;

export const focusTokens = {
  outlineWidth: { cssVariable: "--sk-focus-outline-width", role: "outlineWidth", usage: "Visible focus outline width" },
  outlineOffset: { cssVariable: "--sk-focus-outline-offset", role: "outlineOffset", usage: "Visible focus outline offset" },
} as const satisfies FocusTokenDefinitions;

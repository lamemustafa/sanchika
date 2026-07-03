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

export const primitiveSpecs = [
  {
    name: "Button",
    role: "Command trigger",
    tones: ["brand", "neutral", "danger"],
    sizes: ["sm", "md", "lg"],
    requiredStates: ["default", "hover", "focus-visible", "disabled", "loading"],
    stateEvidence: [
      {
        state: "default",
        attributes: ["type"],
        selectors: [".sk-button"],
        notes: "Default buttons must expose an accessible text label.",
      },
      {
        state: "hover",
        attributes: [],
        selectors: [".sk-button:hover"],
        notes: "Hover treatment must not be the only state cue.",
      },
      {
        state: "focus-visible",
        attributes: [],
        selectors: [".sk-button:focus-visible"],
        notes: "Keyboard focus must be visibly distinct from hover.",
      },
      {
        state: "disabled",
        attributes: ["disabled", "aria-disabled", "data-disabled"],
        selectors: [".sk-button:disabled", ".sk-button[aria-disabled=\"true\"]"],
        notes: "Disabled controls must stay understandable to assistive technology.",
      },
      {
        state: "loading",
        attributes: ["aria-busy", "data-loading"],
        selectors: [".sk-button[aria-busy=\"true\"]", ".sk-button[data-loading=\"true\"]"],
        notes: "Loading state must expose progress semantics in addition to motion.",
      },
    ],
    standards: [
      {
        id: "WAI-ARIA APG Button Pattern",
        sourceUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
        requirements: [
          "Prefer native <button> elements for command actions.",
          "If a non-button element uses role=\"button\", the consumer must provide Space and Enter activation.",
          "Toggle buttons use aria-pressed without changing the visible label.",
          "Consumers must define focus after activation according to the resulting workflow.",
        ],
      },
    ],
    accessibility: ["keyboard-operable", "visible-focus", "non-color-disabled-state"],
  },
  {
    name: "Card",
    role: "Grouped information surface",
    tones: ["neutral", "info", "success", "warning", "danger"],
    sizes: ["md", "lg"],
    requiredStates: ["default", "focus-visible"],
    stateEvidence: [
      {
        state: "default",
        attributes: [],
        selectors: [".sk-card"],
        notes: "Cards need semantic headings and visible status text when tone implies state.",
      },
      {
        state: "focus-visible",
        attributes: ["href"],
        selectors: [".sk-card:focus-visible"],
        notes: "Interactive cards must use native link or button semantics and show a visible keyboard focus outline.",
      },
    ],
    standards: [],
    accessibility: ["semantic-heading", "non-color-status-text"],
  },
  {
    name: "Badge",
    role: "Short status or classification label",
    tones: ["neutral", "success", "warning", "danger", "info"],
    sizes: ["sm", "md"],
    requiredStates: ["default"],
    stateEvidence: [
      {
        state: "default",
        attributes: [],
        selectors: [".sk-badge"],
        notes: "Badge text must name the status; tone color is supporting evidence only.",
      },
    ],
    standards: [],
    accessibility: ["visible-text-required", "color-not-only-signal"],
  },
  {
    name: "Field",
    role: "Accessible label, control, hint, and error wrapper",
    tones: ["neutral", "danger"],
    sizes: ["sm", "md", "lg"],
    requiredStates: ["default", "focus-visible", "disabled", "error"],
    stateEvidence: [
      {
        state: "default",
        attributes: ["for", "id", "name"],
        selectors: [".sk-field"],
        notes: "Fields must connect visible labels to controls.",
      },
      {
        state: "focus-visible",
        attributes: [],
        selectors: [".sk-field :is(input, textarea, select, [data-sk-control]):focus-visible"],
        notes: "Control focus must be visible for keyboard users.",
      },
      {
        state: "disabled",
        attributes: ["disabled", "data-disabled"],
        selectors: [".sk-field :is(input, textarea, select, [data-sk-control]):disabled", ".sk-field[data-disabled=\"true\"]"],
        notes: "Disabled field state must remain legible and discoverable.",
      },
      {
        state: "error",
        attributes: ["aria-invalid", "aria-describedby", "data-sk-error"],
        selectors: [
          ".sk-field[data-invalid=\"true\"]",
          ".sk-field :is(input, textarea, select, [data-sk-control])[aria-invalid=\"true\"]",
          "[data-sk-error]",
        ],
        notes: "Errors must be visible text associated with the control; aria-invalid and aria-describedby belong on the control.",
      },
    ],
    standards: [],
    accessibility: ["label-required", "error-associated", "keyboard-operable"],
  },
] as const satisfies readonly PrimitiveSpec[];

export type PrimitiveName = (typeof primitiveSpecs)[number]["name"];
export type PrimitiveSpecFor<Name extends PrimitiveName> = Extract<(typeof primitiveSpecs)[number], { name: Name }>;
export type PrimitiveToneFor<Name extends PrimitiveName> = PrimitiveSpecFor<Name>["tones"][number];
export type PrimitiveSizeFor<Name extends PrimitiveName> = PrimitiveSpecFor<Name>["sizes"][number];

export function primitiveClassName<Name extends PrimitiveName>(
  name: Name,
  tone: PrimitiveToneFor<Name> = "neutral" as PrimitiveToneFor<Name>,
  size: PrimitiveSizeFor<Name> = "md" as PrimitiveSizeFor<Name>,
): string {
  assertSupportedPrimitiveOption(name, tone, "tone");
  assertSupportedPrimitiveOption(name, size, "size");
  return `sk-${name.toLowerCase()} sk-tone-${tone} sk-size-${size}`;
}

function assertSupportedPrimitiveOption<Name extends PrimitiveName>(
  name: Name,
  value: string,
  option: "tone" | "size",
): void {
  const spec = primitiveSpecs.find((primitive) => primitive.name === name);
  const supported = option === "tone" ? spec?.tones : spec?.sizes;

  if (!supported?.includes(value as never)) {
    throw new Error(`Unsupported ${option} "${value}" for primitive ${name}`);
  }
}

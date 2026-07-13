import { primitiveSpecs } from "./registry.js";
import type { PrimitiveName, PrimitiveSizeFor, PrimitiveToneFor } from "./registry.js";

export type PrimitiveClassOptions = {
  Container: { width?: "reading" | "content" | "wide" | "full" };
  Section: { space?: "sm" | "md" | "lg"; boundary?: "none" | "bordered" };
  Stack: { gap?: "sm" | "md" | "lg"; align?: "start" | "center" | "stretch" };
  Cluster: { gap?: "sm" | "md" | "lg"; align?: "start" | "center" | "end"; justify?: "start" | "between" | "end" };
  Grid: { columns?: "auto" | "2" | "3"; gap?: "sm" | "md" | "lg" };
  Split: { ratio?: "balanced" | "primary" | "supporting"; gap?: "sm" | "md" | "lg" };
  Surface: { variant?: "default" | "raised" | "inset" | "muted" | "inverse"; padding?: "none" | "sm" | "md" | "lg" };
  Divider: Record<string, never>;
  VisuallyHidden: Record<string, never>;
  Text: { role?: "display" | "heading" | "body" | "lead" | "caption" | "eyebrow" | "data" | "mono" };
  Button: { tone?: PrimitiveToneFor<"Button">; size?: PrimitiveSizeFor<"Button"> };
  Link: { variant?: "default" | "quiet" };
  LinkCard: { variant?: "default" | "muted" };
  Card: { tone?: PrimitiveToneFor<"Card">; size?: PrimitiveSizeFor<"Card"> };
  Badge: { tone?: PrimitiveToneFor<"Badge">; size?: PrimitiveSizeFor<"Badge"> };
  Field: { tone?: PrimitiveToneFor<"Field">; size?: PrimitiveSizeFor<"Field"> };
};

export type PrimitiveClassOptionsFor<Name extends PrimitiveName> = PrimitiveClassOptions[Name];
export type LegacyPrimitiveName = "Button" | "Card" | "Badge" | "Field";
export type TextRole = NonNullable<PrimitiveClassOptions["Text"]["role"]>;

const baseClassNames = new Map(
  primitiveSpecs.map((primitive) => [primitive.name, `sk-${kebabCase(primitive.name)}`]),
) as ReadonlyMap<PrimitiveName, string>;

type OptionValues = ReadonlyMap<string, string>;
type PrimitiveOptions = ReadonlyMap<string, OptionValues>;

const optionClassNames = new Map<PrimitiveName, PrimitiveOptions>([
  ["Container", options([["width", values("sk-container-width", ["reading", "content", "wide", "full"]) ]])],
  ["Section", options([["space", values("sk-section-space", ["sm", "md", "lg"])], ["boundary", entries([["none", ""], ["bordered", "sk-section-bordered"]])]])],
  ["Stack", options([["gap", values("sk-stack-gap", ["sm", "md", "lg"])], ["align", values("sk-stack-align", ["start", "center", "stretch"]) ]])],
  ["Cluster", options([["gap", values("sk-cluster-gap", ["sm", "md", "lg"])], ["align", values("sk-cluster-align", ["start", "center", "end"])], ["justify", values("sk-cluster-justify", ["start", "between", "end"]) ]])],
  ["Grid", options([["columns", values("sk-grid-columns", ["auto", "2", "3"])], ["gap", values("sk-grid-gap", ["sm", "md", "lg"]) ]])],
  ["Split", options([["ratio", values("sk-split-ratio", ["balanced", "primary", "supporting"])], ["gap", values("sk-split-gap", ["sm", "md", "lg"]) ]])],
  ["Surface", options([["variant", values("sk-surface", ["default", "raised", "inset", "muted", "inverse"])], ["padding", values("sk-surface-pad", ["none", "sm", "md", "lg"]) ]])],
  ["Divider", options([])],
  ["VisuallyHidden", options([])],
  ["Text", options([["role", values("sk-text", ["display", "heading", "body", "lead", "caption", "eyebrow", "data", "mono"]) ]])],
  ["Button", options([["tone", toneValues(["brand", "neutral", "danger"])], ["size", sizeValues(["sm", "md", "lg"]) ]])],
  ["Link", options([["variant", values("sk-link", ["default", "quiet"]) ]])],
  ["LinkCard", options([["variant", values("sk-link-card", ["default", "muted"]) ]])],
  ["Card", options([["tone", toneValues(["neutral", "info", "success", "warning", "danger"])], ["size", sizeValues(["md", "lg"]) ]])],
  ["Badge", options([["tone", toneValues(["neutral", "success", "warning", "danger", "info"])], ["size", sizeValues(["sm", "md"]) ]])],
  ["Field", options([["tone", toneValues(["neutral", "danger"])], ["size", sizeValues(["sm", "md", "lg"]) ]])],
]);

export function primitiveClassName<Name extends LegacyPrimitiveName>(
  name: Name,
  tone?: PrimitiveToneFor<Name>,
  size?: PrimitiveSizeFor<Name>,
): string;
export function primitiveClassName<Name extends PrimitiveName>(
  name: Name,
  options?: PrimitiveClassOptionsFor<Name>,
): string;
export function primitiveClassName(
  name: PrimitiveName,
  toneOrOptions?: string | Record<string, string>,
  size?: string,
): string {
  const baseClassName = baseClassNames.get(name);
  if (!baseClassName) throw new Error(`Unknown primitive ${String(name)}`);

  if (isLegacyPrimitive(name) && (toneOrOptions === undefined || typeof toneOrOptions === "string")) {
    return composeOptions(name, { tone: toneOrOptions ?? "neutral", size: size ?? "md" });
  }

  if (typeof toneOrOptions === "string") {
    throw new Error(`Primitive ${name} requires an options object`);
  }

  return composeOptions(name, toneOrOptions ?? {});
}

export function textClassName(role: TextRole = "body"): string {
  return primitiveClassName("Text", { role });
}

function composeOptions(name: PrimitiveName, options: Record<string, string>): string {
  const baseClassName = baseClassNames.get(name);
  const supportedOptions = optionClassNames.get(name);
  if (!baseClassName || !supportedOptions) throw new Error(`Unknown primitive ${String(name)}`);
  const classes = [baseClassName];

  for (const [option, value] of Object.entries(options)) {
    const supportedValues = supportedOptions.get(option);
    if (!supportedValues?.has(value)) {
      throw new Error(`Unsupported ${option} "${value}" for primitive ${name}`);
    }
    const className = supportedValues.get(value);
    if (className) classes.push(className);
  }

  return classes.join(" ");
}

function isLegacyPrimitive(name: PrimitiveName): name is LegacyPrimitiveName {
  return name === "Button" || name === "Card" || name === "Badge" || name === "Field";
}

function options(entries: readonly (readonly [string, OptionValues])[]): PrimitiveOptions {
  return new Map(entries);
}

function entries(values: readonly (readonly [string, string])[]): OptionValues {
  return new Map(values);
}

function values(prefix: string, values: readonly string[]): OptionValues {
  return entries(values.map((value) => [value, `${prefix}-${value}`] as const));
}

function toneValues(values: readonly string[]): OptionValues {
  return valuesFor("sk-tone", values);
}

function sizeValues(values: readonly string[]): OptionValues {
  return valuesFor("sk-size", values);
}

function valuesFor(prefix: string, values: readonly string[]): OptionValues {
  return entries(values.map((value) => [value, `${prefix}-${value}`] as const));
}

function kebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

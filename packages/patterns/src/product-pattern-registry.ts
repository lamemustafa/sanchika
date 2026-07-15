import { axalWorkspacePatterns } from "./contracts/axal-workspace.ts";
import { packLocalUtilityPatterns } from "./contracts/pack-local-utility.ts";
import { publicProductPatterns } from "./contracts/public-product.ts";
import { toolsLocalArtifactPatterns } from "./contracts/tools-local-artifact.ts";
import { kebabCase } from "./product-pattern-definition.ts";
import type {
  ProductPatternClassOptions,
  ProductPatternContract,
  ProductPatternGroup,
} from "./product-pattern-types.ts";

export const productPatternGroups = Object.freeze([
  Object.freeze({
    name: "public-product",
    label: "Public and product pages",
    visualCharacter: "Advisory publication with visible proof and restrained action hierarchy.",
    patterns: publicProductPatterns,
  }),
  Object.freeze({
    name: "axal-workspace",
    label: "Axal professional workspace",
    visualCharacter: "Dense professional workspace with evidence, ownership, and human review in one path.",
    patterns: axalWorkspacePatterns,
  }),
  Object.freeze({
    name: "pack-local-utility",
    label: "Pack local utility",
    visualCharacter: "Custody-first local utility with explicit permission, network, and artifact boundaries.",
    patterns: packLocalUtilityPatterns,
  }),
  Object.freeze({
    name: "tools-local-artifact",
    label: "Tools local artifact",
    visualCharacter: "Quiet browser-local directory focused on job, draft output, and review responsibility.",
    patterns: toolsLocalArtifactPatterns,
  }),
] as const satisfies readonly ProductPatternGroup[]);

export const productPatternContracts = Object.freeze([
  ...publicProductPatterns,
  ...axalWorkspacePatterns,
  ...packLocalUtilityPatterns,
  ...toolsLocalArtifactPatterns,
] as const);

export const patternContracts = productPatternContracts;
export const patternGroups = productPatternGroups;

export type ProductPatternContractUnion = (typeof productPatternContracts)[number];
export type ProductPatternName = ProductPatternContractUnion["name"];
export type ProductPatternContractFor<Name extends ProductPatternName> = Extract<
  ProductPatternContractUnion,
  { name: Name }
>;
export type ProductPatternVariantNameFor<Name extends ProductPatternName> =
  ProductPatternContractFor<Name>["variants"][number]["name"];
export type ProductPatternStateNameFor<Name extends ProductPatternName> =
  ProductPatternContractFor<Name>["states"][number]["name"];

type ContractMap = {
  [Name in ProductPatternName]: ProductPatternContractFor<Name>;
};

export const productPatternContractByName = Object.freeze(
  Object.fromEntries(productPatternContracts.map((contract) => [contract.name, contract])),
) as Readonly<ContractMap>;

export const patternAliases = Object.freeze({
  ProductFamilyRouter: productPatternContractByName.ProductRouteMap,
} as const);

export const retainedLegacyPatternNames = Object.freeze(["ProductFamilyRouter", "ServiceSection"] as const);

export type ProductPatternAliasName = keyof typeof patternAliases;
export type ProductPatternResolvableName = ProductPatternName | ProductPatternAliasName;

export type ProductPatternCanonicalNameFor<Name extends ProductPatternResolvableName> = Name extends ProductPatternAliasName
  ? (typeof patternAliases)[Name]["name"]
  : Extract<Name, ProductPatternName>;

export type ProductPatternStateNameForResolvable<Name extends ProductPatternResolvableName> =
  ProductPatternStateNameFor<ProductPatternCanonicalNameFor<Name>>;

export function resolveProductPatternContract<Name extends ProductPatternResolvableName>(
  name: Name,
): ProductPatternContractFor<ProductPatternCanonicalNameFor<Name>>;
export function resolveProductPatternContract(name: string): ProductPatternContract | undefined;
export function resolveProductPatternContract(name: string): ProductPatternContract | undefined {
  if (Object.hasOwn(productPatternContractByName, name)) {
    return productPatternContractByName[name as ProductPatternName];
  }
  if (Object.hasOwn(patternAliases, name)) {
    return patternAliases[name as ProductPatternAliasName];
  }
  return undefined;
}

export function productPatternClassName<Name extends ProductPatternResolvableName>(
  name: Name,
  options: ProductPatternClassOptions<ProductPatternContractFor<ProductPatternCanonicalNameFor<Name>>> = {},
): string {
  const contract = resolveProductPatternContract(name);
  if (!contract) throw new TypeError(`Unknown Sanchika product pattern: ${name}`);

  const prototype = Object.getPrototypeOf(options);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`Unknown ${contract.name} class options prototype`);
  }
  for (const key of Object.keys(options)) {
    if (key !== "variant" && key !== "state") throw new TypeError(`Unknown ${contract.name} class option: ${key}`);
  }

  const classes = [contract.css.baseClass];
  if (Object.hasOwn(options, "variant") && options.variant !== undefined) {
    assertNamedOption(contract, "variant", options.variant, contract.variants);
    classes.push(`${contract.css.variantClassPrefix}${kebabCase(options.variant)}`);
  }
  if (Object.hasOwn(options, "state") && options.state !== undefined) {
    assertNamedOption(contract, "state", options.state, contract.states);
    classes.push(`${contract.css.stateClassPrefix}${kebabCase(options.state)}`);
  }
  return classes.join(" ");
}

export const patternClassName = productPatternClassName;

function assertNamedOption(
  contract: ProductPatternContract,
  option: "variant" | "state",
  value: string,
  allowed: readonly { name: string }[],
): void {
  if (!allowed.some((entry) => entry.name === value)) {
    throw new TypeError(`Unknown ${contract.name} ${option}: ${value}`);
  }
}

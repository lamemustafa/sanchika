const inheritedRuntimeKeys = ["toString", "constructor", "__proto__", "prototype", "hasOwnProperty"];
const expectedLegacyNames = ["Button", "Card", "Badge", "Field"];
const expectedLegacyCompatibility = {
  Button: {
    role: "Command trigger",
    accessibility: ["keyboard-operable", "visible-focus", "non-color-disabled-state"],
    standards: [{
      id: "WAI-ARIA APG Button Pattern",
      sourceUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
      requirements: [
        "Prefer native <button> elements for command actions.",
        "If a non-button element uses role=\"button\", the consumer must provide Space and Enter activation.",
        "Toggle buttons use aria-pressed without changing the visible label.",
        "Consumers must define focus after activation according to the resulting workflow.",
      ],
    }],
  },
  Card: { role: "Grouped information surface", accessibility: ["semantic-heading", "non-color-status-text"], standards: [] },
  Badge: { role: "Short status or classification label", accessibility: ["visible-text-required", "color-not-only-signal"], standards: [] },
  Field: { role: "Accessible label, control, hint, and error wrapper", accessibility: ["label-required", "error-associated", "keyboard-operable"], standards: [] },
};
const expectedAppendedNames = [
  "Container",
  "Section",
  "Stack",
  "Cluster",
  "Grid",
  "Split",
  "Surface",
  "Divider",
  "VisuallyHidden",
  "Text",
  "Link",
  "LinkCard",
  "SearchField",
  "InlineStatus",
  "Skeleton",
  "EmptyState",
  "ErrorState",
  "Progress",
  "Stepper",
  "Disclosure",
  "CopyButton",
  "Breadcrumb",
  "Stat",
  "TableShell",
];
const expectedS5Names = ["SearchField", "InlineStatus", "Skeleton", "EmptyState", "ErrorState", "Progress", "Stepper", "Disclosure", "CopyButton", "Breadcrumb", "Stat", "TableShell"];
const expectedFoundationNames = [
  "Container",
  "Section",
  "Stack",
  "Cluster",
  "Grid",
  "Split",
  "Surface",
  "Divider",
  "VisuallyHidden",
  "Text",
  "Button",
  "Link",
  "LinkCard",
  "Card",
];

export function validatePrimitiveRuntime({ primitiveClassName, primitiveGroups, primitiveSpecs, textClassName }) {
  const failures = [];
  let count = 0;
  const check = (condition, message) => {
    count += 1;
    if (!condition) failures.push(message);
  };
  const expectThrow = (label, operation) => {
    count += 1;
    try {
      operation();
      failures.push(`${label} must reject the runtime value`);
    } catch (error) {
      if (!/Unknown primitive|Unsupported/.test(String(error))) {
        failures.push(`${label} rejected with an unexpected diagnostic: ${String(error)}`);
      }
    }
  };

  const names = primitiveSpecs.map((primitive) => primitive.name);
  check(names.slice(0, expectedLegacyNames.length).join(",") === expectedLegacyNames.join(","), "primitiveSpecs must preserve the v0.0.2 ordered prefix");
  check(names.slice(expectedLegacyNames.length).join(",") === expectedAppendedNames.join(","), "primitiveSpecs must append the exact S4 and S5 inventory after the legacy prefix");
  check(new Set(names).size === names.length, "primitiveSpecs must not contain duplicate names");
  const baseClassOutputs = primitiveSpecs.map((primitive) => primitiveClassName(primitive.name));
  check(new Set(baseClassOutputs).size === baseClassOutputs.length, "primitive base class outputs must not collide");
  for (const primitive of primitiveSpecs) {
    const variantNames = primitive.variants.map((variant) => variant.name);
    check(new Set(variantNames).size === variantNames.length, `${primitive.name} must not declare duplicate variant names`);
    for (const variant of primitive.variants) check(new Set(variant.values).size === variant.values.length, `${primitive.name}.${variant.name} must not declare duplicate values`);
  }
  const copyButton = primitiveSpecs.find((primitive) => primitive.name === "CopyButton");
  check(copyButton?.variants.find((variant) => variant.name === "size")?.values.join(",") === "sm,md", "CopyButton contract variants must expose the complete finite size API");

  for (const name of expectedLegacyNames) {
    const primitive = primitiveSpecs.find((candidate) => candidate.name === name);
    const expected = expectedLegacyCompatibility[name];
    check(Boolean(primitive && Object.hasOwn(primitive, "standards")), `${name} must retain an own enumerable standards property`);
    check(Object.keys(primitive ?? {}).includes("standards"), `${name}.standards must remain enumerable`);
    check(JSON.stringify(primitive?.standards) === JSON.stringify(expected.standards), `${name}.standards must retain its exact legacy value`);
    check(primitive?.role === expected.role, `${name}.role must retain its exact legacy value`);
    check(JSON.stringify(primitive?.accessibility) === JSON.stringify(expected.accessibility), `${name}.accessibility must retain its exact legacy value`);
  }

  check(Object.isFrozen(primitiveGroups), "primitiveGroups must be immutable");
  for (const [groupName, group, expectedNames] of [
    ["legacy", primitiveGroups.legacy, expectedLegacyNames],
    ["foundation", primitiveGroups.foundation, expectedFoundationNames],
    ["searchStateFeedback", primitiveGroups.searchStateFeedback, expectedS5Names],
  ]) {
    const groupNames = group.map((primitive) => primitive.name);
    check(Object.isFrozen(group), `primitiveGroups.${groupName} must be immutable`);
    check(groupNames.join(",") === expectedNames.join(","), `primitiveGroups.${groupName} must expose the exact authoritative inventory`);
    check(new Set(groupNames).size === groupNames.length, `primitiveGroups.${groupName} must not contain duplicate entries`);
    check(group.every((primitive) => primitiveSpecs.includes(primitive)), `primitiveGroups.${groupName} entries must reference primitiveSpecs objects`);
  }

  check(primitiveClassName("Button", "brand", "md") === "sk-button sk-tone-brand sk-size-md", "Button legacy output must remain byte-equivalent");
  check(primitiveClassName("Card", "warning", "lg") === "sk-card sk-tone-warning sk-size-lg", "Card legacy output must remain byte-equivalent");
  check(textClassName("data") === "sk-text sk-text-data", "Text data output must remain stable");

  for (const inheritedKey of inheritedRuntimeKeys) {
    expectThrow(`primitive name ${inheritedKey}`, () => primitiveClassName(inheritedKey));
    expectThrow(`text role ${inheritedKey}`, () => textClassName(inheritedKey));

    for (const primitive of primitiveSpecs) {
      expectThrow(`${primitive.name} option name ${inheritedKey}`, () =>
        primitiveClassName(primitive.name, JSON.parse(`{"${inheritedKey}":"fixture"}`)),
      );
      for (const variant of primitive.variants) {
        expectThrow(`${primitive.name}.${variant.name} value ${inheritedKey}`, () =>
          primitiveClassName(primitive.name, { [variant.name]: inheritedKey }),
        );
      }
    }
  }

  for (const primitive of primitiveSpecs) {
    const variant = primitive.variants[0];
    if (!variant) continue;
    const inheritedOptions = Object.create({ [variant.name]: variant.values[0] });
    expectThrow(`${primitive.name} inherited ${variant.name} option`, () => primitiveClassName(primitive.name, inheritedOptions));
  }

  check(!Object.hasOwn(Object.prototype, "polluted"), "primitive lookup fixtures must not mutate Object.prototype");
  return { count, failures };
}

export function validateIndianFormatting(formatters) {
  const failures = [];
  let count = 0;
  const check = (condition, message) => { count += 1; if (!condition) failures.push(message); };
  const throwsFormatError = (label, operation) => {
    count += 1;
    try { operation(); failures.push(`${label} must throw IndianFormatError`); }
    catch (error) { if (error?.name !== "IndianFormatError" || error?.code !== "ERR_SANCHIKA_FORMAT") failures.push(`${label} threw an unexpected error: ${String(error)}`); }
  };
  const {
    formatGSTINDisplay, formatIndianCurrency, formatIndianDate, formatIndianDateTime,
    formatIndianNumber, formatPANDisplay, formatPercentage,
  } = formatters;

  check(formatIndianNumber(0) === "0", "zero must format exactly");
  check(formatIndianNumber(1.23456) === "1.23456", "default exact number formatting must preserve fractional digits");
  check(formatIndianNumber("1.234567890123456789") === "1.234567890123456789", "decimal strings must retain exact fractional digits");
  check(formatIndianNumber("1.2300") === "1.2300", "decimal strings must retain explicit trailing fractional zeros");
  check(formatIndianNumber(1e-7) === "0.0000001", "small exponential number values must format without default rounding");
  check(formatIndianNumber(-1234567.5, { maximumFractionDigits: 1 }) === "-12,34,567.5", "negative decimal must use Indian grouping");
  check(formatIndianNumber(99999) === "99,999", "thousands must remain exact");
  check(formatIndianNumber(100000) === "1,00,000", "lakh boundary must remain exact by default");
  check(formatIndianNumber(10000000) === "1,00,00,000", "crore boundary must remain exact by default");
  check(formatIndianNumber(100000, { display: "compact" }) === "1 lakh", "explicit compact lakh must be labelled");
  check(formatIndianNumber(12500000, { display: "compact" }) === "1.25 crore", "explicit compact crore must be labelled");
  check(formatIndianNumber(0.000001, { maximumFractionDigits: 6 }) === "0.000001", "very small values must remain deterministic");
  check(formatIndianNumber(9007199254740991) === "9,00,71,99,25,47,40,991", "very large safe integers must remain deterministic");
  check(formatIndianNumber(123456789012345678901234567890n) === "1,23,45,67,89,01,23,45,67,89,01,23,45,67,890", "very large bigint values must retain exact digits");
  check(formatIndianNumber("123456789012345678901234567890") === "1,23,45,67,89,01,23,45,67,89,01,23,45,67,890", "very large numeric strings must retain exact digits");
  const enormousInteger = `1${"0".repeat(400)}`;
  check(formatIndianNumber(enormousInteger).replaceAll(",", "") === enormousInteger, "numeric strings beyond Number range must remain exact");
  check(formatIndianCurrency(`-${enormousInteger}`).replaceAll(",", "") === `-₹${enormousInteger}.00`, "default INR strings beyond Number range must remain exact");
  check(formatIndianCurrency(1234567, { maximumFractionDigits: 0 }) === "₹12,34,567", "INR currency must use Indian grouping");
  check(formatIndianCurrency("1.23456") === "₹1.23456", "exact INR currency must preserve supplied fractional digits");
  check(formatIndianCurrency(12500000, { display: "compact" }) === "₹1.25 crore", "compact currency must be explicitly labelled");
  check(formatIndianCurrency(-12500000, { display: "compact" }) === "-₹1.25 crore", "compact negative currency must retain locale sign placement");
  check(formatPercentage(0.18) === "18%", "fraction percentage convention must be default");
  check(formatPercentage(18, { input: "percent" }) === "18%", "whole percentage convention must be explicit");
  check(formatIndianDate("2026-07-14") === "14-07-2026", "ISO date-only must default to DD-MM-YYYY");
  check(formatIndianDate("2024-02-29") === "29-02-2024", "valid leap day must format");
  check(formatIndianDateTime("2026-07-14T00:00:00Z", { timeZone: "Asia/Kolkata" }).includes("14 Jul 2026"), "date-time must honor explicit Asia/Kolkata timezone");
  check(formatIndianDateTime("2026-07-14T00:00:00Z", { timeZone: "UTC" }).includes("14 Jul 2026"), "date-time must honor explicit UTC timezone");
  check(Boolean(formatIndianDateTime("2026-07-14T00:00:00Z", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" })), "date-time must support explicit component options without conflicting defaults");
  check(formatPANDisplay("abcde" + "1234" + "f") === "ABCDE 1234 F", "PAN display grouping must be deterministic");
  check(formatGSTINDisplay("27" + "abcde" + "1234" + "f1z5") === "27 ABCDE 1234 F 1 Z 5", "GSTIN display grouping must be deterministic");
  check(formatPANDisplay("not-a-pan") === "NOT-A-PAN", "identifier display must not claim validity");
  check(formatGSTINDisplay("not-a-gstin") === "NOT-A-GSTIN", "GSTIN display must not claim registration or checksum validity");

  for (const [label, operation] of [
    ["NaN", () => formatIndianNumber(Number.NaN)], ["Infinity", () => formatIndianNumber(Number.POSITIVE_INFINITY)],
    ["empty numeric string", () => formatIndianNumber("")], ["hex numeric string", () => formatIndianNumber("0x10")],
    ["exponent numeric string", () => formatIndianNumber("1e3")], ["null-like numeric input", () => formatIndianNumber(null)],
    ["overlong exact fraction", () => formatIndianNumber(`1.${"1".repeat(101)}`)],
    ["invalid date", () => formatIndianDate("not-a-date")], ["invalid date-only", () => formatIndianDate("2026-02-29")],
    ["empty PAN", () => formatPANDisplay(" ")], ["empty GSTIN", () => formatGSTINDisplay("")],
  ]) throwsFormatError(label, operation);

  const original = " abcde1234f ";
  formatPANDisplay(original);
  check(original === " abcde1234f ", "formatting must not mutate the original value");
  return { count, failures };
}

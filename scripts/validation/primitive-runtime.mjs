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
];
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
  check(names.slice(expectedLegacyNames.length).join(",") === expectedAppendedNames.join(","), "primitiveSpecs must append the exact S4 inventory after the legacy prefix");
  check(new Set(names).size === names.length, "primitiveSpecs must not contain duplicate names");

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

  check(!Object.hasOwn(Object.prototype, "polluted"), "primitive lookup fixtures must not mutate Object.prototype");
  return { count, failures };
}

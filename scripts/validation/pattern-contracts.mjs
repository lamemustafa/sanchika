import ts from "typescript";
import { requiredPatternContracts } from "./contrast.mjs";
import { validateTrustBoundarySignals } from "./trust-boundary-contracts.mjs";

const a11ySourceByCriterion = new Map([
  ["WCAG22:1.3.1", "https://www.w3.org/TR/WCAG22/#info-and-relationships"],
  ["WCAG22:1.4.3", "https://www.w3.org/TR/WCAG22/#contrast-minimum"],
  ["WCAG22:1.4.11", "https://www.w3.org/TR/WCAG22/#non-text-contrast"],
  ["WCAG22:2.1.1", "https://www.w3.org/TR/WCAG22/#keyboard"],
  ["WCAG22:2.4.7", "https://www.w3.org/TR/WCAG22/#focus-visible"],
  ["WCAG22:2.5.8", "https://www.w3.org/TR/WCAG22/#target-size-minimum"],
  ["WCAG22:3.3.1", "https://www.w3.org/TR/WCAG22/#error-identification"],
  ["WCAG22:3.3.2", "https://www.w3.org/TR/WCAG22/#labels-or-instructions"],
  ["WCAG22:4.1.2", "https://www.w3.org/TR/WCAG22/#name-role-value"],
  ["WCAG22:4.1.3", "https://www.w3.org/TR/WCAG22/#status-messages"],
]);

const requiredPatternCriterionReferences = [
  ["WCAG22:1.3.1", "https://www.w3.org/TR/WCAG22/#info-and-relationships"],
  ["WCAG22:1.4.3", "https://www.w3.org/TR/WCAG22/#contrast-minimum"],
  ["WCAG22:1.4.11", "https://www.w3.org/TR/WCAG22/#non-text-contrast"],
  ["WCAG22:2.1.1", "https://www.w3.org/TR/WCAG22/#keyboard"],
  ["WCAG22:2.4.7", "https://www.w3.org/TR/WCAG22/#focus-visible"],
  ["WCAG22:2.5.8", "https://www.w3.org/TR/WCAG22/#target-size-minimum"],
  ["WCAG22:3.3.1", "https://www.w3.org/TR/WCAG22/#error-identification"],
  ["WCAG22:3.3.2", "https://www.w3.org/TR/WCAG22/#labels-or-instructions"],
  ["WCAG22:4.1.2", "https://www.w3.org/TR/WCAG22/#name-role-value"],
  ["WCAG22:4.1.3", "https://www.w3.org/TR/WCAG22/#status-messages"],
];

const ariaLiveByRole = new Map([
  ["status", "polite"],
  ["alert", "assertive"],
]);

export function validatePatternContracts({ patternSource, patternDocs, fail }) {
  for (const requiredPatternContract of requiredPatternContracts) {
    if (!patternSource.includes(requiredPatternContract)) {
      fail(`pattern specs must declare ${requiredPatternContract}`);
    }
    if (!patternDocs.includes(requiredPatternContract)) {
      fail(`docs/patterns.md must document ${requiredPatternContract}`);
    }
  }

  for (const [criterion, sourceUrl] of requiredPatternCriterionReferences) {
    if (!patternSource.includes(`criterion: "${criterion}"`) || !patternSource.includes(`sourceUrl: "${sourceUrl}"`)) {
      fail(`PatternA11ySourceReference must include ${criterion} with ${sourceUrl}`);
    }
    if (!patternDocs.includes(criterion) || !patternDocs.includes(sourceUrl)) {
      fail(`docs/patterns.md must document ${criterion} with ${sourceUrl}`);
    }
  }

  const patternSpecs = extractPatternSpecs(patternSource, fail);
  for (const pattern of patternSpecs) {
    const topLevelSlots = new Set(pattern.requiredSlots.map((slot) => slot.name));
    for (const state of pattern.requiredStates) {
      for (const slotName of state.requiredSlots ?? []) {
        if (!topLevelSlots.has(slotName)) {
          fail(`${pattern.name}.${state.name} requires unknown slot ${slotName}`);
        }
      }
      validateA11yChecks({ pattern, state, topLevelSlots, fail });
      validateProgrammaticStatus({ pattern, state, topLevelSlots, fail });
      validateTrustBoundarySignals({ pattern, state, fail });
    }
  }

  for (const requiredDocFragment of ["ariaAtomic", "aria-atomic"]) {
    if (!patternDocs.includes(requiredDocFragment)) {
      fail(`docs/patterns.md must document ${requiredDocFragment}`);
    }
  }
}

function validateA11yChecks({ pattern, state, topLevelSlots, fail }) {
  if (state.a11yChecks.length === 0) {
    fail(`${pattern.name}.${state.name} must declare at least one structured a11y check`);
  }

  const stateSlots = state.requiredSlots.length > 0 ? new Set(state.requiredSlots) : topLevelSlots;
  const checkIds = new Set();
  for (const check of state.a11yChecks) {
    if (!check.id) fail(`${pattern.name}.${state.name} a11y check must include id`);
    if (checkIds.has(check.id)) {
      fail(`${pattern.name}.${state.name} must not repeat a11y check id ${check.id}`);
    }
    checkIds.add(check.id);

    const expectedSourceUrl = a11ySourceByCriterion.get(check.criterion);
    if (!expectedSourceUrl) {
      fail(`${pattern.name}.${state.name}.${check.id} uses unknown criterion ${check.criterion}`);
    }
    if (expectedSourceUrl && check.sourceUrl !== expectedSourceUrl) {
      fail(`${pattern.name}.${state.name}.${check.id} must pair ${check.criterion} with ${expectedSourceUrl}`);
    }
    if (!check.requirement) fail(`${pattern.name}.${state.name}.${check.id} must include requirement`);
    if (!check.manualTest) fail(`${pattern.name}.${state.name}.${check.id} must include manualTest`);
    for (const slotName of check.slotRefs) {
      if (!stateSlots.has(slotName)) {
        fail(`${pattern.name}.${state.name}.${check.id} references unknown slot ${slotName}`);
      }
    }
  }
}

function validateProgrammaticStatus({ pattern, state, topLevelSlots, fail }) {
  if (!state.programmaticStatus) {
    return;
  }

  const expectedAriaLive = ariaLiveByRole.get(state.programmaticStatus.role);
  if (!expectedAriaLive) {
    fail(`${pattern.name}.${state.name} programmaticStatus role must be status or alert`);
  }
  if (expectedAriaLive && state.programmaticStatus.ariaLive !== expectedAriaLive) {
    fail(`${pattern.name}.${state.name} programmaticStatus must pair ${state.programmaticStatus.role} with aria-live ${expectedAriaLive}`);
  }
  if (state.programmaticStatus.ariaAtomic !== true) {
    fail(`${pattern.name}.${state.name} programmaticStatus must set ariaAtomic true`);
  }
  if (!state.programmaticStatus.requirement) {
    fail(`${pattern.name}.${state.name} programmaticStatus must include requirement`);
  }
  if (!state.a11yChecks.some((check) => check.criterion === "WCAG22:4.1.3")) {
    fail(`${pattern.name}.${state.name} programmaticStatus must include a WCAG22:4.1.3 status-message a11y check`);
  }
  const stateSlots = state.requiredSlots.length > 0 ? new Set(state.requiredSlots) : topLevelSlots;
  for (const slotName of state.programmaticStatus.slotRefs) {
    if (!stateSlots.has(slotName)) {
      fail(`${pattern.name}.${state.name} programmaticStatus references unknown slot ${slotName}`);
    }
  }
}

function extractPatternSpecs(patternSource, fail) {
  const sourceFile = ts.createSourceFile("packages/patterns/src/index.ts", patternSource, ts.ScriptTarget.Latest, true);
  const declaration = findPatternSpecsDeclaration(sourceFile);
  const initializer = declaration ? unwrapExpression(declaration.initializer) : null;

  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    fail("patternSpecs must be a static array literal for contract validation");
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const object = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(object)) {
      fail("patternSpecs entries must be static object literals");
      return [];
    }

    return [extractPatternSpec(object, fail)];
  });
}

function findPatternSpecsDeclaration(sourceFile) {
  let found = null;
  sourceFile.forEachChild(function visit(node) {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "patternSpecs") {
      found = node;
      return;
    }
    node.forEachChild(visit);
  });
  return found;
}

function extractPatternSpec(object, fail) {
  return {
    name: readStringProperty(object, "name", fail),
    requiredSlots: readObjectArrayProperty(object, "requiredSlots", fail).map((slot) => ({
      name: readStringProperty(slot, "name", fail),
    })),
    requiredStates: readObjectArrayProperty(object, "requiredStates", fail).map((state) => ({
      name: readStringProperty(state, "name", fail),
      requiredVisibleSignals: readStringArrayProperty(state, "requiredVisibleSignals", fail),
      requiredSlots: readStringArrayProperty(state, "requiredSlots", fail, true),
      a11yChecks: readA11yChecks(state, fail),
      programmaticStatus: readProgrammaticStatus(state, fail),
    })),
  };
}

function readA11yChecks(object, fail) {
  const checks = readObjectArrayProperty(object, "a11yChecks", fail);
  return checks.map((check) => ({
    id: readStringProperty(check, "id", fail),
    criterion: readStringProperty(check, "criterion", fail),
    sourceUrl: readStringProperty(check, "sourceUrl", fail),
    requirement: readStringProperty(check, "requirement", fail),
    manualTest: readStringProperty(check, "manualTest", fail),
    slotRefs: readStringArrayProperty(check, "slotRefs", fail, true),
  }));
}

function readProgrammaticStatus(object, fail) {
  const initializer = unwrapExpression(readPropertyInitializer(object, "programmaticStatus"));
  if (!initializer) return null;
  if (!ts.isObjectLiteralExpression(initializer)) {
    fail("patternSpecs programmaticStatus must be a static object");
    return null;
  }

  return {
    role: readStringProperty(initializer, "role", fail),
    ariaLive: readStringProperty(initializer, "ariaLive", fail),
    ariaAtomic: readBooleanProperty(initializer, "ariaAtomic", fail),
    requirement: readStringProperty(initializer, "requirement", fail),
    slotRefs: readStringArrayProperty(initializer, "slotRefs", fail, true),
  };
}

function readObjectArrayProperty(object, propertyName, fail) {
  const initializer = unwrapExpression(readPropertyInitializer(object, propertyName));
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    fail(`patternSpecs ${propertyName} must be a static array`);
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const unwrapped = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(unwrapped)) {
      fail(`patternSpecs ${propertyName} entries must be static objects`);
      return [];
    }
    return [unwrapped];
  });
}

function readStringArrayProperty(object, propertyName, fail, optional = false) {
  const initializer = unwrapExpression(readPropertyInitializer(object, propertyName));
  if (!initializer) return optional ? [] : failAndReturnEmpty(fail, `patternSpecs ${propertyName} must exist`);
  if (!ts.isArrayLiteralExpression(initializer)) {
    fail(`patternSpecs ${propertyName} must be a static string array`);
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const value = readStringLiteral(unwrapExpression(element));
    if (value === null) {
      fail(`patternSpecs ${propertyName} entries must be static strings`);
      return [];
    }
    return [value];
  });
}

function readStringProperty(object, propertyName, fail) {
  const value = readStringLiteral(unwrapExpression(readPropertyInitializer(object, propertyName)));
  if (value === null) {
    fail(`patternSpecs ${propertyName} must be a static string`);
    return "";
  }
  return value;
}

function readBooleanProperty(object, propertyName, fail) {
  const initializer = unwrapExpression(readPropertyInitializer(object, propertyName));
  if (!initializer || initializer.kind !== ts.SyntaxKind.TrueKeyword) {
    fail(`patternSpecs ${propertyName} must be true`);
    return false;
  }
  return true;
}

function readPropertyInitializer(object, propertyName) {
  const property = object.properties.find(
    (entry) =>
      ts.isPropertyAssignment(entry) &&
      ((ts.isIdentifier(entry.name) && entry.name.text === propertyName) ||
        (ts.isStringLiteral(entry.name) && entry.name.text === propertyName)),
  );
  return property?.initializer ?? null;
}

function unwrapExpression(expression) {
  let current = expression;
  while (current && (ts.isAsExpression(current) || ts.isSatisfiesExpression(current))) {
    current = current.expression;
  }
  return current;
}

function readStringLiteral(expression) {
  return expression && (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))
    ? expression.text
    : null;
}

function failAndReturnEmpty(fail, message) {
  fail(message);
  return [];
}

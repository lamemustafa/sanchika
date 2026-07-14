import vm from "node:vm";

class MockNode {}
class MockElement extends MockNode {}

export async function runGalleryReferenceRuntimeFixtures({ searchScript, toolsScript, copyScript }) {
  const failures = [];
  let count = 0;
  const check = (condition, message) => { count += 1; if (!condition) failures.push(message); };

  const searchTimers = createTimers();
  const firstSearch = createSearchRoot(["alpha", "beta"]);
  const secondSearch = createSearchRoot(["gamma"]);
  runScript(searchScript, { roots: [firstSearch.root, secondSearch.root], timers: searchTimers });
  check(firstSearch.input.listeners.has("input") && secondSearch.input.listeners.has("input"), "SearchField script must initialize every root instance");
  let searchSubmitPrevented = false;
  firstSearch.field.emit("submit", { preventDefault() { searchSubmitPrevented = true; } });
  check(searchSubmitPrevented, "SearchField form must prevent enhanced submit navigation");
  firstSearch.input.focused = true;
  firstSearch.input.value = "beta";
  firstSearch.input.emit("compositionstart", {});
  firstSearch.input.emit("input", { isComposing: true });
  check(firstSearch.items.every((item) => !item.hidden) && searchTimers.activeCount() === 0, "SearchField must defer filtering and announcements during IME composition");
  firstSearch.input.emit("compositionend", {});
  check(firstSearch.field.dataset.filtering === "true" && firstSearch.status.attributes.get("aria-busy") === "true", "SearchField must expose filtering before the settled announcement");
  check(firstSearch.count.textContent === "2" && firstSearch.input.focused, "SearchField must preserve the previous live count and input focus until settling");
  searchTimers.flush();
  check(firstSearch.count.textContent === "1" && firstSearch.countLabel.textContent === "result", "SearchField must publish one settled singular result announcement");
  check(!("filtering" in firstSearch.field.dataset) && !firstSearch.status.attributes.has("aria-busy"), "SearchField must clear filtering and busy state after settling");
  firstSearch.input.value = "a";
  firstSearch.input.emit("input", { isComposing: false });
  firstSearch.input.value = "alpha";
  firstSearch.input.emit("input", { isComposing: false });
  check(searchTimers.activeCount() === 1, "SearchField rapid input must retain only one bounded announcement timer");
  firstSearch.errorClear.emit("click", {});
  check(firstSearch.errorInput.value === "" && firstSearch.errorClear.disabled && firstSearch.errorInput.focused && firstSearch.errorField.dataset.hasValue === "false", "SearchField error clear must reset only its local fixture and retain focus");
  check(secondSearch.errorInput.value === "Synthetic failure" && !secondSearch.errorClear.disabled, "SearchField error clear state must not collide across instances");

  const toolsTimers = createTimers();
  const firstTools = createToolsRoot();
  const secondTools = createToolsRoot();
  runScript(toolsScript, { roots: [firstTools.root, secondTools.root], timers: toolsTimers });
  check(firstTools.input.listeners.has("input") && secondTools.input.listeners.has("input"), "Tools filter must initialize every directory instance");
  firstTools.input.value = "notice";
  firstTools.input.emit("compositionstart", {});
  firstTools.input.emit("input", { isComposing: true });
  check(toolsTimers.activeCount() === 0, "Tools filter must not announce intermediate IME input");
  firstTools.input.emit("compositionend", {});
  check(firstTools.form.dataset.filtering === "true" && toolsTimers.activeCount() === 1, "Tools filter must expose one settled composition update");
  toolsTimers.flush();
  firstTools.input.value = "";
  firstTools.filters.emit("click", { target: firstTools.categoryButtons[1] });
  check(!firstTools.clear.hidden && firstTools.form.dataset.hasValue === "true" && firstTools.cards[1].hidden, "Tools category-only filter must expose Clear and filter results");
  let toolsEscapePrevented = false;
  firstTools.root.emit("keydown", { key: "Escape", preventDefault() { toolsEscapePrevented = true; } });
  check(toolsEscapePrevented && firstTools.clear.hidden && firstTools.input.focused && firstTools.cards.every((card) => !card.hidden), "Tools Escape must reset a category-only filter and return focus to search");

  const copyTimers = createTimers();
  const successfulCopy = createCopyButton("checksum");
  const emptyCopy = createCopyButton("   ");
  const writes = [];
  let resolveWrite;
  const writePromise = new Promise((resolve) => { resolveWrite = resolve; });
  runScript(copyScript, {
    buttons: [successfulCopy.button, emptyCopy.button],
    timers: copyTimers,
    clipboard: { writeText(value) { writes.push(value); return writePromise; } },
  });
  check(emptyCopy.button.disabled, "CopyButton must disable an empty target before activation");
  await emptyCopy.button.emitAsync("click", {});
  check(writes.length === 0, "Disabled empty CopyButton must never call the clipboard");
  const firstClick = successfulCopy.button.emitAsync("click", {});
  const secondClick = successfulCopy.button.emitAsync("click", {});
  check(writes.length === 1, "Concurrent CopyButton activation must perform one clipboard write");
  resolveWrite();
  await Promise.all([firstClick, secondClick]);
  check(copyTimers.activeCount() === 1 && successfulCopy.button.dataset.copyState === "copied", "CopyButton must own one bounded reset timer after success");
  check(successfulCopy.status.textContent === "Copied to clipboard." && !successfulCopy.button.attributes.has("aria-busy"), "CopyButton success must remain visible and clear busy state");

  return { count, failures };
}

function runScript(source, { roots = [], buttons = [], timers, clipboard = { writeText: async () => {} } }) {
  const document = {
    querySelectorAll(selector) {
      if (selector === "[data-s5-directory]" || selector === "[data-tool-directory]") return roots;
      if (selector === "[data-copy-button]") return buttons;
      return [];
    },
  };
  vm.runInNewContext(source, {
    document,
    navigator: { clipboard },
    Node: MockNode,
    Element: MockElement,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });
}

function createElement({ textContent = "", value = "", dataset = {} } = {}) {
  const listeners = new Map();
  return Object.assign(new MockElement(), {
    attributes: new Map(), dataset: { ...dataset }, disabled: false, focused: false, hidden: false,
    listeners, textContent, value,
    addEventListener(type, listener) { listeners.set(type, listener); },
    emit(type, event) { return listeners.get(type)?.(event); },
    async emitAsync(type, event) { return listeners.get(type)?.(event); },
    setAttribute(name, value) { this.attributes.set(name, String(value)); },
    removeAttribute(name) { this.attributes.delete(name); },
    hasAttribute(name) { return this.attributes.has(name); },
    focus() { this.focused = true; },
    closest() { return this; },
  });
}

function createSearchRoot(searchValues) {
  const field = createElement();
  const input = createElement();
  const clear = createElement();
  const reset = createElement();
  const count = createElement({ textContent: String(searchValues.length) });
  const countLabel = createElement({ textContent: "results" });
  const status = createElement();
  const empty = createElement();
  const errorField = createElement({ dataset: { hasValue: "true" } });
  const errorInput = createElement({ value: "Synthetic failure" });
  const errorClear = createElement();
  const items = searchValues.map((search) => createElement({ dataset: { search } }));
  const selectors = new Map([
    ["[data-s5-search-field]", field], ["[data-s5-search]", input], ["[data-s5-clear]", clear],
    ["[data-s5-reset]", reset], ["[data-s5-count]", count], ["[data-s5-count-label]", countLabel],
    ["[data-sk-result-status]", status], ["[data-s5-empty]", empty],
    ["[data-s5-error-field]", errorField], ["[data-s5-error-search]", errorInput], ["[data-s5-error-clear]", errorClear],
  ]);
  return { root: { querySelector: (selector) => selectors.get(selector), querySelectorAll: () => items }, field, input, count, countLabel, status, items, errorField, errorInput, errorClear };
}

function createToolsRoot() {
  const form = createElement();
  const input = createElement();
  const clear = createElement();
  const filters = createElement();
  const categoryButtons = [createElement({ dataset: { toolCategory: "all" } }), createElement({ dataset: { toolCategory: "GST" } })];
  categoryButtons[0].setAttribute("aria-pressed", "true");
  categoryButtons[1].setAttribute("aria-pressed", "false");
  filters.querySelectorAll = () => categoryButtons;
  const count = createElement({ textContent: "2" });
  const status = createElement();
  count.parentElement = status;
  const empty = createElement();
  const reset = createElement();
  const cards = [createElement({ dataset: { category: "GST", search: "notice" } }), createElement({ dataset: { category: "Income tax", search: "dates" } })];
  const selectors = new Map([
    ["[data-tool-search-form]", form], ["[data-tool-search]", input], ["[data-tool-clear]", clear],
    ["[data-tool-filters]", filters], ["[data-tool-count]", count], ["[data-tool-empty]", empty], ["[data-tool-reset]", reset],
  ]);
  const root = createElement();
  root.querySelector = (selector) => selectors.get(selector);
  root.querySelectorAll = () => cards;
  return { root, form, input, clear, filters, categoryButtons, cards };
}

function createCopyButton(value) {
  const label = createElement({ textContent: "Copy checksum" });
  const status = createElement();
  const target = createElement({ textContent: value });
  const fixture = { querySelector(selector) { return selector === "[data-copy-source]" ? target : status; } };
  const button = createElement();
  button.querySelector = () => label;
  button.closest = () => fixture;
  return { button, label, status, target };
}

function createTimers() {
  let nextId = 0;
  const pending = new Map();
  return {
    setTimeout(callback) { nextId += 1; pending.set(nextId, callback); return nextId; },
    clearTimeout(id) { pending.delete(id); },
    activeCount() { return pending.size; },
    flush() { const callbacks = [...pending.values()]; pending.clear(); for (const callback of callbacks) callback(); },
  };
}

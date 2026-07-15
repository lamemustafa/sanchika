import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import AxeBuilder from "@axe-core/playwright";
import { chromium, devices } from "playwright-core";
import { assertGalleryBuildArtifacts } from "../../../scripts/validation/build-artifacts.mjs";

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const dist = join(appRoot, "dist");
const evidenceRoot = join(repositoryRoot, "output/playwright/s8-gallery-showcase");
const evidenceDir = join(evidenceRoot, "browser");
const routeEvidenceDir = join(evidenceRoot, "final-routes");
const rectificationEvidenceDir = join(evidenceRoot, "after/post-rectification");
const specialEvidenceDir = join(evidenceRoot, "special-modes");
const routes = ["/", "/foundations/", "/foundations/tokens/", "/foundations/motion/", "/primitives/", "/primitives/searchfield/", "/patterns/", "/patterns/reviewdeskpreview/", "/modes/", "/modes/complyeaze/", "/modes/axal/", "/modes/pack/", "/modes/tools/", "/adoption/"];
const axeRoutes = ["/", "/foundations/tokens/", "/primitives/searchfield/", "/patterns/reviewdeskpreview/", "/modes/axal/", "/modes/pack/", "/adoption/"];
const viewports = [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }];
const mobileDevice = devices["Pixel 5"];
const mobileLabProfile = {
  name: "sanchika-mobile-lab-v1",
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: mobileDevice.userAgent,
  cpuSlowdownMultiplier: 4,
  network: {
    latencyMs: 150,
    downloadBitsPerSecond: 1_600_000,
    uploadBitsPerSecond: 750_000,
    connectionType: "cellular4g",
  },
};
const failures = [];
const evidence = {
  schemaVersion: 3,
  build: null,
  environment: null,
  captureProfile: {
    viewports,
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "no-preference",
    forcedColors: "none",
    fontFaces: [],
    fontFiles: [],
  },
  evidenceFiles: [],
  routes: [],
  axe: [],
  axeExceptions: [],
  axeNegativeControl: null,
  search: null,
  performance: null,
  assets: null,
  jsDisabled: null,
  reducedMotion: null,
  forcedColors: null,
  zoomEquivalent: null,
  reflow400: [],
};

if (!existsSync(join(dist, "index.html"))) throw new Error("Gallery output is missing; run pnpm build first.");
const galleryBuild = assertGalleryBuildArtifacts({ root: repositoryRoot, commandName: "pnpm gallery:browser:check" });
evidence.build = {
  sourceFingerprint: galleryBuild.sourceFingerprint,
  artifactFingerprint: galleryBuild.artifactFingerprint,
  packages: galleryBuild.packages,
};
const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;
const { browser, launchMode } = await launchEvidenceBrowser();
evidence.environment = { browser: "Chromium", browserVersion: browser.version(), headless: true, launchMode };
for (const directory of [evidenceDir, routeEvidenceDir, rectificationEvidenceDir, specialEvidenceDir]) mkdirSync(directory, { recursive: true });
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: evidence.captureProfile.deviceScaleFactor,
      colorScheme: evidence.captureProfile.colorScheme,
      reducedMotion: evidence.captureProfile.reducedMotion,
      forcedColors: evidence.captureProfile.forcedColors,
    });
    for (const route of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      const requestOrigins = new Set();
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("request", (request) => requestOrigins.add(new URL(request.url()).origin));
      const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts?.ready);
      const mechanics = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
        const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((element) => Number(element.tagName.slice(1)));
        const controls = [...document.querySelectorAll("a[href],button,input,select,textarea,summary")].map((element, index) => {
          const rect = element.getBoundingClientRect();
          const name = element.getAttribute("aria-label") || element.labels?.[0]?.textContent?.trim() || element.textContent?.trim() || element.getAttribute("title") || element.getAttribute("value") || "";
          const scrollOwner = element.closest("nav, [role=region]");
          const intentionallyScrollable = scrollOwner && ["auto", "scroll"].includes(getComputedStyle(scrollOwner).overflowX);
          return {
            index,
            name,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + (rect.width / 2),
            centerY: rect.top + (rect.height / 2),
            primaryAction: element.matches(".sk-pattern-public-hero__action, .sk-empty-state__actions .sk-button, .sk-button.sk-tone-brand"),
            visible: rect.width > 0 && rect.height > 0,
            clipped: !intentionallyScrollable && (rect.right > document.documentElement.clientWidth + 1 || rect.left < -1),
          };
        }).filter((control) => control.visible);
        const targetSizeViolations = controls.filter((control) => {
          if (control.width >= 24 && control.height >= 24) return false;
          return controls.some((other) => other.index !== control.index && Math.hypot(other.centerX - control.centerX, other.centerY - control.centerY) < 24);
        });
        return {
          mainCount: document.querySelectorAll("main").length,
          h1Count: document.querySelectorAll("h1").length,
          duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
          headingSkip: headings.some((level, index) => index > 0 && level > headings[index - 1] + 1),
          unnamedControls: controls.filter((control) => !control.name).length,
          targetSizeViolations: targetSizeViolations.map(({ name, width, height }) => ({ name, width, height })),
          undersizedPrimaryActions: controls.filter((control) => control.primaryAction && (control.width < 44 || control.height < 44)).map(({ name, width, height }) => ({ name, width, height })),
          clippedControls: controls.filter((control) => control.clipped).length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0 || !image.width || !image.height).length,
        };
      });
      const evidenceName = routeEvidenceName(route);
      await captureScreenshot(page, join(routeEvidenceDir, `${evidenceName}-${viewport.width}x${viewport.height}.png`), { fullPage: true });
      if (route === "/") {
        await captureScreenshot(page, join(rectificationEvidenceDir, `root-${viewport.width}x${viewport.height}.png`), { fullPage: true });
        await captureScreenshot(page, join(rectificationEvidenceDir, `root-${viewport.width}x${viewport.height}-first-viewport.png`));
        if (evidence.captureProfile.fontFaces.length === 0 && evidence.captureProfile.fontFiles.length === 0) {
          const fonts = await page.evaluate(() => ({
            faces: document.fonts ? [...document.fonts].map((font) => ({ family: font.family, style: font.style, weight: font.weight, status: font.status })) : [],
            files: performance.getEntriesByType("resource").map((entry) => new URL(entry.name).pathname).filter((path) => /\.(?:woff2?|ttf|otf)$/i.test(path)).sort(),
          }));
          evidence.captureProfile.fontFaces = fonts.faces;
          evidence.captureProfile.fontFiles = fonts.files;
        }
      }
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, visible: document.activeElement !== document.body && getComputedStyle(document.activeElement).outlineStyle !== "none" }));
      if (route === "/" && viewport.width === 1440) await captureScreenshot(page, join(specialEvidenceDir, "keyboard-first-focus-1440x1000.png"), { fullPage: true });
      const record = { route, viewport, status: response?.status() ?? 0, ...mechanics, focus, consoleErrors, requestOrigins: [...requestOrigins] };
      evidence.routes.push(record);
      if (!response?.ok()) failures.push(`${route} at ${viewport.width}x${viewport.height} returned ${record.status}`);
      if (mechanics.mainCount !== 1 || mechanics.h1Count !== 1) failures.push(`${route} at ${viewport.width}px must have one main and one h1`);
      if (mechanics.duplicateIds.length || mechanics.headingSkip || mechanics.unnamedControls || mechanics.clippedControls || mechanics.overflow > 1 || mechanics.brokenImages) failures.push(`${route} at ${viewport.width}px failed mechanical structure: ${JSON.stringify(mechanics)}`);
      if (viewport.width === 390 && (mechanics.targetSizeViolations.length || mechanics.undersizedPrimaryActions.length)) failures.push(`${route} has impractical touch targets at 390px: ${JSON.stringify({ targetSizeViolations: mechanics.targetSizeViolations, undersizedPrimaryActions: mechanics.undersizedPrimaryActions })}`);
      if (!focus.visible) failures.push(`${route} at ${viewport.width}px does not expose visible first-Tab focus`);
      if (consoleErrors.length) failures.push(`${route} at ${viewport.width}px logged console errors: ${consoleErrors.join("; ")}`);
      if ([...requestOrigins].some((requestOrigin) => requestOrigin !== origin)) failures.push(`${route} requested an unexpected origin: ${[...requestOrigins].join(", ")}`);
      await page.close();
    }
    await context.close();
  }

  const axeContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  for (const route of axeRoutes) {
    const page = await axeContext.newPage();
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const violations = result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.description, nodes: violation.nodes.map((node) => node.target) }));
    evidence.axe.push({ route, violations });
    const gateFailures = axeGateFailures(route, violations);
    failures.push(...gateFailures);
    await page.close();
  }
  const negativeControlPage = await axeContext.newPage();
  await negativeControlPage.setContent('<!doctype html><html lang="en"><head><title>Axe negative control</title></head><body><main><h1>Axe negative control</h1><button></button></main></body></html>');
  const negativeControlResult = await new AxeBuilder({ page: negativeControlPage }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  evidence.axeNegativeControl = {
    expectedViolation: "button-name",
    detected: negativeControlResult.violations.some((violation) => violation.id === "button-name"),
    detectedViolations: negativeControlResult.violations.map((violation) => violation.id),
    wouldFailProductionGate: axeGateFailures("negative-control", negativeControlResult.violations).some((failure) => failure.includes("button-name")),
  };
  if (!evidence.axeNegativeControl.detected || !evidence.axeNegativeControl.wouldFailProductionGate) failures.push("axe negative control did not prove that the known button-name violation fails the production gate");
  await negativeControlPage.close();
  await axeContext.close();

  const searchContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const searchPage = await searchContext.newPage();
  await searchPage.goto(`${origin}/`, { waitUntil: "networkidle" });
  const search = searchPage.locator("[data-docs-search]").first();
  const input = search.locator("[data-docs-search-input]");
  await input.fill("searchfield");
  await searchPage.waitForTimeout(220);
  const filteredCount = await search.locator("[data-docs-search-count]").textContent();
  const focusRetained = await input.evaluate((element) => element === document.activeElement);
  await captureScreenshot(searchPage, join(specialEvidenceDir, "search-one-result-1440x1000.png"), { fullPage: true });
  await input.press("Escape");
  await searchPage.waitForTimeout(220);
  const escapeCount = await search.locator("[data-docs-search-count]").textContent();
  const escapeFocusRetained = await input.evaluate((element) => element === document.activeElement);
  await input.fill("no-such-contract");
  await searchPage.waitForTimeout(220);
  const noResultsCount = await search.locator("[data-docs-search-count]").textContent();
  const noResultsVisible = await search.locator("[data-docs-search-empty]").isVisible();
  const expandHiddenDuringSearch = await search.locator("[data-docs-search-expand]").isHidden();
  await captureScreenshot(searchPage, join(specialEvidenceDir, "search-no-results-1440x1000.png"), { fullPage: true });
  await search.locator("[data-docs-search-reset]").click();
  await searchPage.waitForTimeout(220);
  const resetCount = await search.locator("[data-docs-search-count]").textContent();
  const resetFocusRetained = await input.evaluate((element) => element === document.activeElement);
  const aliasCounts = {};
  for (const query of ["work queue", "audit trail", "evidence panel"]) {
    await input.fill(query);
    await searchPage.waitForTimeout(220);
    aliasCounts[query] = Number(await search.locator("[data-docs-search-count]").textContent());
  }
  await input.fill("");
  await searchPage.waitForTimeout(220);
  await searchPage.keyboard.press("/");
  const shortcutFocusRetained = await input.evaluate((element) => element === document.activeElement);
  const clearName = await search.locator("[data-docs-search-clear]").getAttribute("aria-label");
  const visibleLabel = await input.evaluate((element) => Boolean(element.labels?.[0]?.textContent?.trim()));
  const imeBefore = await search.locator("[data-docs-search-count]").textContent();
  await input.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "監査" }));
    element.value = "audit trail";
    element.dispatchEvent(new InputEvent("input", { bubbles: true, data: "監査", isComposing: true }));
  });
  await searchPage.waitForTimeout(220);
  const imeDuring = await search.locator("[data-docs-search-count]").textContent();
  await input.evaluate((element) => element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "監査" })));
  await searchPage.waitForTimeout(220);
  const imeAfter = await search.locator("[data-docs-search-count]").textContent();
  await input.fill("");
  await searchPage.waitForTimeout(220);
  const announcementChanges = await search.locator("[data-docs-search-count]").evaluate(async (count) => {
    let changes = 0;
    const observer = new MutationObserver(() => { changes += 1; });
    observer.observe(count, { childList: true, characterData: true, subtree: true });
    const field = count.closest("[data-docs-search]").querySelector("[data-docs-search-input]");
    for (const value of ["w", "wo", "work", "work queue"]) { field.value = value; field.dispatchEvent(new InputEvent("input", { bubbles: true, data: value })); }
    await new Promise((resolve) => setTimeout(resolve, 240));
    observer.disconnect();
    return changes;
  });

  const crossRouteShortcutPage = await searchContext.newPage();
  await crossRouteShortcutPage.goto(`${origin}/modes/axal/`, { waitUntil: "networkidle" });
  await Promise.all([
    crossRouteShortcutPage.waitForURL(`${origin}/#landing-docs`),
    crossRouteShortcutPage.keyboard.press("/"),
  ]);
  await crossRouteShortcutPage.waitForLoadState("networkidle");
  const crossRouteShortcut = await crossRouteShortcutPage.evaluate(() => ({
    hash: window.location.hash,
    focused: document.activeElement === document.querySelector("[data-docs-search-input]"),
  }));
  await crossRouteShortcutPage.close();

  const multiInstancePage = await searchContext.newPage();
  await multiInstancePage.goto(`${origin}/`, { waitUntil: "networkidle" });
  const multiInstance = await multiInstancePage.evaluate(async () => {
    const first = document.querySelector("[data-docs-search]");
    const second = first.cloneNode(true);
    second.removeAttribute("data-docs-search-ready");
    const idMap = new Map();
    for (const element of [second, ...second.querySelectorAll("[id]")]) if (element.id) { const next = `${element.id}-second`; idMap.set(element.id, next); element.id = next; }
    for (const element of second.querySelectorAll("[for], [aria-labelledby], [aria-describedby]")) {
      for (const attribute of ["for", "aria-labelledby", "aria-describedby"]) if (element.hasAttribute(attribute)) element.setAttribute(attribute, element.getAttribute(attribute).split(/\s+/).map((value) => idMap.get(value) ?? value).join(" "));
    }
    first.after(second);
    const source = document.querySelector('script[data-sanchika-gallery-script="docs-search"]').textContent;
    Function(source)();
    Function(source)();
    const roots = [...document.querySelectorAll("[data-docs-search]")];
    const wait = () => new Promise((resolve) => setTimeout(resolve, 240));
    const input = (root) => root.querySelector("[data-docs-search-input]");
    const count = (root) => root.querySelector("[data-docs-search-count]").textContent;
    const setQuery = async (root, value) => {
      const field = input(root);
      field.value = value;
      field.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
      await wait();
    };
    const instances = [];
    for (const root of roots) {
      await setQuery(root, "no-such-contract");
      const noResults = { count: count(root), visible: !root.querySelector("[data-docs-search-empty]").hidden };
      root.querySelector("[data-docs-search-reset]").click();
      await wait();
      const reset = { count: count(root), focused: input(root) === document.activeElement };
      await setQuery(root, "work queue");
      input(root).dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      await wait();
      const escape = { count: count(root), focused: input(root) === document.activeElement };
      const expand = root.querySelector("[data-docs-search-expand]");
      expand.click();
      const expanded = expand.getAttribute("aria-expanded");
      expand.click();
      const collapsed = expand.getAttribute("aria-expanded");
      let announcementChanges = 0;
      const status = root.querySelector("[data-docs-search-count]");
      const observer = new MutationObserver(() => { announcementChanges += 1; });
      observer.observe(status, { childList: true, characterData: true, subtree: true });
      for (const value of ["w", "wo", "work", "work queue"]) {
        input(root).value = value;
        input(root).dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
      }
      await wait();
      observer.disconnect();
      instances.push({ noResults, reset, escape, expanded, collapsed, announcementChanges });
      input(root).dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      await wait();
    }
    await setQuery(roots[0], "work queue");
    const firstIsolation = { first: count(roots[0]), second: count(roots[1]) };
    input(roots[0]).dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await wait();
    await setQuery(roots[1], "audit trail");
    const secondIsolation = { first: count(roots[0]), second: count(roots[1]) };
    return {
      roots: roots.length,
      ready: roots.every((root) => root.dataset.docsSearchReady === "true"),
      firstIsolation,
      secondIsolation,
      instances,
      duplicateIds: [...document.querySelectorAll("[id]")].map((element) => element.id).filter((id, index, ids) => ids.indexOf(id) !== index),
    };
  });
  await multiInstancePage.close();
  evidence.search = { filteredCount, focusRetained, escapeCount, escapeFocusRetained, noResultsCount, noResultsVisible, expandHiddenDuringSearch, resetCount, resetFocusRetained, aliasCounts, shortcutFocusRetained, crossRouteShortcut, clearName, visibleLabel, imeBefore, imeDuring, imeAfter, announcementChanges, multiInstance };
  const multiInstanceFailed = multiInstance.roots !== 2 || !multiInstance.ready || multiInstance.duplicateIds.length || Number(multiInstance.firstIsolation.first) < 1 || multiInstance.firstIsolation.second !== "61" || multiInstance.secondIsolation.first !== "61" || Number(multiInstance.secondIsolation.second) < 1 || multiInstance.instances.some((instance) => instance.noResults.count !== "0" || !instance.noResults.visible || instance.reset.count !== "61" || !instance.reset.focused || instance.escape.count !== "61" || !instance.escape.focused || instance.expanded !== "true" || instance.collapsed !== "false" || instance.announcementChanges > 1);
  if (filteredCount !== "1" || !focusRetained || escapeCount !== "61" || !escapeFocusRetained || noResultsCount !== "0" || !noResultsVisible || !expandHiddenDuringSearch || resetCount !== "61" || !resetFocusRetained || Object.values(aliasCounts).some((count) => count < 1) || !shortcutFocusRetained || crossRouteShortcut.hash !== "#landing-docs" || !crossRouteShortcut.focused || clearName !== "Clear documentation search" || !visibleLabel || imeDuring !== imeBefore || Number(imeAfter) < 1 || announcementChanges > 1 || multiInstanceFailed) failures.push(`local search behavior failed: ${JSON.stringify(evidence.search)}`);
  await searchContext.close();

  const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(`${origin}/primitives/`, { waitUntil: "networkidle" });
  evidence.jsDisabled = await noJsPage.evaluate(() => ({ primaryLinks: document.querySelectorAll("header nav a").length, contractLinks: document.querySelectorAll(".contract-index a").length, searchHidden: document.querySelector("[data-docs-search-form]")?.hidden }));
  if (evidence.jsDisabled.primaryLinks < 5 || evidence.jsDisabled.contractLinks < 28 || !evidence.jsDisabled.searchHidden) failures.push(`JavaScript-disabled navigation proof failed: ${JSON.stringify(evidence.jsDisabled)}`);
  await captureScreenshot(noJsPage, join(specialEvidenceDir, "javascript-disabled-primitives-390x844.png"), { fullPage: true });
  await noJsContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${origin}/foundations/motion/`, { waitUntil: "networkidle" });
  evidence.reducedMotion = await reducedPage.evaluate(() => {
    const focusButton = document.querySelector(".sk-motion-focus-feedback");
    focusButton?.focus();
    const utilities = [...document.querySelectorAll("[data-motion-class]")].map((record) => {
      const className = record.dataset.motionClass;
      const elements = [...document.querySelectorAll(`.${CSS.escape(className)}`)];
      return {
        className,
        count: elements.length,
        states: elements.map((element) => {
          const style = getComputedStyle(element);
          return { animationName: style.animationName, opacity: style.opacity, transform: style.transform, transitionProperty: style.transitionProperty };
        }),
      };
    });
    const focusStyle = focusButton ? getComputedStyle(focusButton) : null;
    return {
      mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      utilityCount: utilities.length,
      utilities,
      activeAnimations: document.getAnimations().length,
      visibleText: document.querySelector("main")?.innerText.includes("Motion confirms state"),
      focusOutline: focusStyle ? { style: focusStyle.outlineStyle, width: focusStyle.outlineWidth } : null,
    };
  });
  const reducedMotionFailed = !evidence.reducedMotion.mediaMatches || evidence.reducedMotion.utilityCount !== 8 || !evidence.reducedMotion.visibleText || evidence.reducedMotion.activeAnimations !== 0 || evidence.reducedMotion.utilities.some((utility) => utility.count < 1 || utility.states.some((state) => state.animationName !== "none" || state.transform !== "none" || (!new Set(["sk-motion-focus-feedback", "sk-motion-press-feedback"]).has(utility.className) && state.opacity !== "1"))) || evidence.reducedMotion.focusOutline?.style === "none";
  if (reducedMotionFailed) failures.push(`Reduced-motion route lost package utility meaning: ${JSON.stringify(evidence.reducedMotion)}`);
  await captureScreenshot(reducedPage, join(specialEvidenceDir, "reduced-motion-390x844.png"), { fullPage: true });
  await reducedContext.close();

  const forcedContext = await browser.newContext({ viewport: { width: 768, height: 1024 }, forcedColors: "active" });
  const forcedPage = await forcedContext.newPage();
  await forcedPage.goto(`${origin}/modes/pack/`, { waitUntil: "networkidle" });
  await forcedPage.keyboard.press("Tab");
  evidence.forcedColors = await forcedPage.evaluate(() => {
    const active = document.activeElement;
    const style = active instanceof HTMLElement ? getComputedStyle(active) : null;
    return {
      mediaMatches: matchMedia("(forced-colors: active)").matches,
      activeTag: active?.tagName,
      focusVisible: active !== document.body && style?.outlineStyle !== "none" && Number.parseFloat(style?.outlineWidth ?? "0") > 0,
      focusOutline: style ? { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor } : null,
      structuralBoundaries: [...document.querySelectorAll("main section, main aside")].filter((element) => getComputedStyle(element).borderStyle !== "none").length,
    };
  });
  if (!evidence.forcedColors.mediaMatches || !evidence.forcedColors.focusVisible || evidence.forcedColors.structuralBoundaries < 3) failures.push(`Forced-colors proof failed: ${JSON.stringify(evidence.forcedColors)}`);
  await captureScreenshot(forcedPage, join(specialEvidenceDir, "forced-colors-focus-768x1024.png"), { fullPage: true });
  await forcedContext.close();

  const zoomContext = await browser.newContext({ viewport: { width: 720, height: 500 }, deviceScaleFactor: 1, colorScheme: "light" });
  const zoomPage = await zoomContext.newPage();
  await zoomPage.goto(`${origin}/`, { waitUntil: "networkidle" });
  await zoomPage.keyboard.press("Tab");
  evidence.zoomEquivalent = await zoomPage.evaluate(() => ({
    profile: "1440px desktop viewport at 200% layout zoom equivalent",
    cssViewportWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    adoptionReachable: Boolean(document.querySelector('a[href="/adoption/"]')),
    sourceReachable: Boolean(document.querySelector('a[href^="https://github.com/lamemustafa/sanchika"]')),
    focusVisible: document.activeElement !== document.body && getComputedStyle(document.activeElement).outlineStyle !== "none",
  }));
  if (evidence.zoomEquivalent.cssViewportWidth !== 720 || evidence.zoomEquivalent.overflow > 1 || !evidence.zoomEquivalent.adoptionReachable || !evidence.zoomEquivalent.sourceReachable || !evidence.zoomEquivalent.focusVisible) failures.push(`200% zoom-equivalent reflow failed: ${JSON.stringify(evidence.zoomEquivalent)}`);
  await captureScreenshot(zoomPage, join(specialEvidenceDir, "zoom-200-equivalent-root-720x500.png"), { fullPage: true });
  await zoomContext.close();

  const reflowContext = await browser.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 1, colorScheme: "light" });
  for (const route of routes) {
    const reflowPage = await reflowContext.newPage();
    const response = await reflowPage.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    const record = await reflowPage.evaluate(() => {
      const controls = [...document.querySelectorAll("a[href],button,input,select,textarea,summary")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      const clippedControls = controls.filter((element) => {
        const rect = element.getBoundingClientRect();
        const scrollOwner = element.closest("nav, [role=region]");
        const intentionallyScrollable = scrollOwner && ["auto", "scroll"].includes(getComputedStyle(scrollOwner).overflowX);
        return !intentionallyScrollable && (rect.right > document.documentElement.clientWidth + 1 || rect.left < -1);
      }).map((element) => element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName);
      const adoption = [...document.querySelectorAll('a[href="/adoption/"]')].find((element) => element.getBoundingClientRect().height > 0);
      const source = [...document.querySelectorAll('a[href^="https://github.com/lamemustafa/sanchika"]')].find((element) => element.getBoundingClientRect().height > 0);
      const focusTarget = (element) => {
        if (!(element instanceof HTMLElement)) return false;
        element.focus();
        element.scrollIntoView({ block: "nearest", inline: "nearest" });
        const rect = element.getBoundingClientRect();
        return document.activeElement === element && rect.left >= -1 && rect.right <= document.documentElement.clientWidth + 1 && getComputedStyle(element).outlineStyle !== "none";
      };
      return {
        cssViewportWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        clippedControls,
        adoptionReachable: focusTarget(adoption),
        sourceReachable: focusTarget(source),
      };
    });
    evidence.reflow400.push({ route, status: response?.status() ?? 0, ...record });
    if (!response?.ok() || record.cssViewportWidth !== 320 || record.overflow > 1 || record.clippedControls.length || !record.adoptionReachable || !record.sourceReachable) failures.push(`400% zoom-equivalent reflow failed for ${route}: ${JSON.stringify(record)}`);
    if (route === "/") await captureScreenshot(reflowPage, join(specialEvidenceDir, "zoom-400-equivalent-root-320x640.png"), { fullPage: true });
    await reflowPage.close();
  }
  await reflowContext.close();

  const performanceContext = await browser.newContext({
    viewport: mobileLabProfile.viewport,
    deviceScaleFactor: mobileLabProfile.deviceScaleFactor,
    isMobile: mobileLabProfile.isMobile,
    hasTouch: mobileLabProfile.hasTouch,
    userAgent: mobileLabProfile.userAgent,
  });
  await performanceContext.addInitScript(() => {
    window.__sanchikaMetrics = { lcp: 0, lcpElement: "", cls: 0 };
    new PerformanceObserver((list) => { const entry = list.getEntries().at(-1); if (entry) { const element = entry.element; window.__sanchikaMetrics.lcp = entry.startTime; window.__sanchikaMetrics.lcpElement = element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.classList.length ? `.${[...element.classList].join(".")}` : ""} ${(element.textContent ?? "").trim().slice(0, 80)}` : "text"; } }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__sanchikaMetrics.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
  });
  const performancePage = await performanceContext.newPage();
  const performanceSession = await performanceContext.newCDPSession(performancePage);
  await performanceSession.send("Network.enable");
  await performanceSession.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: mobileLabProfile.network.latencyMs,
    downloadThroughput: mobileLabProfile.network.downloadBitsPerSecond / 8,
    uploadThroughput: mobileLabProfile.network.uploadBitsPerSecond / 8,
    connectionType: mobileLabProfile.network.connectionType,
  });
  await performanceSession.send("Emulation.setCPUThrottlingRate", { rate: mobileLabProfile.cpuSlowdownMultiplier });
  const requestUrls = [];
  performancePage.on("request", (request) => requestUrls.push(request.url()));
  await performancePage.goto(`${origin}/`, { waitUntil: "networkidle" });
  await performancePage.waitForTimeout(600);
  const measuredAssets = await performancePage.evaluate(() => ({
    images: [...document.images].map((image) => ({
      src: image.currentSrc || image.src,
      explicitWidth: image.hasAttribute("width"),
      explicitHeight: image.hasAttribute("height"),
      renderedWidth: image.width,
      renderedHeight: image.height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    })),
    fontFaces: document.fonts ? [...document.fonts].map((font) => ({ family: font.family, style: font.style, weight: font.weight, status: font.status })) : [],
    userAgent: navigator.userAgent,
  }));
  evidence.performance = await performancePage.evaluate(() => window.__sanchikaMetrics);
  evidence.performance.profile = { ...mobileLabProfile, observedUserAgent: measuredAssets.userAgent };
  evidence.performance.requestOrigins = [...new Set(requestUrls.map((url) => new URL(url).origin))];
  if (!evidence.performance.lcp || evidence.performance.lcp > 2500) failures.push(`Mobile LCP exceeds 2.5s or was not captured: ${evidence.performance.lcp}`);
  if (evidence.performance.cls > 0.1) failures.push(`CLS exceeds 0.1: ${evidence.performance.cls}`);
  await performanceContext.close();

  const indexHtml = readFileSync(join(dist, "index.html"), "utf8");
  const stylesheetPaths = [...indexHtml.matchAll(/<link rel="stylesheet" href="\/([^"]+)"/g)].map((match) => match[1]);
  const scripts = [...indexHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter((match) => !/type="application\/(?:json|ld\+json)"/.test(match[1])).map((match) => ({ marker: match[1].match(/data-sanchika-(?:gallery|pattern)-script="([^"]+)"/)?.[1] ?? "unknown", raw: Buffer.byteLength(match[2]), gzip: gzipSync(match[2]).byteLength }));
  const css = stylesheetPaths.map((path) => ({ path, raw: statSync(join(dist, path)).size, gzip: gzipSync(readFileSync(join(dist, path))).byteLength }));
  evidence.assets = {
    scripts,
    css,
    images: measuredAssets.images,
    fonts: loadedAssetRecords(requestUrls, new Set([".woff", ".woff2", ".ttf", ".otf"])),
    fontFaces: measuredAssets.fontFaces,
    requestOrigins: evidence.performance.requestOrigins,
  };
  const imagesWithoutDimensions = measuredAssets.images.filter((image) => !image.explicitWidth || !image.explicitHeight);
  if (imagesWithoutDimensions.length) failures.push(`landing images must declare width and height: ${JSON.stringify(imagesWithoutDimensions)}`);
  const searchAsset = scripts.find((script) => script.marker === "docs-search");
  if (!searchAsset || searchAsset.gzip > 6144) failures.push(`Search enhancement exceeds 6 KB gzip or is missing: ${JSON.stringify(searchAsset)}`);
  if (scripts.reduce((sum, script) => sum + script.gzip, 0) > 15 * 1024) failures.push("Landing client JavaScript exceeds 15 KB gzip");
  if (css.reduce((sum, asset) => sum + asset.gzip, 0) > 70 * 1024) failures.push("Landing CSS exceeds 70 KB gzip");
} finally {
  await browser.close();
  server.close();
  mkdirSync(evidenceDir, { recursive: true });
  evidence.evidenceFiles = [...new Set(evidence.evidenceFiles)].sort().map((path) => {
    const absolutePath = join(evidenceRoot, path);
    return { path, bytes: statSync(absolutePath).size, sha256: sha256(readFileSync(absolutePath)) };
  });
  writeFileSync(join(evidenceDir, "summary.json"), `${JSON.stringify({ ...evidence, failures }, null, 2)}\n`);
}

if (failures.length) {
  console.error("Sanchika gallery browser check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Sanchika gallery browser check passed (${evidence.routes.length} viewport-route cells; ${evidence.axe.length} axe routes).`);
console.log(`Performance: LCP ${evidence.performance.lcp.toFixed(1)} ms (${evidence.performance.lcpElement}); CLS ${evidence.performance.cls.toFixed(4)}.`);
console.log(`Assets: ${evidence.assets.scripts.map((asset) => `${asset.marker} ${asset.gzip} gzip`).join(", ")}; CSS ${evidence.assets.css.map((asset) => `${asset.path} ${asset.gzip} gzip`).join(", ")}.`);

async function captureScreenshot(page, path, options = {}) {
  await page.screenshot({ path, ...options });
  evidence.evidenceFiles.push(relative(evidenceRoot, path).replaceAll("\\", "/"));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function loadedAssetRecords(requestUrls, extensions) {
  const records = [];
  const seen = new Set();
  for (const requestUrl of requestUrls) {
    const url = new URL(requestUrl);
    const path = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!path || seen.has(path) || !extensions.has(extname(path).toLowerCase())) continue;
    const file = join(dist, normalize(path));
    if (!file.startsWith(dist) || !existsSync(file) || !statSync(file).isFile()) continue;
    seen.add(path);
    records.push({ path, raw: statSync(file).size });
  }
  return records.sort((left, right) => left.path.localeCompare(right.path));
}

function routeEvidenceName(route) {
  const names = {
    "/": "root",
    "/foundations/": "foundations",
    "/foundations/tokens/": "tokens",
    "/foundations/motion/": "motion",
    "/primitives/": "primitives",
    "/primitives/searchfield/": "searchfield",
    "/patterns/": "patterns",
    "/patterns/reviewdeskpreview/": "reviewdeskpreview",
    "/modes/": "modes",
    "/modes/complyeaze/": "mode-complyeaze",
    "/modes/axal/": "mode-axal",
    "/modes/pack/": "mode-pack",
    "/modes/tools/": "mode-tools",
    "/adoption/": "adoption",
  };
  return names[route] ?? route.replace(/^\/+|\/+$/g, "").replaceAll("/", "-");
}

function axeGateFailures(route, violations) {
  return violations.map((violation) => `${route} axe violation ${violation.id}:${violation.impact ?? "unknown"}`);
}

async function launchEvidenceBrowser() {
  const attempts = [
    { launchMode: "pinned-cached-chromium", options: { headless: true } },
    { launchMode: "system-chrome", options: { headless: true, channel: "chrome" } },
  ];
  const errors = [];
  for (const attempt of attempts) {
    try { return { browser: await chromium.launch(attempt.options), launchMode: attempt.launchMode }; }
    catch (error) { errors.push(`${attempt.launchMode}: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`); }
  }
  throw new Error(`No browser is available for the required gallery evidence lane. ${errors.join("; ")}`);
}

async function startServer() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    let file = join(dist, normalize(relative));
    if (url.pathname.endsWith("/")) file = join(file, "index.html");
    if (!file.startsWith(dist) || !existsSync(file) || !statSync(file).isFile()) { response.writeHead(404); response.end("Not found"); return; }
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8" };
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
    response.end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server;
}

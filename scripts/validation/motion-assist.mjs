const expectedKeys = [
  "focus-feedback",
  "press-feedback",
  "fade-entrance",
  "rise-entrance",
  "disclosure-continuity",
  "status-highlight",
  "copy-confirmation",
  "skeleton-loading",
];

export function renderMotionDocs({ utilities, guidance }) {
  const utilityRows = utilities.map((item) =>
    `| \`${item.key}\` | \`.${item.className}\` | ${item.purpose} | ${item.trigger} | ${item.duration} / ${item.easing} | ${item.maxTravel} | ${item.iteration} | ${item.reducedMotionResult} |`,
  ).join("\n");
  const guidanceRows = guidance.map((item) =>
    `| ${item.situation} | ${item.semanticFirst} | ${item.optionalAssist === "none" ? "None" : `\`${item.optionalAssist}\``} | ${item.consumerResponsibility} |`,
  ).join("\n");
  const details = utilities.map((item) => `### ${item.key}

- Use: ${item.use.join(" ")}
- Avoid: ${item.avoid.join(" ")}
- Accessibility warning: ${item.accessibilityWarning}
- Consumer responsibility: ${item.consumerResponsibility}`).join("\n\n");

  return `# Motion and assist behavior

Sanchika motion is CSS-first, semantic, opt-in, token-driven, and safe under reduced-motion preferences. It may clarify focus, activation, entrance, native disclosure continuity, settled status, copy confirmation, and truthful loading. It must never become a product workflow, an evidence claim, or decoration that consumers have to undo.

## Principles

- Semantics and visible state come first. Motion is a secondary assist.
- Consumers opt in with one stable utility class; Sanchika does not reveal whole pages automatically.
- Package CSS consumes existing motion tokens and never introduces page-local timing variables.
- Reduced motion preserves focus, content, status wording, boundaries, and settled composition.
- Skeleton loading is the only repeating package animation. All other utilities run once.

## Utility inventory

| Key | Class | Purpose | Trigger | Duration / easing | Maximum travel | Iteration | Reduced-motion result |
| --- | --- | --- | --- | --- | --- | --- | --- |
${utilityRows}

${details}

## Assist guidance

| Situation | Semantic first | Optional assist | Consumer responsibility |
| --- | --- | --- | --- |
${guidanceRows}

## Result counts

Render the settled visible count first. Use a polite atomic status only for a genuine dynamic update, and avoid announcing every keystroke. A one-pass status highlight may reinforce the settled result but cannot imply server or official verification.

## Inline validation

Associate visible error or success wording with the control and keep focus stable. Motion cannot replace \`aria-invalid\`, descriptions, or non-color severity cues.

## Error recovery

State what failed, provide a safe next action, and sanitize technical detail. Error recovery remains immediate; urgent shaking, pulsing, or repeated emphasis is outside this package.

## Disclosure continuity

Use native \`details\` and \`summary\`. Apply the optional class to the revealed content only. Never animate \`height\` or \`max-height\`, clip focusable content, or add an accordion runtime.

## Copy confirmation

Reuse the S5 explicit-activation script and its visible, polite, bounded confirmation state. The utility adds no clipboard behavior and no timer.

## Safe pending work

Use Skeleton only inside a truthfully busy owner with readable loading context. Hide decorative shapes from assistive technology, keep geometry stable, and replace them with real content when work settles.

## Human approval

Human decisions require visible pending, approved, or rejected wording and accountable evidence. Motion may reinforce a settled visible state but must never imply that approval occurred.

## Reduced motion and forced colors

The package owns one scoped \`prefers-reduced-motion\` block for its motion behavior. It removes transitions and animations while restoring settled opacity and position. It never removes outlines, hides status text, or targets the global document. Forced-colors behavior preserves system-color boundaries and focus indicators.

## Consumer boundary

The package exports metadata, a finite class-name helper, and CSS. Consumers retain state, timing, announcements, native interaction, async work, authorization, evidence, and product workflow ownership. No JavaScript animation runtime is exported.
`;
}

export function validateMotionAssist({ utilities, guidance, css, styles, docs, gallery, classNameFor, fail }) {
  if (utilities.map(({ key }) => key).join(",") !== expectedKeys.join(",")) fail("motion metadata must expose exactly the eight approved S6 utilities in stable order");
  if (new Set(utilities.map(({ key }) => key)).size !== utilities.length) fail("motion metadata keys must be unique");
  if (new Set(utilities.map(({ className }) => className)).size !== utilities.length) fail("motion utility class names must be unique");
  if (!Object.isFrozen(utilities)) fail("motion utility metadata array must be immutable");
  for (const item of utilities) {
    if (!Object.isFrozen(item)) fail(`motion metadata ${item.key ?? "unknown"} must be immutable`);
    for (const field of ["tokenRoles", "properties", "use", "avoid"]) {
      if (!Object.isFrozen(item[field])) fail(`motion metadata ${item.key ?? "unknown"}.${field} must be immutable`);
    }
    for (const field of ["key", "className", "purpose", "trigger", "duration", "easing", "maxTravel", "iteration", "reducedMotionResult", "accessibilityWarning", "consumerResponsibility"]) {
      if (!item[field]) fail(`motion metadata ${item.key ?? "unknown"} must define ${field}`);
    }
    if (!css.includes(`.${item.className}`)) fail(`motion CSS must implement .${item.className}`);
    if (classNameFor(item.key) !== item.className) fail(`motion helper must resolve ${item.key}`);
  }
  if (!Object.isFrozen(guidance)) fail("assist guidance metadata array must be immutable");
  for (const item of guidance) {
    if (!Object.isFrozen(item)) fail(`assist guidance ${item.key ?? "unknown"} must be immutable`);
  }
  if (!gallery.includes("data-motion-key={utility.key}") || !gallery.includes("data-motion-class={utility.className}")) fail("motion gallery inventory must bind keys and classes from package metadata");
  for (const unsafe of ["toString", "constructor", "__proto__", "prototype", "hasOwnProperty", "unknown-motion-key"]) {
    try {
      classNameFor(unsafe);
      fail(`motion helper must reject unsafe or unknown key ${unsafe}`);
    } catch (error) {
      if (!(error instanceof TypeError)) fail(`motion helper must reject ${unsafe} with TypeError`);
    }
  }
  if (docs !== renderMotionDocs({ utilities, guidance })) fail("docs/motion.md must be freshly derived from package-owned motion metadata");
  assertMotionCss(css, styles, fail);
}

export function assertMotionCss(css, styles, fail) {
  const cleanCss = stripComments(css);
  const declarations = parseDeclarations(cleanCss);
  const rawTime = /(^|[^\w.-])(?:\d+(?:\.\d+)?|\.\d+)(?:ms|s)\b/i;
  const rawEasing = /\b(?:ease(?:-in|-out|-in-out)?|linear|step-start|step-end)\b|(?:cubic-bezier|steps|linear)\s*\(/i;
  const rawTravel = /(^|[^\w.-])(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vh|vw|vmin|vmax|ch)\b/i;
  const durationToken = /var\(--sk-motion-duration-[a-z0-9-]+\)/i;
  const easingToken = /var\(--sk-motion-easing-[a-z0-9-]+\)/i;
  const distanceToken = /var\(--sk-motion-distance-[a-z0-9-]+\)/i;
  const allowedTransitionProperties = new Set(["background-color", "border-color", "box-shadow", "color", "opacity", "transform"]);
  const allowedKeyframeProperties = new Set(["background-color", "border-color", "opacity", "transform"]);

  for (const { property, value } of declarations) {
    if (property.startsWith("--")) fail("motion CSS must not declare local custom properties");
    if (rawTime.test(value)) fail("motion CSS must not contain a raw duration or delay");
    if (rawEasing.test(value)) fail("motion CSS must not contain a raw easing");

    if (property === "animation" || property === "transition") {
      for (const item of splitTopLevel(value)) {
        if (item === "none") continue;
        if (!durationToken.test(item)) fail(`${property} shorthand must use a generated motion duration token`);
        if (!easingToken.test(item)) fail(`${property} shorthand must use a generated motion easing token`);
        if (property === "transition") assertTransitionProperty(item, allowedTransitionProperties, fail);
      }
    }
    if (property === "animation-duration" || property === "transition-duration") {
      for (const item of splitTopLevel(value)) {
        if (!durationToken.test(item)) fail(`${property} must use generated motion duration tokens`);
      }
    }
    if (property === "animation-timing-function" || property === "transition-timing-function") {
      for (const item of splitTopLevel(value)) {
        if (!easingToken.test(item)) fail(`${property} must use generated motion easing tokens`);
      }
    }
    if (property === "animation-delay" || property === "transition-delay") {
      fail("motion CSS must not delay content or interaction feedback");
    }
    if (property === "transition-property") {
      for (const item of splitTopLevel(value)) {
        if (!allowedTransitionProperties.has(item)) fail(`motion CSS must not transition ${item}`);
      }
    }
    if (property === "transform" && /translate/i.test(value)) {
      if (!distanceToken.test(value) || rawTravel.test(value)) fail("transform travel must use only generated motion distance tokens");
    }
    if (property === "translate" && value !== "none") {
      if (!distanceToken.test(value) || rawTravel.test(value)) fail("individual translate travel must use only generated motion distance tokens");
    }
  }

  for (const block of extractKeyframeBlocks(cleanCss)) {
    for (const { property } of parseDeclarations(block)) {
      if (!allowedKeyframeProperties.has(property)) fail(`motion keyframes must not animate ${property}`);
    }
  }

  if (!styles.includes('@import "./motion.css";')) fail("primitive styles must import motion.css");
  if ((cleanCss.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? []).length !== 1) fail("package primitive CSS must contain one shared reduced-motion block");
  if (!/:where\([^}]*\.sk-motion-skeleton-loading[^}]*\)[^{]*\{[^}]*animation:[^;}]*infinite/s.test(cleanCss)) fail("skeleton utility must be the repeating loading animation");
  if ((cleanCss.match(/var\(--sk-motion-duration-loading\)/g) ?? []).length !== 1) fail("the loading duration token must be used only by Skeleton");
  if (/\.sk-motion-(?:status-highlight|copy-confirmation)[^}]*\{[^}]*animation:[^;}]*infinite/s.test(cleanCss)) fail("status and copy utilities must never repeat");
  for (const requiredCopySelector of [
    ".sk-motion-copy-confirmation.sk-copy-button-copied",
    ".sk-copy-button-copied .sk-motion-copy-confirmation",
  ]) {
    if (!cleanCss.includes(requiredCopySelector)) fail(`copy confirmation must preserve the S5 class state selector ${requiredCopySelector}`);
  }
  for (const requiredTransitionFragment of [
    ".sk-button.sk-motion-focus-feedback, .sk-button.sk-motion-press-feedback",
    "background-color var(--sk-motion-duration-standard) var(--sk-motion-easing-standard), border-color var(--sk-motion-duration-standard) var(--sk-motion-easing-standard), box-shadow var(--sk-motion-duration-standard) var(--sk-motion-easing-standard), color var(--sk-motion-duration-standard) var(--sk-motion-easing-standard), transform var(--sk-motion-duration-instant) var(--sk-motion-easing-standard)",
    ".sk-link.sk-motion-focus-feedback, .sk-link.sk-motion-press-feedback",
    "color var(--sk-motion-duration-fast) var(--sk-motion-easing-standard), transform var(--sk-motion-duration-instant) var(--sk-motion-easing-standard)",
    ".sk-link-card.sk-motion-focus-feedback, .sk-link-card.sk-motion-press-feedback",
    "background-color var(--sk-motion-duration-fast) var(--sk-motion-easing-standard), border-color var(--sk-motion-duration-fast) var(--sk-motion-easing-standard), transform var(--sk-motion-duration-instant) var(--sk-motion-easing-standard)",
  ]) {
    if (!cleanCss.includes(requiredTransitionFragment)) fail("focus and press utilities must preserve existing primitive transitions");
  }
  if (/@media \(prefers-reduced-motion: reduce\)[\s\S]*?outline\s*:\s*(?:none|0)/.test(cleanCss)) fail("reduced motion must not remove focus outlines");
  if (/@media \(prefers-reduced-motion: reduce\)[\s\S]*?(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)/.test(cleanCss)) fail("reduced motion must not hide content or state wording");
  if (/(?:^|,)\s*(?:\*|html|body)(?:\s|,|\{)[\s\S]*?(?:animation|transition)/m.test(cleanCss)) fail("motion CSS must not add a global reveal or global motion selector");
  const infiniteRules = [...cleanCss.matchAll(/([^{}]+)\{[^{}]*animation:[^;}]*infinite[^;}]*;?[^{}]*\}/g)].map((match) => match[1]);
  if (infiniteRules.some((selector) => !selector.includes("sk-motion-skeleton-loading") && !selector.includes("sk-skeleton"))) fail("Skeleton must be the only repeating package animation");
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function parseDeclarations(css) {
  return [...css.matchAll(/(?:^|[;{])\s*((?:--)?[a-z][a-z0-9-]*)\s*:\s*([^;{}]+)/gim)]
    .map((match) => ({ property: match[1].toLowerCase(), value: match[2].trim() }));
}

function splitTopLevel(value) {
  const items = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    else if (value[index] === ")") depth -= 1;
    else if (value[index] === "," && depth === 0) {
      items.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  items.push(value.slice(start).trim());
  return items;
}

function assertTransitionProperty(value, allowedProperties, fail) {
  const property = value.match(/^([a-z-]+)/i)?.[1]?.toLowerCase();
  if (!property || !allowedProperties.has(property)) fail(`motion CSS must not transition ${property ?? "all properties"}`);
}

function extractKeyframeBlocks(css) {
  const blocks = [];
  const pattern = /@(?:-[a-z]+-)?keyframes\s+[a-z0-9_-]+\s*/gi;
  for (const match of css.matchAll(pattern)) {
    const openIndex = css.indexOf("{", match.index + match[0].length);
    if (openIndex === -1) continue;
    let depth = 1;
    for (let index = openIndex + 1; index < css.length; index += 1) {
      if (css[index] === "{") depth += 1;
      else if (css[index] === "}") depth -= 1;
      if (depth === 0) {
        blocks.push(css.slice(openIndex + 1, index));
        break;
      }
    }
  }
  return blocks;
}

export function runMotionAssistFixtures({ utilities, guidance, css, styles, docs, gallery, classNameFor, fail }) {
  let fixtureCount = 0;
  const expectFailure = (label, mutate) => {
    fixtureCount += 1;
    let failed = false;
    const fixtureFail = () => { failed = true; };
    const fixture = mutate({ utilities, guidance, css, styles, docs, gallery, classNameFor });
    validateMotionAssist({ ...fixture, fail: fixtureFail });
    if (!failed) fail(`motion fixture must fail: ${label}`);
  };
  expectFailure("missing CSS", (v) => ({ ...v, css: v.css.replaceAll(`.${v.utilities[0].className}`, ".missing-motion-class") }));
  expectFailure("duplicate class", (v) => ({ ...v, utilities: v.utilities.map((item, index) => index === 1 ? { ...item, className: v.utilities[0].className } : item) }));
  for (const [label, fragment] of [
    ["raw duration", "a{transition:opacity 240ms var(--sk-motion-easing-standard);}"],
    ["raw seconds", "a{animation:x .2s var(--sk-motion-easing-enter);}"],
    ["comment-spliced raw duration", "a{transition:opacity 2/* bypass */40ms var(--sk-motion-easing-standard);}"],
    ["raw ease-in", "a{transition:opacity var(--sk-motion-duration-fast) ease-in;}"],
    ["raw cubic", "a{transition:opacity var(--sk-motion-duration-fast) cubic-bezier(0,0,1,1);}"],
    ["raw travel", "a{transform:translateY(8px);}"],
    ["nested calc travel", "a{transform:translateY(calc(8px * 1));}"],
    ["custom duration property", "a{--motion-time:200ms;transition:opacity var(--motion-time) var(--sk-motion-easing-standard);}"],
    ["custom travel property", "a{--travel:8px;transform:translateY(var(--travel));}"],
    ["multi-animation shorthand", "a{animation:x var(--sk-motion-duration-fast) var(--sk-motion-easing-enter),y .2s linear;}"],
    ["transition all shorthand", "a{transition:all var(--sk-motion-duration-fast) var(--sk-motion-easing-standard);}"],
    ["transition property all", "a{transition-property:all;transition-duration:var(--sk-motion-duration-fast);transition-timing-function:var(--sk-motion-easing-standard);}"],
    ["individual translate", "a{translate:0 8px;}"],
    ["height keyframe", "@keyframes fixture{to{height:1px}}a{animation:fixture var(--sk-motion-duration-fast) var(--sk-motion-easing-standard);}"],
    ["max-height keyframe", "@keyframes fixture{to{max-height:1rem}}a{animation:fixture var(--sk-motion-duration-fast) var(--sk-motion-easing-standard);}"],
    ["grid-row keyframe", "@keyframes fixture{to{grid-template-rows:1fr}}a{animation:fixture var(--sk-motion-duration-fast) var(--sk-motion-easing-standard);}"],
    ["animation delay", "a{animation-delay:var(--sk-motion-duration-fast);}"],
    ["transition delay", "a{transition-delay:var(--sk-motion-duration-fast);}"],
    ["loading duration outside Skeleton", "a{animation:x var(--sk-motion-duration-loading) var(--sk-motion-easing-standard);}"],
    ["infinite status", ".sk-motion-status-highlight{animation:x var(--sk-motion-duration-fast) var(--sk-motion-easing-standard) infinite;}"],
    ["infinite copy", ".sk-motion-copy-confirmation{animation:x var(--sk-motion-duration-fast) var(--sk-motion-easing-standard) infinite;}"],
    ["global reveal", "body *{animation:x var(--sk-motion-duration-fast) var(--sk-motion-easing-standard);}"],
  ]) {
    expectFailure(label, (v) => ({ ...v, css: `${v.css}\n${fragment}` }));
  }
  expectFailure("finite skeleton", (v) => ({ ...v, css: v.css.replace(" infinite alternate", " 1 both") }));
  expectFailure("missing reduced block", (v) => ({ ...v, css: v.css.replace(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\n  \}/, "") }));
  expectFailure("reduced removes outline", (v) => ({ ...v, css: `${v.css}\n@media (prefers-reduced-motion: reduce){.fixture{outline:none;}}` }));
  expectFailure("reduced hides state", (v) => ({ ...v, css: `${v.css}\n@media (prefers-reduced-motion: reduce){.fixture{display:none;}}` }));
  expectFailure("prototype helper", (v) => ({ ...v, classNameFor: (key) => key === "constructor" ? "sk-motion-fake" : v.classNameFor(key) }));
  expectFailure("mutable guidance array", (v) => ({ ...v, guidance: [...v.guidance] }));
  expectFailure("mutable guidance entry", (v) => ({ ...v, guidance: Object.freeze(v.guidance.map((item, index) => index === 0 ? { ...item } : item)) }));
  expectFailure("missing class-based copy confirmation", (v) => ({ ...v, css: v.css.replaceAll(".sk-motion-copy-confirmation.sk-copy-button-copied", ".missing-copy-state") }));
  expectFailure("missing baseline primitive transitions", (v) => ({ ...v, css: v.css.replace(".sk-button.sk-motion-focus-feedback, .sk-button.sk-motion-press-feedback", ".missing-button-motion-compatibility") }));
  expectFailure("missing Link baseline transition", (v) => ({ ...v, css: v.css.replace(".sk-link.sk-motion-focus-feedback, .sk-link.sk-motion-press-feedback", ".missing-link-motion-compatibility") }));
  expectFailure("missing LinkCard baseline transitions", (v) => ({ ...v, css: v.css.replace(".sk-link-card.sk-motion-focus-feedback, .sk-link-card.sk-motion-press-feedback", ".missing-link-card-motion-compatibility") }));
  expectFailure("gallery drift", (v) => ({ ...v, gallery: v.gallery.replace("data-motion-key={utility.key}", "data-motion-key=\"drift\"") }));
  expectFailure("stale output", (v) => ({ ...v, docs: `${v.docs}\nStale.` }));
  fixtureCount += 1;
  validateMotionAssist({ utilities, guidance, css, styles, docs, gallery, classNameFor, fail });
  return fixtureCount;
}

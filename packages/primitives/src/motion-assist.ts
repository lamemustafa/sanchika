export type MotionAssistKey =
  | "focus-feedback"
  | "press-feedback"
  | "fade-entrance"
  | "rise-entrance"
  | "disclosure-continuity"
  | "status-highlight"
  | "copy-confirmation"
  | "skeleton-loading";

export interface MotionAssistUtility {
  readonly key: MotionAssistKey;
  readonly className: string;
  readonly purpose: string;
  readonly trigger: string;
  readonly tokenRoles: readonly string[];
  readonly properties: readonly string[];
  readonly duration: string;
  readonly easing: string;
  readonly maxTravel: string;
  readonly iteration: "once" | "repeating";
  readonly reducedMotionResult: string;
  readonly use: readonly string[];
  readonly avoid: readonly string[];
  readonly accessibilityWarning: string;
  readonly consumerResponsibility: string;
}

export interface AssistGuidanceEntry {
  readonly key: string;
  readonly situation: string;
  readonly semanticFirst: string;
  readonly optionalAssist: MotionAssistKey | "none";
  readonly consumerResponsibility: string;
}

const utility = (value: MotionAssistUtility): Readonly<MotionAssistUtility> =>
  Object.freeze({
    ...value,
    tokenRoles: Object.freeze([...value.tokenRoles]),
    properties: Object.freeze([...value.properties]),
    use: Object.freeze([...value.use]),
    avoid: Object.freeze([...value.avoid]),
  });

const guidance = (value: AssistGuidanceEntry): Readonly<AssistGuidanceEntry> =>
  Object.freeze({ ...value });

export const motionAssistUtilities = Object.freeze([
  utility({
    key: "focus-feedback",
    className: "sk-motion-focus-feedback",
    purpose: "Adds restrained spatial acknowledgement to an existing visible focus indicator.",
    trigger: ":focus-visible",
    tokenRoles: ["motion.duration.instant", "motion.easing.standard", "motion.distance-xs"],
    properties: ["transform"],
    duration: "motion.duration.instant",
    easing: "motion.easing.standard",
    maxTravel: "motion.distance-xs",
    iteration: "once",
    reducedMotionResult: "The transform and transition are removed; the focus outline remains primary.",
    use: ["Native interactive controls that already expose a visible focus outline."],
    avoid: ["Replacing focus outlines", "Static content", "Programmatic focus decoration"],
    accessibilityWarning: "Never use movement as the only focus indicator.",
    consumerResponsibility: "Keep native keyboard behavior and an independently visible focus outline.",
  }),
  utility({
    key: "press-feedback",
    className: "sk-motion-press-feedback",
    purpose: "Confirms direct activation without adding bounce, lift, or delayed action.",
    trigger: ":active on enabled controls",
    tokenRoles: ["motion.duration.instant", "motion.easing.standard", "motion.distance-xs"],
    properties: ["transform"],
    duration: "motion.duration.instant",
    easing: "motion.easing.standard",
    maxTravel: "motion.distance-xs",
    iteration: "once",
    reducedMotionResult: "The transform and transition are removed; native pressed state remains.",
    use: ["Enabled buttons and button-like controls with native activation semantics."],
    avoid: ["Disabled controls", "Links that do not behave as buttons", "Critical-action choreography"],
    accessibilityWarning: "Pressed feedback must not imply that an action succeeded.",
    consumerResponsibility: "Apply disabled semantics truthfully and expose the settled result separately.",
  }),
  utility({
    key: "fade-entrance",
    className: "sk-motion-fade-in",
    purpose: "Softens the first paint of newly rendered, already-visible supporting content.",
    trigger: "Class present when content enters the document",
    tokenRoles: ["motion.duration.slow", "motion.easing.enter"],
    properties: ["opacity"],
    duration: "motion.duration.slow",
    easing: "motion.easing.enter",
    maxTravel: "none",
    iteration: "once",
    reducedMotionResult: "Content is immediately and fully visible.",
    use: ["Small result summaries", "Non-critical supporting content already present in reading order"],
    avoid: ["Global page reveals", "Delayed visibility", "Repeated decoration"],
    accessibilityWarning: "Content must never depend on animation completion to become available.",
    consumerResponsibility: "Render semantic content first and do not add a JavaScript visibility gate.",
  }),
  utility({
    key: "rise-entrance",
    className: "sk-motion-rise-in",
    purpose: "Provides a short, one-pass spatial cue for newly rendered supporting content.",
    trigger: "Class present when content enters the document",
    tokenRoles: ["motion.duration.slow", "motion.easing.enter", "motion.distance-md"],
    properties: ["opacity", "transform"],
    duration: "motion.duration.slow",
    easing: "motion.easing.enter",
    maxTravel: "motion.distance-md",
    iteration: "once",
    reducedMotionResult: "Content is immediately visible in its settled position.",
    use: ["A compact result group or confirmation panel when spatial continuity helps."],
    avoid: ["Whole-page reveals", "Large travel", "Staggered lists"],
    accessibilityWarning: "Do not use movement to communicate order, urgency, or completion.",
    consumerResponsibility: "Keep source order and state meaning correct without motion.",
  }),
  utility({
    key: "disclosure-continuity",
    className: "sk-motion-disclosure-continuity",
    purpose: "Acknowledges native disclosure opening without animating layout dimensions.",
    trigger: "Content inside an open native details element",
    tokenRoles: ["motion.duration.fast", "motion.easing.enter", "motion.distance-xs"],
    properties: ["opacity", "transform"],
    duration: "motion.duration.fast",
    easing: "motion.easing.enter",
    maxTravel: "motion.distance-xs",
    iteration: "once",
    reducedMotionResult: "Disclosed content appears immediately in its settled position.",
    use: ["The content region of a native details and summary disclosure."],
    avoid: ["Animating height or max-height", "Clipping focusable content", "Custom accordion runtime"],
    accessibilityWarning: "Native disclosure semantics and keyboard behavior remain the source of truth.",
    consumerResponsibility: "Apply the class to content, not the details root, and retain descriptive summary copy.",
  }),
  utility({
    key: "status-highlight",
    className: "sk-motion-status-highlight",
    purpose: "Briefly reinforces a visible settled status without repeating or changing its meaning.",
    trigger: "Class present when a visible settled status is rendered",
    tokenRoles: ["motion.duration.standard", "motion.easing.emphasized"],
    properties: ["background-color", "border-color"],
    duration: "motion.duration.standard",
    easing: "motion.easing.emphasized",
    maxTravel: "none",
    iteration: "once",
    reducedMotionResult: "The settled status remains visible without animation.",
    use: ["Result counts", "Validated completion", "Visible status with a non-color cue"],
    avoid: ["Pending loops", "Error urgency", "Replacing live-region semantics"],
    accessibilityWarning: "Visible text and semantics must communicate the state without color or motion.",
    consumerResponsibility: "Choose announcement semantics for genuine dynamic updates and keep the wording truthful.",
  }),
  utility({
    key: "copy-confirmation",
    className: "sk-motion-copy-confirmation",
    purpose: "Reinforces the existing copied state after explicit clipboard activation.",
    trigger: "data-copy-state=copied",
    tokenRoles: ["motion.duration.standard", "motion.easing.emphasized", "motion.distance-xs"],
    properties: ["opacity", "transform"],
    duration: "motion.duration.standard",
    easing: "motion.easing.emphasized",
    maxTravel: "motion.distance-xs",
    iteration: "once",
    reducedMotionResult: "Copied wording remains immediately visible without movement.",
    use: ["The existing S5 CopyButton copied state and polite status."],
    avoid: ["Adding timers", "Copying without activation", "Sensitive values"],
    accessibilityWarning: "Motion does not replace visible and announced confirmation.",
    consumerResponsibility: "Keep the S5 state script, focus retention, denial handling, and bounded reset behavior.",
  }),
  utility({
    key: "skeleton-loading",
    className: "sk-motion-skeleton-loading",
    purpose: "Indicates an unresolved loading region while preserving stable placeholder geometry.",
    trigger: "Class present inside a truthfully busy owner",
    tokenRoles: ["motion.duration.loading", "motion.easing.standard"],
    properties: ["opacity"],
    duration: "motion.duration.loading",
    easing: "motion.easing.standard",
    maxTravel: "none",
    iteration: "repeating",
    reducedMotionResult: "A static outlined placeholder remains visible.",
    use: ["Decorative Skeleton shapes inside an aria-busy owner with truthful loading text."],
    avoid: ["Unknown waits without context", "Verified-content implication", "Decorative ambient loops"],
    accessibilityWarning: "Skeleton shapes stay hidden from assistive technology; the owner communicates loading.",
    consumerResponsibility: "Own aria-busy, loading wording, replacement timing, and layout stability.",
  }),
] as const);

export const assistGuidanceEntries = Object.freeze([
  guidance({ key: "result-counts", situation: "Result counts", semanticFirst: "A settled visible count and a polite, atomic status only when dynamically warranted.", optionalAssist: "status-highlight", consumerResponsibility: "Do not announce every keystroke or imply remote verification." }),
  guidance({ key: "inline-validation", situation: "Inline validation", semanticFirst: "Associated visible error or success text with truthful invalid state.", optionalAssist: "status-highlight", consumerResponsibility: "Keep focus stable and do not rely on motion for severity." }),
  guidance({ key: "error-recovery", situation: "Error recovery", semanticFirst: "State what failed, the safe next action, and any sanitized reference.", optionalAssist: "none", consumerResponsibility: "Prefer immediate legibility over urgent animation." }),
  guidance({ key: "disclosure", situation: "Disclosure", semanticFirst: "Native details and summary with a descriptive accessible name.", optionalAssist: "disclosure-continuity", consumerResponsibility: "Never animate height or clip revealed focusable content." }),
  guidance({ key: "copy", situation: "Copy confirmation", semanticFirst: "Explicit activation, visible copied wording, and a polite status.", optionalAssist: "copy-confirmation", consumerResponsibility: "Retain denial handling, focus, and the existing bounded reset timer." }),
  guidance({ key: "safe-pending", situation: "Safe pending work", semanticFirst: "A truthfully busy owner and readable pending text.", optionalAssist: "skeleton-loading", consumerResponsibility: "Use the repeating utility only for a real unresolved loading region." }),
  guidance({ key: "human-approval", situation: "Human approval", semanticFirst: "Visible pending, approved, or rejected wording plus accountable evidence.", optionalAssist: "status-highlight", consumerResponsibility: "Motion must never imply that approval happened." }),
] as const satisfies readonly AssistGuidanceEntry[]);

const utilityClassNames = new Map<MotionAssistKey, string>(
  motionAssistUtilities.map(({ key, className }) => [key, className]),
);

export function motionAssistClassName(key: MotionAssistKey): string {
  const className = utilityClassNames.get(key);
  if (!className) throw new TypeError(`Unknown motion-assist key: ${String(key)}`);
  return className;
}

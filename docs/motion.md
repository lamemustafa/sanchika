# Motion and assist behavior

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
| `focus-feedback` | `.sk-motion-focus-feedback` | Adds restrained spatial acknowledgement to an existing visible focus indicator. | :focus-visible | motion.duration.instant / motion.easing.standard | motion.distance-xs | once | The transform and transition are removed; the focus outline remains primary. |
| `press-feedback` | `.sk-motion-press-feedback` | Confirms direct activation without adding bounce, lift, or delayed action. | :active on enabled controls | motion.duration.instant / motion.easing.standard | motion.distance-xs | once | The transform and transition are removed; native pressed state remains. |
| `fade-entrance` | `.sk-motion-fade-in` | Softens the first paint of newly rendered, already-visible supporting content. | Class present when content enters the document | motion.duration.slow / motion.easing.enter | none | once | Content is immediately and fully visible. |
| `rise-entrance` | `.sk-motion-rise-in` | Provides a short, one-pass spatial cue for newly rendered supporting content. | Class present when content enters the document | motion.duration.slow / motion.easing.enter | motion.distance-md | once | Content is immediately visible in its settled position. |
| `disclosure-continuity` | `.sk-motion-disclosure-continuity` | Acknowledges native disclosure opening without animating layout dimensions. | Content inside an open native details element | motion.duration.fast / motion.easing.enter | motion.distance-xs | once | Disclosed content appears immediately in its settled position. |
| `status-highlight` | `.sk-motion-status-highlight` | Briefly reinforces a visible settled status without repeating or changing its meaning. | Class present when a visible settled status is rendered | motion.duration.standard / motion.easing.emphasized | none | once | The settled status remains visible without animation. |
| `copy-confirmation` | `.sk-motion-copy-confirmation` | Reinforces the existing copied state after explicit clipboard activation. | data-copy-state=copied | motion.duration.standard / motion.easing.emphasized | motion.distance-xs | once | Copied wording remains immediately visible without movement. |
| `skeleton-loading` | `.sk-motion-skeleton-loading` | Indicates an unresolved loading region while preserving stable placeholder geometry. | Class present inside a truthfully busy owner | motion.duration.loading / motion.easing.standard | none | repeating | A static outlined placeholder remains visible. |

### focus-feedback

- Use: Native interactive controls that already expose a visible focus outline.
- Avoid: Replacing focus outlines Static content Programmatic focus decoration
- Accessibility warning: Never use movement as the only focus indicator.
- Consumer responsibility: Keep native keyboard behavior and an independently visible focus outline.

### press-feedback

- Use: Enabled buttons and button-like controls with native activation semantics.
- Avoid: Disabled controls Links that do not behave as buttons Critical-action choreography
- Accessibility warning: Pressed feedback must not imply that an action succeeded.
- Consumer responsibility: Apply disabled semantics truthfully and expose the settled result separately.

### fade-entrance

- Use: Small result summaries Non-critical supporting content already present in reading order
- Avoid: Global page reveals Delayed visibility Repeated decoration
- Accessibility warning: Content must never depend on animation completion to become available.
- Consumer responsibility: Render semantic content first and do not add a JavaScript visibility gate.

### rise-entrance

- Use: A compact result group or confirmation panel when spatial continuity helps.
- Avoid: Whole-page reveals Large travel Staggered lists
- Accessibility warning: Do not use movement to communicate order, urgency, or completion.
- Consumer responsibility: Keep source order and state meaning correct without motion.

### disclosure-continuity

- Use: The content region of a native details and summary disclosure.
- Avoid: Animating height or max-height Clipping focusable content Custom accordion runtime
- Accessibility warning: Native disclosure semantics and keyboard behavior remain the source of truth.
- Consumer responsibility: Apply the class to content, not the details root, and retain descriptive summary copy.

### status-highlight

- Use: Result counts Validated completion Visible status with a non-color cue
- Avoid: Pending loops Error urgency Replacing live-region semantics
- Accessibility warning: Visible text and semantics must communicate the state without color or motion.
- Consumer responsibility: Choose announcement semantics for genuine dynamic updates and keep the wording truthful.

### copy-confirmation

- Use: The existing S5 CopyButton copied state and polite status.
- Avoid: Adding timers Copying without activation Sensitive values
- Accessibility warning: Motion does not replace visible and announced confirmation.
- Consumer responsibility: Keep the S5 state script, focus retention, denial handling, and bounded reset behavior.

### skeleton-loading

- Use: Decorative Skeleton shapes inside an aria-busy owner with truthful loading text.
- Avoid: Unknown waits without context Verified-content implication Decorative ambient loops
- Accessibility warning: Skeleton shapes stay hidden from assistive technology; the owner communicates loading.
- Consumer responsibility: Own aria-busy, loading wording, replacement timing, and layout stability.

## Assist guidance

| Situation | Semantic first | Optional assist | Consumer responsibility |
| --- | --- | --- | --- |
| Result counts | A settled visible count and a polite, atomic status only when dynamically warranted. | `status-highlight` | Do not announce every keystroke or imply remote verification. |
| Inline validation | Associated visible error or success text with truthful invalid state. | `status-highlight` | Keep focus stable and do not rely on motion for severity. |
| Error recovery | State what failed, the safe next action, and any sanitized reference. | None | Prefer immediate legibility over urgent animation. |
| Disclosure | Native details and summary with a descriptive accessible name. | `disclosure-continuity` | Never animate height or clip revealed focusable content. |
| Copy confirmation | Explicit activation, visible copied wording, and a polite status. | `copy-confirmation` | Retain denial handling, focus, and the existing bounded reset timer. |
| Safe pending work | A truthfully busy owner and readable pending text. | `skeleton-loading` | Use the repeating utility only for a real unresolved loading region. |
| Human approval | Visible pending, approved, or rejected wording plus accountable evidence. | `status-highlight` | Motion must never imply that approval happened. |

## Result counts

Render the settled visible count first. Use a polite atomic status only for a genuine dynamic update, and avoid announcing every keystroke. A one-pass status highlight may reinforce the settled result but cannot imply server or official verification.

## Inline validation

Associate visible error or success wording with the control and keep focus stable. Motion cannot replace `aria-invalid`, descriptions, or non-color severity cues.

## Error recovery

State what failed, provide a safe next action, and sanitize technical detail. Error recovery remains immediate; urgent shaking, pulsing, or repeated emphasis is outside this package.

## Disclosure continuity

Use native `details` and `summary`. Apply the optional class to the revealed content only. Never animate `height` or `max-height`, clip focusable content, or add an accordion runtime.

## Copy confirmation

Reuse the S5 explicit-activation script and its visible, polite, bounded confirmation state. The utility adds no clipboard behavior and no timer.

## Safe pending work

Use Skeleton only inside a truthfully busy owner with readable loading context. Hide decorative shapes from assistive technology, keep geometry stable, and replace them with real content when work settles.

## Human approval

Human decisions require visible pending, approved, or rejected wording and accountable evidence. Motion may reinforce a settled visible state but must never imply that approval occurred.

## Reduced motion and forced colors

The package owns one scoped `prefers-reduced-motion` block for its motion behavior. It removes transitions and animations while restoring settled opacity and position. It never removes outlines, hides status text, or targets the global document. Forced-colors behavior preserves system-color boundaries and focus indicators.

## Consumer boundary

The package exports metadata, a finite class-name helper, and CSS. Consumers retain state, timing, announcements, native interaction, async work, authorization, evidence, and product workflow ownership. No JavaScript animation runtime is exported.

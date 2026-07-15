import { defineProductPattern } from "../product-pattern-definition.ts";

const toolRules = {
  primaryProductMode: "tools/local-artifact" as const,
  copyObligations: ["Name the user job, input, draft output, processing boundary, review owner, limitation, and next action."],
  prohibitedClaims: ["professional approval", "guaranteed compliant output", "autonomous filing or reply", "unproven no-network or no-upload behavior"],
  reducedMotionBehavior: ["Keep directory results, empty state, draft status, and next action understandable without animated filtering or confirmation."],
  forcedColorsBehavior: ["Retain text status, result boundaries, native focus, link underlines, and selected filters using system colors."],
  syntheticRequirement: "Reference tools, inputs, entities, outputs, dates, and filenames must be visibly synthetic.",
  consumerResponsibilities: ["Provide each tool specification, runtime, source mapping, draft generation, export, storage, and any external handoff."],
} as const;

function accessibilityHooks(semantics: string, focusOrder: string) {
  return {
    semantics,
    keyboard: "Use native search, buttons, links, and status semantics; filtering keeps focus predictable and visible.",
    announcements: "Announce settled result counts, no-results, generation failure, and draft readiness without moving focus.",
    focusOrder,
  } as const;
}

const trust = [
  "Search terms, entered facts, and draft outputs stay in the browser unless a named adopter action says otherwise.",
  "Every tool names its input, output, review requirement, and local or external boundary before opening.",
] as const;

const guidance = [
  "Organize tools by the user's concrete job, not implementation category.",
  "Call outputs drafts and identify the professional or source review still required.",
] as const;

export const toolsLocalArtifactPatterns = Object.freeze([
  defineProductPattern({
    name: "ToolDirectory",
    group: "tools-local-artifact",
    purpose: "Help users find a browser-local draft tool by job while inspecting input, output, and review boundaries.",
    ...toolRules,
    userJob: "Find a bounded draft tool by work type and inspect its input, output, and review requirement before opening it.",
    semanticRoot: "A labelled section containing native search, category filters, a complete server-rendered list, result status, no-results state, and handoff.",
    intendedProducts: ["tools/local-artifact"],
    anatomy: [
      { name: "directoryHeader", purpose: "Directory scope and identity." },
      { name: "resultStatus", purpose: "Live result count for default, filtered, and no-results states." },
      { name: "search", purpose: "Browser-local job search." },
      { name: "filters", purpose: "Visible work-category filters." },
      { name: "toolList", purpose: "Ordered tool cards or rows." },
      { name: "emptyState", purpose: "No-match explanation and clear action." },
      { name: "workspaceHandoff", purpose: "Route continuing or saved work to Axal." },
    ],
    requiredFields: ["directoryHeader", "resultStatus", "search", "filters", "toolList", "emptyState", "workspaceHandoff"],
    variants: [
      { name: "rows", purpose: "Dense job-oriented directory." },
      { name: "cards", purpose: "Compact small-directory layout." },
    ],
    accessibilityHooks: accessibilityHooks("Use a labelled directory section with a native search form, toggle buttons, result status, and semantic list of ToolCards.", "Visit search, filters, complete result list, no-results reset when present, then the workspace handoff."),
    states: [
      { name: "default", purpose: "All tools are visible.", requiredVisibleSignals: ["tool count", "input", "output", "review"] },
      { name: "filtered", purpose: "A search or category filter is active.", requiredVisibleSignals: ["filter", "result count", "clear"] },
      { name: "no-results", purpose: "No tool matches.", requiredVisibleSignals: ["no match", "search term", "clear filters"] },
    ],
    trustBoundaries: trust,
    responsiveBehavior: ["Collapse metadata columns beneath each tool identity.", "Preserve search, result status, and clear action in DOM order."],
    exemplarRoutes: ["/patterns/tools/", "/lab/tools-directory/"],
    adopterGuidance: guidance,
    nonGoals: ["tool execution runtime", "account system", "remote search", "generic app marketplace"],
  }),
  defineProductPattern({
    name: "ToolCard",
    group: "tools-local-artifact",
    purpose: "Describe one bounded tool by user job, input, output, review owner, and local boundary.",
    ...toolRules,
    userJob: "Inspect a tool's input, draft output, review owner, and boundary before following its single destination.",
    semanticRoot: "A LinkCard root anchor or one-named-link article with no additional interactive descendants.",
    intendedProducts: ["tools/local-artifact"],
    anatomy: [
      { name: "category", purpose: "Work category label." },
      { name: "title", purpose: "Specific job-oriented tool name." },
      { name: "summary", purpose: "Bounded user outcome." },
      { name: "input", purpose: "Facts or artifacts the user provides." },
      { name: "output", purpose: "Draft artifact produced." },
      { name: "review", purpose: "Professional or source review requirement." },
      { name: "boundary", purpose: "Local or workspace boundary." },
      { name: "status", purpose: "Availability or limitation in text." },
      { name: "action", purpose: "Open or inspect action." },
    ],
    requiredFields: ["category", "title", "summary", "input", "output", "review", "boundary", "status", "action"],
    variants: [
      { name: "row", purpose: "Dense directory row." },
      { name: "card", purpose: "Grouped narrow-screen surface." },
    ],
    accessibilityHooks: accessibilityHooks("Use LinkCard semantics with exactly one native anchor and no nested or sibling controls inside the card.", "Read title and job, input, output, review, boundary and status, then activate the single named destination."),
    states: [
      { name: "available", purpose: "Tool can be opened.", requiredVisibleSignals: ["input", "output", "review"] },
      { name: "limited", purpose: "Tool has a known limitation.", requiredVisibleSignals: ["limited", "reason", "alternative"] },
      { name: "unavailable", purpose: "Tool cannot be used.", requiredVisibleSignals: ["unavailable", "reason", "fallback"] },
    ],
    trustBoundaries: trust,
    responsiveBehavior: ["Keep input, output, and review labels visible; do not reduce them to icons.", "Move action after boundary metadata on narrow screens."],
    exemplarRoutes: ["/patterns/tools/", "/lab/tools-directory/"],
    adopterGuidance: guidance,
    nonGoals: ["tool implementation", "remote execution", "guaranteed compliant output"],
  }),
  defineProductPattern({
    name: "LocalBoundaryBanner",
    group: "tools-local-artifact",
    purpose: "State browser-local storage, account, upload, and review behavior before tool input.",
    ...toolRules,
    userJob: "Confirm where work is processed, whether it leaves the browser, and who reviews the output before entering data.",
    semanticRoot: "A concise labelled aside placed before tool input with a source or policy link.",
    intendedProducts: ["tools/local-artifact", "pack/local-utility"],
    anatomy: [
      { name: "boundaryClaim", purpose: "What stays local and what remains a draft." },
      { name: "processingLocation", purpose: "Browser or device location where work is processed." },
      { name: "accountFact", purpose: "Whether an account is required." },
      { name: "uploadFact", purpose: "Whether entered work leaves the browser." },
      { name: "networkTelemetryFact", purpose: "Named network or telemetry behavior." },
      { name: "reviewFact", purpose: "Who must review the result." },
      { name: "sourcePolicy", purpose: "Inspectable source or policy link." },
    ],
    requiredFields: ["boundaryClaim", "processingLocation", "accountFact", "uploadFact", "networkTelemetryFact", "reviewFact", "sourcePolicy"],
    variants: [
      { name: "draft", purpose: "Browser-local drafting boundary." },
      { name: "local", purpose: "Device-local artifact boundary." },
    ],
    accessibilityHooks: accessibilityHooks("Use a labelled aside with text facts and a native source or policy link.", "Read processing, account, upload, network or telemetry and review facts before the tool input."),
    states: [
      { name: "local-only", purpose: "No upload or account is required.", requiredVisibleSignals: ["browser-local", "no upload", "review named"] },
      { name: "handoff", purpose: "A later action leaves the local boundary.", requiredVisibleSignals: ["handoff", "destination", "reason"] },
    ],
    trustBoundaries: trust,
    responsiveBehavior: ["Stack facts after the claim and before input controls.", "Keep every fact labelled in text."],
    exemplarRoutes: ["/patterns/tools/", "/lab/tools-directory/"],
    adopterGuidance: guidance,
    nonGoals: ["privacy guarantee", "storage implementation", "telemetry audit"],
  }),
  defineProductPattern({
    name: "OutputArtifactSummary",
    group: "tools-local-artifact",
    purpose: "Describe a generated draft artifact, its inputs, local destination, source basis, and required review.",
    ...toolRules,
    userJob: "Inspect what generated a draft, where it is stored, what it does not establish, and who must review it.",
    semanticRoot: "A labelled aside or section with draft status, source basis, destination, limitation, review requirement, and next action.",
    intendedProducts: ["tools/local-artifact", "pack/local-utility"],
    anatomy: [
      { name: "artifactType", purpose: "Specific draft or downloaded artifact type." },
      { name: "artifactName", purpose: "Name of the generated or downloaded output." },
      { name: "generatedFrom", purpose: "User-entered facts or visible source basis." },
      { name: "generatedOutput", purpose: "Bounded output created from the source or input." },
      { name: "destination", purpose: "Browser or device location." },
      { name: "draftReviewStatus", purpose: "Draft and review state in text." },
      { name: "reviewRequirement", purpose: "Named professional or source review." },
      { name: "limitations", purpose: "What the artifact does not establish." },
      { name: "nextAction", purpose: "Inspect, copy, download, revise, clear, or retry action." },
    ],
    requiredFields: ["artifactType", "artifactName", "generatedFrom", "generatedOutput", "destination", "draftReviewStatus", "reviewRequirement", "limitations", "nextAction"],
    variants: [
      { name: "receipt", purpose: "Compact output receipt." },
      { name: "summary", purpose: "Detailed draft review summary." },
    ],
    accessibilityHooks: accessibilityHooks("Use a labelled output section; draft and review status remain visible text and actions use native controls.", "Read artifact and source basis, destination, draft and review status, limitation, then the next action."),
    states: [
      { name: "generated-draft", purpose: "A generated draft artifact is available.", requiredVisibleSignals: ["generated draft", "source input", "review required"] },
      { name: "ready-for-review", purpose: "The draft is ready for a named reviewer.", requiredVisibleSignals: ["ready for review", "reviewer", "destination"] },
      { name: "copied-downloaded", purpose: "The user copied or downloaded the local output.", requiredVisibleSignals: ["copied or downloaded", "destination", "draft status"] },
      { name: "failed", purpose: "Artifact generation failed.", requiredVisibleSignals: ["failed", "retained input state", "safe retry"] },
      { name: "unavailable", purpose: "The output cannot be generated safely.", requiredVisibleSignals: ["unavailable", "reason", "fallback"] },
    ],
    trustBoundaries: trust,
    responsiveBehavior: ["Keep draft and review labels adjacent to the artifact name.", "Wrap actions while preserving inspect or revise before export."],
    exemplarRoutes: ["/patterns/tools/"],
    adopterGuidance: guidance,
    nonGoals: ["artifact generation runtime", "persistent storage", "professional approval"],
  }),
] as const);

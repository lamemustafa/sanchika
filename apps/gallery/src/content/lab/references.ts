export const labRoutes = {
  complyeaze: {
    path: "/lab/complyeaze-core/",
    title: "ComplyEaze product family — North Star lab",
    description:
      "A synthetic Sanchika North Star reference for choosing between ComplyEaze workspaces and local tools.",
    eyebrow: "Indian compliance work · boundary first",
  },
  axal: {
    path: "/lab/axal-review-desk/",
    title: "Axal review desk — North Star lab",
    description:
      "A synthetic Sanchika North Star reference for a dense, source-backed compliance review desk.",
    eyebrow: "Synthetic workspace · CA review remains human",
  },
  pack: {
    path: "/lab/pack-local-proof/",
    title: "Pack local custody proof — North Star lab",
    description:
      "A synthetic Sanchika North Star reference for Pack's local GST return download custody boundary.",
    eyebrow: "Local browser utility · no ComplyEaze handoff",
  },
  tools: {
    path: "/lab/tools-directory/",
    title: "Tools directory — North Star lab",
    description:
      "A synthetic Sanchika North Star reference for finding browser-local compliance draft tools.",
    eyebrow: "Browser-local drafts · no upload",
  },
  motion: {
    path: "/lab/motion-and-assist/",
    title: "Motion and assist — North Star lab",
    description:
      "A synthetic Sanchika lab reference for restrained motion, focus, disclosure, progress, and reduced-motion behavior.",
    eyebrow: "Behavior specimens · CSS first",
  },
} as const;

export const productRoutes = [
  {
    label: "Primary workspace",
    name: "Axal",
    job: "Review client obligations with sources, owners, and human approval visible.",
    boundary: "Workspace account · saved client context",
    href: labRoutes.axal.path,
    signal: "3 items need review",
  },
  {
    label: "Local utility",
    name: "Pack",
    job: "Move supported filed-return files into Chrome Downloads on this device.",
    boundary: "Local browser action · no file upload",
    href: labRoutes.pack.path,
    signal: "User-controlled files",
  },
  {
    label: "Browser-local drafts",
    name: "Tools",
    job: "Create a first draft for a specific compliance task without an account.",
    boundary: "No upload · professional review required",
    href: labRoutes.tools.path,
    signal: "6 draft tools",
  },
] as const;

export const reviewQueue = [
  {
    id: "AX-031",
    title: "GST notice",
    state: "CA review needed",
    source: "Source linked",
    owner: "AK",
    due: "Due in 3 days",
    tone: "attention",
  },
  {
    id: "AX-047",
    title: "GSTR-2B variance",
    state: "Evidence requested",
    source: "Client input pending",
    owner: "RS",
    due: "Waiting on evidence",
    tone: "waiting",
  },
  {
    id: "AX-052",
    title: "TDS obligation",
    state: "Due soon",
    source: "Reviewer handoff ready",
    owner: "MK",
    due: "Due in 5 days",
    tone: "ready",
  },
] as const;

export const reviewEvidence = [
  { label: "Primary source", value: "Synthetic notice PDF", state: "Linked" },
  { label: "Portal context", value: "Synthetic GST workspace", state: "Recorded" },
  { label: "Working note", value: "Difference needs CA interpretation", state: "Draft" },
] as const;

export const auditTrail = [
  { time: "09:42", event: "Source linked", actor: "System evidence" },
  { time: "10:06", event: "Owner assigned", actor: "Review coordinator" },
  { time: "10:18", event: "CA checkpoint opened", actor: "AK" },
] as const;

export const custodyStages = [
  {
    step: "01",
    title: "GST Portal session",
    detail: "The user signs in and opens a supported filed return on the government portal.",
    boundary: "Credentials remain on GST Portal",
  },
  {
    step: "02",
    title: "Pack local browser action",
    detail: "The extension initiates the supported download inside the user's browser session.",
    boundary: "Session and cookies are not handed to ComplyEaze",
  },
  {
    step: "03",
    title: "Chrome Downloads",
    detail: "The browser saves the returned file into the user's Downloads on this device.",
    boundary: "File remains user-controlled and local",
  },
] as const;

export const custodyFacts = [
  { label: "Credentials", value: "Remain on GST Portal" },
  { label: "Session / cookies", value: "Not handed to ComplyEaze" },
  { label: "Filed-return file", value: "Saved locally" },
  { label: "Extension telemetry", value: "None from this workflow" },
  { label: "Source / release", value: "Inspectable before use" },
] as const;

export type ToolCategory = "Reconciliation" | "Drafting" | "Dates" | "Documents";

export interface LabTool {
  readonly name: string;
  readonly category: ToolCategory;
  readonly job: string;
  readonly input: string;
  readonly output: string;
  readonly review: string;
  readonly keywords: readonly string[];
}

export const labTools: readonly LabTool[] = [
  {
    name: "GSTR variance note",
    category: "Reconciliation",
    job: "Turn a pasted variance list into a structured review note.",
    input: "Pasted totals and period label",
    output: "Local draft note",
    review: "CA interpretation required",
    keywords: ["gst", "gstr-2b", "variance", "reconcile"],
  },
  {
    name: "Notice response outline",
    category: "Drafting",
    job: "Organise source points into a response outline.",
    input: "User-entered facts and source references",
    output: "Editable response outline",
    review: "Professional review required",
    keywords: ["notice", "reply", "response", "draft"],
  },
  {
    name: "Due-date working sheet",
    category: "Dates",
    job: "Lay out a working sequence of dates from user-entered events.",
    input: "Event labels and dates",
    output: "Local working timeline",
    review: "Verify against current authority",
    keywords: ["date", "timeline", "deadline", "calendar"],
  },
  {
    name: "Document checklist builder",
    category: "Documents",
    job: "Create a case-specific document request checklist.",
    input: "Selected work type and notes",
    output: "Downloadable draft checklist",
    review: "Reviewer confirms completeness",
    keywords: ["document", "checklist", "evidence", "request"],
  },
  {
    name: "TDS handoff brief",
    category: "Drafting",
    job: "Prepare a concise reviewer handoff from entered obligation facts.",
    input: "User-entered obligation summary",
    output: "Local handoff brief",
    review: "CA approval required",
    keywords: ["tds", "handoff", "obligation", "brief"],
  },
  {
    name: "Evidence index",
    category: "Documents",
    job: "Number and label an evidence list before human review.",
    input: "File names and user-entered descriptions",
    output: "Local evidence index",
    review: "Reviewer validates source mapping",
    keywords: ["evidence", "index", "files", "source"],
  },
] as const;

export const motionSpecimens = [
  {
    id: "focus",
    title: "Focus arrives, content does not move",
    trigger: "Keyboard navigation",
    behavior: "A high-contrast ring appears without scale or layout shift.",
    reduced: "Identical focus evidence; no transition dependency.",
    candidate: "140ms · cubic-bezier(0.2, 0.8, 0.2, 1) · 0px travel",
    reuse: "All four North Stars",
    c1Action: "Promote timing and easing if focus evidence passes.",
  },
  {
    id: "disclosure",
    title: "Disclosure follows the reading order",
    trigger: "Native details / summary",
    behavior: "The indicator turns and the answer appears in document flow.",
    reduced: "Indicator changes immediately; content remains available.",
    candidate: "140ms · cubic-bezier(0.2, 0.8, 0.2, 1) · 45deg indicator",
    reuse: "Axal and motion study",
    c1Action: "Promote only as the shared disclosure contract.",
  },
  {
    id: "progress",
    title: "Progress signals work, never certainty",
    trigger: "Synthetic processing state",
    behavior: "A restrained track moves while the copy names the pending review.",
    reduced: "The track becomes static and the text carries the state.",
    candidate: "640ms · cubic-bezier(0.2, 0.8, 0.2, 1) · 72% track travel",
    reuse: "Motion study only",
    c1Action: "Delete unless product proof establishes repetition.",
  },
  {
    id: "assist",
    title: "Assist suggests; the reviewer decides",
    trigger: "Draft suggestion available",
    behavior: "The suggestion enters with opacity and 0.5rem travel beside its source.",
    reduced: "The suggestion appears immediately with the same source label.",
    candidate: "640ms · cubic-bezier(0.2, 0.8, 0.2, 1) · 0.5rem travel",
    reuse: "Axal and motion study",
    c1Action: "Keep lab-only pending an Axal reuse decision.",
  },
] as const;

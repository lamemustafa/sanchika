export const modeRoutePaths = {
  complyeaze: {
    path: "/modes/complyeaze/",
    title: "ComplyEaze core mode | Sanchika",
    description:
      "A synthetic Sanchika reference composition for choosing between ComplyEaze workspaces and local tools.",
    eyebrow: "Indian compliance work · boundary first",
  },
  axal: {
    path: "/modes/axal/",
    title: "Axal workspace mode | Sanchika",
    description:
      "A synthetic Sanchika reference composition for a dense, source-backed compliance review desk.",
    eyebrow: "Synthetic workspace · CA review remains human",
  },
  pack: {
    path: "/modes/pack/",
    title: "Pack local utility mode | Sanchika",
    description:
      "A synthetic Sanchika reference composition for Pack's local GST return download custody boundary.",
    eyebrow: "Local browser utility · no ComplyEaze handoff",
  },
  tools: {
    path: "/modes/tools/",
    title: "Tools browser-local mode | Sanchika",
    description:
      "A synthetic Sanchika reference composition for finding browser-local compliance draft tools.",
    eyebrow: "Browser-local drafts · no upload",
  },
} as const;

export const productRoutes = [
  {
    label: "Primary workspace",
    name: "Axal",
    job: "Review client obligations with sources, owners, and human approval visible.",
    boundary: "Workspace account · saved client context",
    href: modeRoutePaths.axal.path,
    signal: "3 items need review",
  },
  {
    label: "Local utility",
    name: "Pack",
    job: "Move supported filed-return files into Chrome Downloads on this device.",
    boundary: "Local browser action · no file upload",
    href: modeRoutePaths.pack.path,
    signal: "User-controlled files",
  },
  {
    label: "Browser-local drafts",
    name: "Tools",
    job: "Create a first draft for a specific compliance task without an account.",
    boundary: "No upload · professional review required",
    href: modeRoutePaths.tools.path,
    signal: "6 draft tools",
  },
] as const;

export const reviewQueue = [
  {
    id: "AX-031",
    title: "GST notice",
    entity: "Synthetic entity A",
    state: "CA review needed",
    source: "Source linked",
    owner: "AK",
    due: "Due 18 July 2026",
    amount: "₹12,48,900 synthetic exposure",
    tone: "attention",
  },
  {
    id: "AX-047",
    title: "GSTR-2B variance",
    entity: "Synthetic entity B",
    state: "Evidence requested",
    source: "Client input pending",
    owner: "RS",
    due: "Evidence requested 14 July 2026",
    amount: "₹3,72,400 synthetic variance",
    tone: "waiting",
  },
  {
    id: "AX-052",
    title: "TDS obligation",
    entity: "Synthetic entity C",
    state: "Due soon",
    source: "Reviewer handoff ready",
    owner: "MK",
    due: "Due 20 July 2026",
    amount: "₹86,250 synthetic obligation",
    tone: "ready",
  },
] as const;

export const reviewEvidence = [
  { label: "Primary source", value: "Synthetic notice PDF", state: "Linked" },
  { label: "Portal context", value: "Synthetic GST workspace", state: "Recorded" },
  { label: "Working note", value: "Difference needs CA interpretation", state: "Draft" },
] as const;

export const auditTrail = [
  { date: "2026-07-14", dateLabel: "14 Jul 2026", time: "09:42", event: "Source linked", actor: "System evidence", reference: "SRC-01", resultingState: "Available", note: "Synthetic notice reference only" },
  { date: "2026-07-14", dateLabel: "14 Jul 2026", time: "10:06", event: "Owner assigned", actor: "Review coordinator", reference: "AX-031", resultingState: "CA review needed", note: "Assigned to synthetic reviewer AK" },
  { date: "2026-07-14", dateLabel: "14 Jul 2026", time: "10:18", event: "CA checkpoint opened", actor: "AK", reference: "CHK-01", resultingState: "Under review", note: "No approval recorded" },
] as const;

export const custodyStages = [
  {
    step: "01",
    title: "GST Portal session",
    detail: "The user signs in and opens a supported filed return on the government portal.",
    boundary: "Credentials remain on GST Portal",
    custodian: "User in the GST Portal browser tab",
    data: "Credentials and the selected filed-return request",
    crosses: "The request and response stay within the portal session",
    neverCrosses: "Credentials or session cookies to ComplyEaze",
    source: "Current supported GST Portal page",
    result: "Supported portal response ready for the browser action",
  },
  {
    step: "02",
    title: "Pack local browser action",
    detail: "The extension initiates the supported download inside the user's browser session.",
    boundary: "Session and cookies are not handed to ComplyEaze",
    custodian: "User's browser and local Pack extension",
    data: "Supported portal response and local download instruction",
    crosses: "A supported request goes only to the GST Portal destination",
    neverCrosses: "Session cookies, credentials, or file content to ComplyEaze",
    source: "Public Pack source and the active portal response",
    result: "Browser-managed download begins",
  },
  {
    step: "03",
    title: "Chrome Downloads",
    detail: "The browser saves the returned file into the user's Downloads on this device.",
    boundary: "File remains user-controlled and local",
    custodian: "User on this device in Chrome Downloads",
    data: "The supported filed-return artifact",
    crosses: "The file moves from the portal response into local Downloads",
    neverCrosses: "The downloaded file to ComplyEaze",
    source: "Browser download receipt and public Pack release evidence",
    result: "User-controlled local file",
  },
] as const;

export const custodyFacts = [
  { label: "Current custodian", value: "User on this device" },
  { label: "What moves", value: "Supported portal response into Chrome Downloads" },
  { label: "What never moves", value: "Credentials, session cookies, or downloaded file to ComplyEaze" },
  { label: "Credentials / session", value: "Remain in the GST Portal browser session" },
  { label: "Local destination", value: "User-controlled Chrome Downloads" },
  { label: "Source / release", value: "Public source and selected release remain inspectable" },
  { label: "User control", value: "User chooses permission, destination, and later file handling" },
] as const;

export type ToolCategory = "Reconciliation" | "Drafting" | "Dates" | "Documents";

export interface ShowcaseTool {
  readonly name: string;
  readonly category: ToolCategory;
  readonly job: string;
  readonly input: string;
  readonly output: string;
  readonly review: string;
  readonly keywords: readonly string[];
}

export const showcaseTools: readonly ShowcaseTool[] = [
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

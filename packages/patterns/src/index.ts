export type ConsumerMode = "complyeaze/core" | "axal/workspace" | "pack/local-utility" | "tools/local-artifact";

export type PatternSlot = {
  name: string;
  purpose: string;
};

export type PatternState = {
  name: string;
  purpose: string;
  requiredVisibleSignals: readonly string[];
  requiredSlots?: readonly string[];
  programmaticStatus?: PatternProgrammaticStatus;
  a11yChecks: readonly PatternA11yCheck[];
};

export type PatternA11ySourceReference =
  | {
      criterion: "WCAG22:1.3.1";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#info-and-relationships";
    }
  | {
      criterion: "WCAG22:1.4.3";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#contrast-minimum";
    }
  | {
      criterion: "WCAG22:1.4.11";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#non-text-contrast";
    }
  | {
      criterion: "WCAG22:2.1.1";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#keyboard";
    }
  | {
      criterion: "WCAG22:2.4.7";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#focus-visible";
    }
  | {
      criterion: "WCAG22:2.5.8";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#target-size-minimum";
    }
  | {
      criterion: "WCAG22:3.3.1";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#error-identification";
    }
  | {
      criterion: "WCAG22:3.3.2";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#labels-or-instructions";
    }
  | {
      criterion: "WCAG22:4.1.2";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#name-role-value";
    }
  | {
      criterion: "WCAG22:4.1.3";
      sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages";
    };

export type PatternA11yCriterion = PatternA11ySourceReference["criterion"];

export type PatternA11yCheck = PatternA11ySourceReference & {
  id: string;
  requirement: string;
  slotRefs?: readonly string[];
  manualTest: string;
};

export type PatternProgrammaticStatus =
  | {
      role: "status";
      ariaLive: "polite";
      ariaAtomic: true;
      slotRefs?: readonly string[];
      requirement: string;
    }
  | {
      role: "alert";
      ariaLive: "assertive";
      ariaAtomic: true;
      slotRefs?: readonly string[];
      requirement: string;
    };

export type PatternSpec = {
  name: string;
  consumerModes: readonly ConsumerMode[];
  purpose: string;
  requiredSlots: readonly PatternSlot[];
  requiredStates: readonly PatternState[];
  semanticObligations: readonly string[];
  nonGoals: readonly string[];
};

export const patternSpecs = [
  {
    name: "EvidencePanel",
    consumerModes: ["axal/workspace", "tools/local-artifact"],
    purpose: "Shows sources, review state, and confidence/uncertainty without implying automation is final.",
    requiredSlots: [
      { name: "sourceList", purpose: "Visible source documents, links, or citations used for the claim." },
      { name: "reviewState", purpose: "Human or system review status with non-color text." },
      { name: "uncertaintyCopy", purpose: "Plain-language confidence, limitation, or missing-evidence note." },
      { name: "provenanceTimestamp", purpose: "When the evidence or source state was last checked." },
      { name: "actionSlot", purpose: "Next safe action, such as attach proof, review source, or export." },
    ],
    requiredStates: [
      {
        name: "empty",
        purpose: "No evidence has been attached yet.",
        requiredVisibleSignals: ["No sources attached", "Add evidence"],
        requiredSlots: ["actionSlot"],
        a11yChecks: [
          {
            id: "empty-state-text",
            criterion: "WCAG22:1.3.1",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#info-and-relationships",
            requirement: "Empty evidence state must be visible text associated with the next safe action.",
            slotRefs: ["actionSlot"],
            manualTest: "Confirm the empty state is not icon-only and the action text is adjacent to the empty-state copy.",
          },
        ],
      },
      {
        name: "pending-review",
        purpose: "Evidence exists but still needs human review.",
        requiredVisibleSignals: ["Pending review", "Source count", "Last checked timestamp"],
        requiredSlots: ["sourceList", "reviewState", "provenanceTimestamp"],
        programmaticStatus: {
          role: "status",
          ariaLive: "polite",
          ariaAtomic: true,
          slotRefs: ["reviewState", "sourceList", "provenanceTimestamp"],
          requirement: "Pending review updates must be programmatically determinable without moving focus.",
        },
        a11yChecks: [
          {
            id: "pending-review-status",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Review state changes must expose status semantics in addition to visible text.",
            slotRefs: ["reviewState"],
            manualTest: "Trigger a pending-review update and confirm assistive tech can announce the state without focus movement.",
          },
        ],
      },
      {
        name: "reviewed",
        purpose: "Evidence has been reviewed against the visible source.",
        requiredVisibleSignals: ["Reviewed", "Reviewer or review method", "Source timestamp"],
        requiredSlots: ["sourceList", "reviewState", "provenanceTimestamp"],
        programmaticStatus: {
          role: "status",
          ariaLive: "polite",
          ariaAtomic: true,
          slotRefs: ["reviewState", "sourceList", "provenanceTimestamp"],
          requirement: "Reviewed state must be programmatically tied to the source and timestamp being reviewed.",
        },
        a11yChecks: [
          {
            id: "reviewed-non-color-status",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Reviewed state must not be communicated by color alone.",
            slotRefs: ["reviewState", "sourceList", "provenanceTimestamp"],
            manualTest: "Confirm reviewed copy, source identity, and timestamp are readable with color disabled.",
          },
        ],
      },
      {
        name: "blocked",
        purpose: "Evidence cannot support the claim yet.",
        requiredVisibleSignals: ["Blocked", "Missing evidence reason", "Next safe action"],
        requiredSlots: ["uncertaintyCopy", "actionSlot"],
        programmaticStatus: {
          role: "alert",
          ariaLive: "assertive",
          ariaAtomic: true,
          slotRefs: ["uncertaintyCopy", "actionSlot"],
          requirement: "Blocked evidence updates must announce the blocking reason and next safe action.",
        },
        a11yChecks: [
          {
            id: "blocked-reason-action-association",
            criterion: "WCAG22:3.3.2",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#labels-or-instructions",
            requirement: "Blocked reason must be associated with the next safe action.",
            slotRefs: ["uncertaintyCopy", "actionSlot"],
            manualTest: "Confirm the blocking reason is read before or with the action needed to resolve it.",
          },
          {
            id: "blocked-status-message",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Blocked evidence updates must expose the blocking reason as a status message without moving focus.",
            slotRefs: ["uncertaintyCopy", "actionSlot"],
            manualTest: "Trigger the blocked state and confirm role=alert announces the reason and next action without moving focus.",
          },
        ],
      },
    ],
    semanticObligations: [
      "Do not present AI output as final professional judgment.",
      "Expose source and uncertainty text without relying on color alone.",
      "Use synthetic examples unless a consumer app supplies authorized data.",
    ],
    nonGoals: ["AI runtime", "database persistence", "legal advice"],
  },
  {
    name: "TrustBoundary",
    consumerModes: ["pack/local-utility", "tools/local-artifact"],
    purpose: "Explains local processing, upload boundaries, permissions, and source visibility.",
    requiredSlots: [
      { name: "boundarySummary", purpose: "One-line local, upload, account, or network boundary statement." },
      { name: "permissionList", purpose: "Permissions or capabilities requested by the surface." },
      { name: "dataFlow", purpose: "What stays local, what leaves the device, and why." },
      { name: "sourceVisibility", purpose: "How a user can inspect source, proof, or generated artifacts." },
      { name: "actionSlot", purpose: "Fallback, permission, upload, or inspect action tied to the trust boundary." },
    ],
    requiredStates: [
      {
        name: "local-only",
        purpose: "The workflow stays on the user's device.",
        requiredVisibleSignals: ["Runs locally", "No upload", "Inspect source, proof artifact, and generated artifact"],
        requiredSlots: ["boundarySummary", "dataFlow", "sourceVisibility"],
        a11yChecks: [
          {
            id: "local-boundary-before-action",
            criterion: "WCAG22:1.3.1",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#info-and-relationships",
            requirement: "Local boundary copy must appear before the primary action in reading order.",
            slotRefs: ["boundarySummary", "dataFlow", "sourceVisibility"],
            manualTest: "Navigate by keyboard and reading order to confirm boundary copy precedes the action.",
          },
        ],
      },
      {
        name: "upload-required",
        purpose: "The workflow requires a file or artifact to leave the device.",
        requiredVisibleSignals: ["Upload required", "Destination: ComplyEaze workspace", "Reason: human review of proof artifact"],
        requiredSlots: ["boundarySummary", "dataFlow"],
        programmaticStatus: {
          role: "alert",
          ariaLive: "assertive",
          ariaAtomic: true,
          slotRefs: ["boundarySummary", "dataFlow"],
          requirement: "Upload-required state must announce the upload boundary before file selection or submission.",
        },
        a11yChecks: [
          {
            id: "upload-boundary-before-input",
            criterion: "WCAG22:3.3.2",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#labels-or-instructions",
            requirement: "Upload destination and reason must be instructions for the upload control.",
            slotRefs: ["boundarySummary", "dataFlow"],
            manualTest: "Confirm the upload control is described by the destination and reason for upload.",
          },
          {
            id: "upload-required-status-message",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Upload-required state must announce the upload boundary as a status message before file selection.",
            slotRefs: ["boundarySummary", "dataFlow"],
            manualTest: "Trigger upload-required state and confirm role=alert announces the upload destination and reason.",
          },
        ],
      },
      {
        name: "permission-required",
        purpose: "A browser, file, or account permission is needed.",
        requiredVisibleSignals: ["Permission required", "File read permission", "Purpose: inspect selected local artifact"],
        requiredSlots: ["permissionList", "boundarySummary"],
        programmaticStatus: {
          role: "alert",
          ariaLive: "assertive",
          ariaAtomic: true,
          slotRefs: ["permissionList", "boundarySummary"],
          requirement: "Permission-required state must announce requested permission and purpose.",
        },
        a11yChecks: [
          {
            id: "permission-purpose-label",
            criterion: "WCAG22:4.1.2",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#name-role-value",
            requirement: "Permission request controls must expose a name and purpose.",
            slotRefs: ["permissionList", "boundarySummary"],
            manualTest: "Inspect the permission control name and description with a screen reader.",
          },
          {
            id: "permission-required-status-message",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Permission-required state must announce the requested permission and purpose as a status message.",
            slotRefs: ["permissionList", "boundarySummary"],
            manualTest: "Trigger permission-required state and confirm role=alert announces the permission and purpose.",
          },
        ],
      },
      {
        name: "unavailable",
        purpose: "The trust boundary cannot be completed safely.",
        requiredVisibleSignals: ["Unavailable", "Reason: boundary cannot be completed safely", "Fallback: use a manual review path"],
        requiredSlots: ["boundarySummary", "actionSlot"],
        programmaticStatus: {
          role: "alert",
          ariaLive: "assertive",
          ariaAtomic: true,
          slotRefs: ["boundarySummary", "actionSlot"],
          requirement: "Unavailable trust-boundary state must announce reason and fallback action.",
        },
        a11yChecks: [
          {
            id: "unavailable-not-disabled-only",
            criterion: "WCAG22:4.1.2",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#name-role-value",
            requirement: "Unavailable state must be more than a disabled-only control.",
            slotRefs: ["boundarySummary", "actionSlot"],
            manualTest: "Confirm reason and fallback action remain programmatically available when the primary action is unavailable.",
          },
          {
            id: "unavailable-boundary-status-message",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Unavailable trust-boundary state must announce the reason and fallback action as a status message.",
            slotRefs: ["boundarySummary", "actionSlot"],
            manualTest: "Trigger unavailable state and confirm role=alert announces the reason and fallback action.",
          },
        ],
      },
    ],
    semanticObligations: [
      "Do not use trust copy as a substitute for real privacy or security behavior.",
      "Name external handoffs before the user acts.",
      "Keep permissions visible near the action that needs them.",
    ],
    nonGoals: ["security certification", "government affiliation", "telemetry disclosure substitute"],
  },
  {
    name: "ServiceSection",
    consumerModes: ["complyeaze/core"],
    purpose: "Presents service categories with clear human guidance and restrained calls to action.",
    requiredSlots: [
      { name: "serviceName", purpose: "Specific service category or compliance workflow name." },
      { name: "userOutcome", purpose: "The operational result a client can expect." },
      { name: "humanSupport", purpose: "Who reviews, advises, or acts on the user's behalf." },
      { name: "ctaSlot", purpose: "Restrained action that starts a conversation or handoff." },
    ],
    requiredStates: [
      {
        name: "default",
        purpose: "A service category is available for consideration.",
        requiredVisibleSignals: ["Service name", "User outcome", "Human support"],
        requiredSlots: ["serviceName", "userOutcome", "humanSupport"],
        a11yChecks: [
          {
            id: "service-heading-label",
            criterion: "WCAG22:1.3.1",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#info-and-relationships",
            requirement: "Heading and action labels must identify the service without relying on card position.",
            slotRefs: ["serviceName", "userOutcome", "humanSupport"],
            manualTest: "Navigate headings and actions out of visual order and confirm the service remains identifiable.",
          },
        ],
      },
      {
        name: "selected",
        purpose: "A user has chosen or focused a service path.",
        requiredVisibleSignals: ["Selected service", "Next step"],
        requiredSlots: ["serviceName", "ctaSlot"],
        programmaticStatus: {
          role: "status",
          ariaLive: "polite",
          ariaAtomic: true,
          slotRefs: ["serviceName", "ctaSlot"],
          requirement: "Selected service state must be programmatically available without color-only treatment.",
        },
        a11yChecks: [
          {
            id: "selected-keyboard-visible",
            criterion: "WCAG22:2.4.7",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#focus-visible",
            requirement: "Selected service path must remain keyboard reachable with visible focus.",
            slotRefs: ["serviceName", "ctaSlot"],
            manualTest: "Select the service with keyboard only and confirm visible focus and selected text are present.",
          },
          {
            id: "selected-service-status-message",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Selected service state must announce the selected service and next step as a status message.",
            slotRefs: ["serviceName", "ctaSlot"],
            manualTest: "Select the service and confirm role=status announces the selected service without moving focus.",
          },
        ],
      },
      {
        name: "unavailable",
        purpose: "The service is not currently offered or requires consultation.",
        requiredVisibleSignals: ["Unavailable", "Reason", "Consultation path"],
        requiredSlots: ["serviceName", "humanSupport"],
        programmaticStatus: {
          role: "status",
          ariaLive: "polite",
          ariaAtomic: true,
          slotRefs: ["serviceName", "humanSupport"],
          requirement: "Unavailable service state must keep consultation guidance programmatically available.",
        },
        a11yChecks: [
          {
            id: "unavailable-service-explanation",
            criterion: "WCAG22:4.1.2",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#name-role-value",
            requirement: "Unavailable service explanation must not be hidden from assistive technology.",
            slotRefs: ["serviceName", "humanSupport"],
            manualTest: "Confirm service name, unavailable reason, and consultation path are announced together.",
          },
          {
            id: "unavailable-service-status-message",
            criterion: "WCAG22:4.1.3",
            sourceUrl: "https://www.w3.org/TR/WCAG22/#status-messages",
            requirement: "Unavailable service state must announce the service and consultation path as a status message.",
            slotRefs: ["serviceName", "humanSupport"],
            manualTest: "Trigger unavailable service state and confirm role=status announces the reason and consultation path.",
          },
        ],
      },
    ],
    semanticObligations: [
      "Do not imply government affiliation or guaranteed filing outcomes.",
      "Prefer specific service language over generic SaaS benefit cards.",
      "Keep calls to action service-led rather than urgency-led.",
    ],
    nonGoals: ["generic SaaS bento", "unsupported security claims"],
  },
] as const satisfies readonly PatternSpec[];

export type PatternName = (typeof patternSpecs)[number]["name"];
export type PatternSpecFor<Name extends PatternName> = Extract<(typeof patternSpecs)[number], { name: Name }>;
export type PatternSlotNameFor<Name extends PatternName> = PatternSpecFor<Name>["requiredSlots"][number]["name"];
export type PatternStateNameFor<Name extends PatternName> = PatternSpecFor<Name>["requiredStates"][number]["name"];
export type PatternStateFor<
  Name extends PatternName,
  StateName extends string,
> = Extract<PatternSpecFor<Name>["requiredStates"][number], { name: StateName }>;
export type PatternSlotName = PatternSlotNameFor<PatternName>;
export type PatternStateName = PatternStateNameFor<PatternName>;
export type PatternA11yCheckFor<
  Name extends PatternName,
  StateName extends PatternStateNameFor<Name>,
> = PatternStateFor<Name, StateName>["a11yChecks"][number];
export type PatternProgrammaticStatusFor<
  Name extends PatternName,
  StateName extends PatternStateNameFor<Name>,
> = PatternStateFor<Name, StateName> extends { readonly programmaticStatus: infer Status } ? Status : never;
export type PatternStateRequiredSlotNameFor<
  Name extends PatternName,
  StateName extends PatternStateNameFor<Name>,
> = PatternStateFor<Name, StateName> extends { readonly requiredSlots: readonly (infer SlotName)[] }
  ? Extract<SlotName, PatternSlotNameFor<Name>>
  : never;

export function patternStateSlotCopy(
  patternName: string,
  stateName: string,
  slotName: string,
  visibleSignals: readonly string[],
  slotIndex: number,
): string {
  const primarySignal = visibleSignals[0] ?? titleCase(stateName);
  const secondarySignal = visibleSignals[1] ?? "Supporting detail";
  const finalSignal = visibleSignals.at(-1) ?? "Next safe action";

  if (slotIndex === 0) {
    return `${primarySignal}: ${primaryDetail(patternName, stateName, slotName)}`;
  }

  const copyBySlot: Record<string, string> = {
    sourceList: `${secondarySignal}: 1 synthetic source attached; illustrative source summary attached.`,
    provenanceTimestamp: `${finalSignal}: Synthetic timestamp for gallery review only.`,
    actionSlot: `${finalSignal}: Review source evidence before continuing.`,
    ctaSlot: `${finalSignal}: Review source evidence before continuing.`,
    uploadDestination: `${secondarySignal}: Synthetic destination selected by the consuming product, not hardcoded by Sanchika.`,
    uploadReason: `${finalSignal}: Synthetic reason for upload is shown before file selection.`,
    humanSupport: `${finalSignal}: Human consultation is available before a filing or review action.`,
    eyebrow: `${secondarySignal}: ComplyEaze product family routing context is visible.`,
    title: `${primarySignal}: Choose the right compliance product surface.`,
    summary: `${secondarySignal}: Compare workspace, local utility, browser-local tool, and external operational SaaS options.`,
    products: `${primarySignal}: Axal workspace, Pack local utility, Tools browser-local drafts, and ComplyEaze support are listed with mode, audience, status, trust boundary, and destination.`,
    policyLinks: `${finalSignal}: Privacy, support, source, or review-policy links are available before external navigation.`,
    primaryCta: `${finalSignal}: Open the named product destination after reviewing its trust boundary.`,
    secondaryCta: `${finalSignal}: Use the fallback, inspect, compare, or support path instead of a hidden disabled control.`,
  };

  if (slotName === "dataFlow") {
    if (patternName === "TrustBoundary" && stateName === "upload-required") {
      return `${secondarySignal}: The consumer must name any upload destination and reason before artifact selection.`;
    }
    if (patternName === "TrustBoundary" && stateName === "local-only") {
      return `${secondarySignal}: The proof artifact stays local; any later export is a user-controlled file save, not a network upload.`;
    }
    return `${secondarySignal}: The selected artifact leaves the device only after explicit user action.`;
  }

  if (slotName === "boundarySummary") {
    if (patternName === "TrustBoundary" && stateName === "local-only") {
      return `${secondarySignal}: Runs locally with No upload; export means saving a generated artifact locally.`;
    }
    return `${secondarySignal}: The local or upload boundary is stated before the action.`;
  }

  if (slotName === "sourceVisibility") {
    if (patternName === "TrustBoundary") {
      return `${finalSignal}: Users can inspect source, proof artifact, and generated artifact before continuing.`;
    }
    return `${finalSignal}: ${slotName} is visible before the next action.`;
  }

  if (slotName === "trustCopy") {
    const detailByState: Record<string, string> = {
      "workspace-product": "Workspace products may save client data and need role-aware review workflows.",
      "local-first-product": "Local-first products avoid account requirements and keep artifacts user-controlled.",
      "browser-local-tool": "Browser-local tools produce draft outputs without upload assumptions.",
    };
    return `${secondarySignal}: ${detailByState[stateName] ?? "Product mode and trust boundary are visible before navigation."}`;
  }

  return copyBySlot[slotName] ?? `${secondarySignal}: ${slotName} is visible in the ${stateName} state exemplar.`;
}

function primaryDetail(patternName: string, stateName: string, slotName: string): string {
  if (patternName === "EvidencePanel" && slotName === "sourceList") {
    return "1 synthetic source attached; illustrative source summary attached.";
  }
  if (patternName === "EvidencePanel" && slotName === "reviewState") {
    return stateName === "reviewed" ? "Synthetic evidence has been reviewed." : "Synthetic evidence needs review.";
  }
  if (patternName === "EvidencePanel" && slotName === "uncertaintyCopy") {
    return "Missing official source evidence prevents completion.";
  }
  if (patternName === "TrustBoundary" && slotName === "boundarySummary") {
    return "The upload or fallback boundary is visible before the action.";
  }
  if (patternName === "TrustBoundary" && slotName === "permissionList") {
    return "File read permission is needed to inspect the selected local artifact.";
  }
  if (patternName === "ServiceSection" && slotName === "serviceName") {
    if (stateName === "selected") return "Example advisory review is selected.";
    if (stateName === "unavailable") return "Example advisory review is unavailable; consultation path is shown.";
    return "Example advisory review is available for consideration.";
  }
  if (patternName === "ProductFamilyRouter" && slotName === "products") {
    if (stateName === "product-unavailable") return "Unavailable product is named with a reason and fallback path.";
    if (stateName === "external-link") return "External link destination is named before navigation.";
    if (stateName === "local-first-product") return "Local-first product keeps artifacts user-controlled.";
    if (stateName === "workspace-product") return "Workspace product requires an account and saved operational context.";
    if (stateName === "browser-local-tool") return "Browser-local tool creates draft output without upload assumptions.";
    return "Product cards name mode, audience, status, trust boundary, and destination.";
  }
  return `${slotName} is visible in the ${stateName} state exemplar.`;
}

export function kebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

function titleCase(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

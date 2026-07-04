import { colorTokens } from "@sanchika/tokens";
import { primitiveClassName, primitiveSpecs } from "@sanchika/primitives";
import { patternSpecs } from "@sanchika/patterns";

export const primitiveGalleryCssImports = ["@sanchika/tokens/theme.css", "@sanchika/primitives/styles.css"] as const;

export function renderPrimitiveGalleryMarkup(): string {
  const primitiveContracts = primitiveSpecs
    .map((primitive) => {
      const states = primitive.requiredStates.map((state) => `<li>${escapeHtml(state)}</li>`).join("");
      const evidence = primitive.stateEvidence
        .map((stateEvidence) => {
          const attributes = stateEvidence.attributes.map((attribute) => `<li>${escapeHtml(attribute)}</li>`).join("");
          const selectors = stateEvidence.selectors.map((selector) => `<li>${escapeHtml(selector)}</li>`).join("");
          return `<li><strong>${escapeHtml(stateEvidence.state)}</strong>: ${escapeHtml(stateEvidence.notes)}<h4>Attributes</h4><ul>${attributes}</ul><h4>Selectors</h4><ul>${selectors}</ul></li>`;
        })
        .join("");
      const standards = (primitive.standards ?? [])
        .map((standard) => {
          const requirements = standard.requirements
            .map((requirement) => `<li>${escapeHtml(requirement)}</li>`)
            .join("");
          return `<li><strong>${escapeHtml(standard.id)}</strong>: <a href="${escapeHtml(standard.sourceUrl)}">${escapeHtml(standard.sourceUrl)}</a><ul>${requirements}</ul></li>`;
        })
        .join("");
      const standardsSection = standards ? `<h3>Standards</h3><ul>${standards}</ul>` : "";
      return `<section class="${primitiveClassName(primitive.name)}"><h2>${escapeHtml(primitive.name)}</h2><p>${escapeHtml(primitive.role)}</p><h3>Required states</h3><ul>${states}</ul><h3>State evidence</h3><ul>${evidence}</ul>${standardsSection}</section>`;
    })
    .join("");

  const buttons = [
    `<button data-sk-primitive="Button" data-sk-state="default" class="${primitiveClassName("Button", "brand", "md")}" type="button">Start review</button>`,
    `<button data-sk-primitive="Button" data-sk-state="hover" class="${primitiveClassName("Button", "neutral", "md")}" type="button">Hover target</button>`,
    `<button data-sk-primitive="Button" data-sk-state="focus-visible" class="${primitiveClassName("Button", "neutral", "md")}" type="button">Keyboard focus target</button>`,
    `<button data-sk-primitive="Button" data-sk-state="pressed" class="${primitiveClassName("Button", "neutral", "md")}" type="button" aria-pressed="true">Show details</button>`,
    `<button data-sk-primitive="Button" data-sk-state="disabled" class="${primitiveClassName("Button", "neutral", "md")}" type="button" aria-describedby="disabled-review-action-reason" disabled>Unavailable action</button><p id="disabled-review-action-reason" data-sk-disabled-reason>Unavailable because source evidence is still missing.</p>`,
    `<button data-sk-primitive="Button" data-sk-state="loading" class="${primitiveClassName("Button", "brand", "md")}" type="button" aria-busy="true" data-loading="true">Syncing evidence</button>`,
  ].join("");

  const badgeTones = ["neutral", "success", "warning", "danger", "info"] as const;
  const badges = badgeTones
    .map((tone) => `<span data-sk-primitive="Badge" data-sk-state="default" class="${primitiveClassName("Badge", tone, "md")}">${titleCase(tone)} status</span>`)
    .join("");

  const fields = [
    `<div data-sk-primitive="Field" data-sk-state="default" class="${primitiveClassName("Field", "neutral", "md")}"><label for="review-period">Review period</label><input id="review-period" name="review-period" value="Synthetic period" aria-describedby="review-period-hint" /><p id="review-period-hint" data-sk-hint>Use the period shown on the synthetic source.</p></div>`,
    `<div data-sk-primitive="Field" data-sk-state="focus-visible" class="${primitiveClassName("Field", "neutral", "md")}"><label for="focus-period">Focus target</label><input id="focus-period" name="focus-period" value="Synthetic focus period" /></div>`,
    `<div data-sk-primitive="Field" data-sk-state="disabled" class="${primitiveClassName("Field", "neutral", "md")}" data-disabled="true"><label for="locked-period">Locked period</label><input id="locked-period" name="locked-period" value="Synthetic locked period" aria-describedby="locked-period-hint" disabled /><p id="locked-period-hint" data-sk-hint>Locked because the source review is closed.</p></div>`,
    `<div data-sk-primitive="Field" data-sk-state="error" class="${primitiveClassName("Field", "danger", "md")}" data-invalid="true"><label for="filing-period">Filing period</label><input id="filing-period" name="filing-period" value="Synthetic period" aria-invalid="true" aria-describedby="filing-period-hint filing-period-error" /><p id="filing-period-hint" data-sk-hint>Use the period shown on the synthetic source.</p><p id="filing-period-error" data-sk-error>Evidence required before this can be marked reviewed.</p></div>`,
  ].join("");

  const cards = [
    `<article data-sk-primitive="Card" data-sk-state="default" class="${primitiveClassName("Card", "neutral", "md")}"><span class="${primitiveClassName("Badge", "neutral", "sm")}">Neutral status</span><h2>Draft review</h2><p>Prepared but not submitted.</p></article>`,
    `<a data-sk-primitive="Card" data-sk-state="focus-visible" class="${primitiveClassName("Card", "warning", "md")}" href="#evidence-required"><span class="${primitiveClassName("Badge", "warning", "sm")}">Warning status</span><h2 id="evidence-required">Evidence required</h2><p>Source proof must be attached before approval.</p></a>`,
  ].join("");

  const patterns = patternSpecs
    .map((pattern) => {
      const slots = pattern.requiredSlots
        .map((slot) => `<li><strong>${escapeHtml(slot.name)}</strong>: ${escapeHtml(slot.purpose)}</li>`)
        .join("");
      const states = pattern.requiredStates
        .map((state) => {
          const stateSlots = state.requiredSlots?.map((slotName) => `<li>${escapeHtml(slotName)}</li>`).join("") ?? "";
          const signals = state.requiredVisibleSignals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join("");
          const programmaticStatus = "programmaticStatus" in state ? state.programmaticStatus : null;
          const status = programmaticStatus
            ? `<h5>Programmatic status</h5><p role="${escapeHtml(programmaticStatus.role)}" aria-live="${escapeHtml(programmaticStatus.ariaLive)}" aria-atomic="${programmaticStatus.ariaAtomic ? "true" : "false"}">${escapeHtml(programmaticStatus.requirement)}</p>`
            : "";
          const checks = state.a11yChecks
            .map((check) => `<li><strong>${escapeHtml(check.id)}</strong> ${escapeHtml(check.criterion)}: ${escapeHtml(check.requirement)} <a href="${escapeHtml(check.sourceUrl)}">${escapeHtml(check.sourceUrl)}</a><p>${escapeHtml(check.manualTest)}</p></li>`)
            .join("");
          return `<li><strong>${escapeHtml(state.name)}</strong>: ${escapeHtml(state.purpose)}<h5>Visible signals</h5><ul>${signals}</ul><h5>Required state slots</h5><ul>${stateSlots}</ul>${status}<h5>Accessibility checks</h5><ul>${checks}</ul></li>`;
        })
        .join("");
      const obligations = pattern.semanticObligations.map((obligation) => `<li>${escapeHtml(obligation)}</li>`).join("");
      return `<section class="sk-pattern-contract" data-pattern="${escapeHtml(pattern.name)}"><h3>${escapeHtml(pattern.name)}</h3><p>${escapeHtml(pattern.purpose)}</p><h4>Required slots</h4><ul>${slots}</ul><h4>Required states</h4><ul>${states}</ul><h4>Semantic obligations</h4><ul>${obligations}</ul></section>`;
    })
    .join("");

  const patternStateExemplars = renderPatternStateExemplars();

  return `<main data-sanchika-gallery="primitive" data-sanchika-example="synthetic"><h1>Sanchika Primitive Gallery</h1><p data-sk-synthetic-disclaimer>All gallery examples are synthetic and must not be treated as taxpayer, portal, filing, or client data.</p><p>${Object.keys(colorTokens).length} color roles loaded.</p><section aria-labelledby="primitive-contracts"><h2 id="primitive-contracts">Primitive contracts</h2>${primitiveContracts}</section><section aria-labelledby="button-states"><h2 id="button-states">Button state matrix</h2>${buttons}</section><section aria-labelledby="badge-tones"><h2 id="badge-tones">Badge tone matrix</h2>${badges}</section><section aria-labelledby="field-states"><h2 id="field-states">Field state matrix</h2>${fields}</section><section aria-labelledby="card-states"><h2 id="card-states">Card state matrix</h2>${cards}</section><section aria-labelledby="pattern-contracts"><h2 id="pattern-contracts">Pattern contracts</h2>${patterns}<h3>Pattern state exemplars</h3>${patternStateExemplars}</section></main>`;
}

export function renderPrimitiveGalleryDocument(): string {
  const cssImports = primitiveGalleryCssImports
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("");

  return `<!doctype html><html lang="en" data-sanchika-gallery-document="primitive"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sanchika Primitive Gallery</title>${cssImports}</head><body>${renderPrimitiveGalleryMarkup()}</body></html>`;
}

function titleCase(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function renderPatternStateExemplars(): string {
  return patternSpecs
    .flatMap((pattern) =>
      pattern.requiredStates.flatMap((state) => {
        const baseId = `${kebabCase(pattern.name)}-${state.name}`;
        const headingId = `${baseId}-heading`;
        const stateSlotNames = new Set([
          ...(state.requiredSlots ?? pattern.requiredSlots.map((slot) => slot.name)),
          ...state.a11yChecks.flatMap((check) => check.slotRefs ?? []),
          ...("programmaticStatus" in state && state.programmaticStatus ? (state.programmaticStatus.slotRefs ?? []) : []),
        ]);
        const slotIds = [...stateSlotNames].map((slotName) => `${baseId}-${kebabCase(slotName)}`);
        const visibleSignals = state.requiredVisibleSignals
          .map((signal) => `<li data-sk-visible-signal>${escapeHtml(signal)}</li>`)
          .join("");
        const slots = [...stateSlotNames]
          .map(
            (slotName, index) =>
              `<p id="${baseId}-${kebabCase(slotName)}" data-sk-slot="${escapeHtml(slotName)}">${escapeHtml(
                statusSlotCopy(pattern.name, state.name, slotName, state.requiredVisibleSignals, index),
              )}</p>`,
          )
          .join("");
        const describedByAttribute = slotIds.length ? ` aria-describedby="${slotIds.join(" ")}"` : "";
        const programmaticStatus = "programmaticStatus" in state && state.programmaticStatus ? state.programmaticStatus : null;
        const liveRegion = programmaticStatus
          ? `<p data-sk-programmatic-status role="${escapeHtml(programmaticStatus.role)}" aria-live="${escapeHtml(programmaticStatus.ariaLive)}" aria-atomic="${programmaticStatus.ariaAtomic ? "true" : "false"}">${escapeHtml(programmaticStatus.requirement)}</p>`
          : "";
        const rootAttributes = [
          `data-sk-pattern="${escapeHtml(pattern.name)}"`,
          `data-sk-state="${escapeHtml(state.name)}"`,
          `aria-labelledby="${headingId}"${describedByAttribute}`,
        ].join(" ");

        return [
          `<article ${rootAttributes}><h3 id="${headingId}">${escapeHtml(pattern.name)} ${escapeHtml(state.name)} state</h3><ul>${visibleSignals}</ul>${slots}${liveRegion}</article>`,
        ];
      }),
    )
    .join("");
}

function statusSlotCopy(
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
    return `${primarySignal}: ${statusPrimaryDetail(patternName, stateName, slotName)}`;
  }

  switch (slotName) {
    case "sourceList":
      return `${secondarySignal}: 1 synthetic source attached; illustrative source summary attached.`;
    case "provenanceTimestamp":
      return `${finalSignal}: Synthetic timestamp for gallery review only.`;
    case "actionSlot":
    case "ctaSlot":
      return `${finalSignal}: Review source evidence before continuing.`;
    case "dataFlow":
      if (patternName === "TrustBoundary" && stateName === "upload-required") {
        return `${secondarySignal}: The consumer must name any upload destination and reason before artifact selection.`;
      }
      if (patternName === "TrustBoundary" && stateName === "local-only") {
        return `${secondarySignal}: The proof artifact stays local until the user exports a generated artifact.`;
      }
      return `${secondarySignal}: The selected artifact leaves the device only after explicit user action.`;
    case "boundarySummary":
      if (patternName === "TrustBoundary" && stateName === "local-only") {
        return `${secondarySignal}: Runs locally with No upload before the user chooses export.`;
      }
      return `${secondarySignal}: The local or upload boundary is stated before the action.`;
    case "sourceVisibility":
      if (patternName === "TrustBoundary") {
        return `${finalSignal}: Users can inspect source, proof artifact, and generated artifact before continuing.`;
      }
      return `${finalSignal}: ${slotName} is visible before the next action.`;
    case "uploadDestination":
      return `${secondarySignal}: Synthetic destination selected by the consuming product, not hardcoded by Sanchika.`;
    case "uploadReason":
      return `${finalSignal}: Synthetic reason for upload is shown before file selection.`;
    case "humanSupport":
      return `${finalSignal}: Human consultation is available before a filing or review action.`;
    default:
      return `${secondarySignal}: ${slotName} is present and referenced by the live region.`;
  }
}

function statusPrimaryDetail(patternName: string, stateName: string, slotName: string): string {
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
    return stateName === "selected" ? "Example advisory review is selected." : "Example advisory review is unavailable.";
  }
  return `${slotName} is present and referenced by the live region.`;
}

function kebabCase(value: string): string {
  return value.replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

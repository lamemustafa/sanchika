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
    `<button data-sk-primitive="Button" data-sk-state="disabled" class="${primitiveClassName("Button", "neutral", "md")}" type="button" disabled>Unavailable action</button>`,
    `<button data-sk-primitive="Button" data-sk-state="loading" class="${primitiveClassName("Button", "brand", "md")}" type="button" aria-busy="true" data-loading="true">Syncing evidence</button>`,
  ].join("");

  const badgeTones = ["neutral", "success", "warning", "danger", "info"] as const;
  const badges = badgeTones
    .map((tone) => `<span data-sk-primitive="Badge" data-sk-state="default" class="${primitiveClassName("Badge", tone, "md")}">${titleCase(tone)} status</span>`)
    .join("");

  const fields = [
    `<div data-sk-primitive="Field" data-sk-state="default" class="${primitiveClassName("Field", "neutral", "md")}"><label for="review-period">Review period</label><input id="review-period" name="review-period" value="Q4 FY26" aria-describedby="review-period-hint" /><p id="review-period-hint" data-sk-hint>Use the period shown on the source notice.</p></div>`,
    `<div data-sk-primitive="Field" data-sk-state="focus-visible" class="${primitiveClassName("Field", "neutral", "md")}"><label for="focus-period">Focus target</label><input id="focus-period" name="focus-period" value="FY26" /></div>`,
    `<div data-sk-primitive="Field" data-sk-state="disabled" class="${primitiveClassName("Field", "neutral", "md")}" data-disabled="true"><label for="locked-period">Locked period</label><input id="locked-period" name="locked-period" value="FY25" aria-describedby="locked-period-hint" disabled /><p id="locked-period-hint" data-sk-hint>Locked because the source review is closed.</p></div>`,
    `<div data-sk-primitive="Field" data-sk-state="error" class="${primitiveClassName("Field", "danger", "md")}" data-invalid="true"><label for="filing-period">Filing period</label><input id="filing-period" name="filing-period" value="Q4 FY26" aria-invalid="true" aria-describedby="filing-period-hint filing-period-error" /><p id="filing-period-hint" data-sk-hint>Use the period shown on the source notice.</p><p id="filing-period-error" data-sk-error>Evidence required before this can be marked reviewed.</p></div>`,
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
            ? `<h5>Programmatic status</h5><p role="${escapeHtml(programmaticStatus.role)}" aria-live="${escapeHtml(programmaticStatus.ariaLive)}">${escapeHtml(programmaticStatus.requirement)}</p>`
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

  const patternStatusExemplars = [
    `<article data-sk-pattern="EvidencePanel" data-sk-state="pending-review" role="status" aria-live="polite" aria-atomic="true" aria-labelledby="evidence-panel-pending-review-state" aria-describedby="evidence-panel-pending-source-list evidence-panel-pending-provenance-timestamp"><h3>Evidence review</h3><p id="evidence-panel-pending-review-state" data-sk-slot="reviewState">Pending review</p><ul id="evidence-panel-pending-source-list" data-sk-slot="sourceList"><li>1 source attached</li><li>GST portal notice summary attached</li></ul><p id="evidence-panel-pending-provenance-timestamp" data-sk-slot="provenanceTimestamp">Last checked 03-07-2026 21:45 IST</p></article>`,
  ].join("");

  return `<main data-sanchika-gallery="primitive"><h1>Sanchika Primitive Gallery</h1><p>${Object.keys(colorTokens).length} color roles loaded.</p><section aria-labelledby="primitive-contracts"><h2 id="primitive-contracts">Primitive contracts</h2>${primitiveContracts}</section><section aria-labelledby="button-states"><h2 id="button-states">Button state matrix</h2>${buttons}</section><section aria-labelledby="badge-tones"><h2 id="badge-tones">Badge tone matrix</h2>${badges}</section><section aria-labelledby="field-states"><h2 id="field-states">Field state matrix</h2>${fields}</section><section aria-labelledby="card-states"><h2 id="card-states">Card state matrix</h2>${cards}</section><section aria-labelledby="pattern-contracts"><h2 id="pattern-contracts">Pattern contracts</h2>${patterns}<h3>Pattern status exemplars</h3>${patternStatusExemplars}</section></main>`;
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

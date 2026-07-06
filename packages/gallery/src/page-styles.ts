export function renderGalleryPageStyles(): string {
  return `<style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--sk-color-bg-base);
      color: var(--sk-color-ink-primary);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-body);
    }
    a { color: inherit; }
    .sk-gallery-page {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: var(--sk-space-6) 0 var(--sk-space-8);
    }
    .sk-gallery-hero {
      display: grid;
      gap: var(--sk-space-6);
      align-items: center;
      min-height: 620px;
      padding: var(--sk-space-6) 0;
    }
    .sk-gallery-eyebrow,
    .sk-gallery-section-kicker {
      display: inline-flex;
      margin: 0 0 var(--sk-space-3);
      border: 1px solid var(--sk-color-border-control);
      border-radius: var(--sk-radius-control);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: var(--sk-color-brand-primary);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-hero h1 {
      max-width: 760px;
      margin: 0;
      font-size: clamp(2.75rem, 7vw, 5.75rem);
      line-height: 0.95;
    }
    .sk-gallery-lede {
      max-width: 720px;
      margin: var(--sk-space-4) 0 0;
      color: var(--sk-color-ink-muted);
      font-size: var(--sk-font-size-lg);
    }
    .sk-gallery-disclaimer {
      max-width: 720px;
      margin: var(--sk-space-4) 0 0;
      border-left: 3px solid var(--sk-color-warning);
      padding-left: var(--sk-space-3);
      color: var(--sk-color-ink-muted);
    }
    .sk-gallery-actions,
    .sk-gallery-control-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sk-space-2);
      margin-top: var(--sk-space-4);
    }
    .sk-gallery-status,
    .sk-gallery-loop,
    .sk-gallery-matrix,
    .sk-gallery-section {
      border: 1px solid var(--sk-color-border-control);
      border-radius: var(--sk-radius-card);
      background: var(--sk-color-bg-surface);
      box-shadow: var(--sk-elevation-card);
    }
    .sk-gallery-status {
      padding: var(--sk-space-4);
    }
    .sk-gallery-status h2,
    .sk-gallery-loop h2,
    .sk-gallery-matrix h2,
    .sk-gallery-section h2 {
      margin: 0;
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-status dl {
      display: grid;
      gap: var(--sk-space-3);
      margin: var(--sk-space-4) 0 0;
    }
    .sk-gallery-status dt {
      color: var(--sk-color-ink-muted);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-status dd {
      margin: var(--sk-space-1) 0 0;
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-loop,
    .sk-gallery-matrix,
    .sk-gallery-section {
      margin-top: var(--sk-space-6);
      padding: var(--sk-space-6);
    }
    .sk-gallery-loop {
      display: grid;
      gap: var(--sk-space-4);
    }
    .sk-gallery-loop p,
    .sk-gallery-matrix p {
      max-width: 720px;
      margin: var(--sk-space-3) 0 0;
      color: var(--sk-color-ink-muted);
    }
    .sk-gallery-loop ol,
    .sk-gallery-matrix-grid {
      display: grid;
      gap: var(--sk-space-3);
      margin: 0;
      padding: 0;
    }
    .sk-gallery-loop li,
    .sk-gallery-matrix-grid article {
      display: grid;
      gap: var(--sk-space-1);
      border: 1px solid var(--sk-color-border-control);
      border-radius: var(--sk-radius-control);
      padding: var(--sk-space-3);
      background: var(--sk-color-bg-base);
    }
    .sk-gallery-loop li {
      grid-template-columns: minmax(120px, 0.35fr) 1fr;
    }
    .sk-gallery-loop span,
    .sk-gallery-matrix-grid span {
      color: var(--sk-color-ink-muted);
    }
    .sk-gallery-matrix-grid {
      margin-top: var(--sk-space-4);
    }
    .sk-gallery-section > section,
    .sk-gallery-section .sk-pattern-contract,
    .sk-gallery-section .sk-gallery-exemplar {
      margin-top: var(--sk-space-4);
      border: 1px solid var(--sk-color-border-control);
      border-radius: var(--sk-radius-control);
      padding: var(--sk-space-4);
      background: var(--sk-color-bg-base);
    }
    .sk-gallery-contract,
    .sk-gallery-exemplar {
      margin-top: var(--sk-space-3);
      border: 1px solid var(--sk-color-border-control);
      border-radius: var(--sk-radius-control);
      background: var(--sk-color-bg-base);
    }
    .sk-gallery-contract summary,
    .sk-gallery-exemplar summary {
      cursor: pointer;
      display: grid;
      gap: var(--sk-space-1);
      padding: var(--sk-space-4);
      list-style-position: inside;
    }
    .sk-gallery-contract summary span,
    .sk-gallery-exemplar summary {
      font-weight: var(--sk-font-weight-bold);
    }
    .sk-gallery-contract summary strong {
      color: var(--sk-color-ink-muted);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-contract-body {
      border-top: 1px solid var(--sk-color-border-control);
      padding: var(--sk-space-4);
    }
    .sk-gallery-section h3,
    .sk-gallery-section h4,
    .sk-gallery-section h5 {
      margin-bottom: var(--sk-space-2);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-section ul {
      padding-left: var(--sk-space-4);
    }
    .sk-gallery-field-grid,
    .sk-gallery-card-grid {
      display: grid;
      gap: var(--sk-space-3);
      margin-top: var(--sk-space-4);
    }
    @media (min-width: 860px) {
      .sk-gallery-hero {
        grid-template-columns: minmax(0, 1fr) minmax(320px, 0.48fr);
      }
      .sk-gallery-loop {
        grid-template-columns: minmax(0, 0.8fr) minmax(360px, 1fr);
      }
      .sk-gallery-matrix-grid,
      .sk-gallery-field-grid,
      .sk-gallery-card-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 640px) {
      .sk-gallery-page {
        width: min(100% - 24px, 1180px);
        padding-top: var(--sk-space-4);
      }
      .sk-gallery-hero {
        min-height: auto;
        padding-top: var(--sk-space-3);
      }
      .sk-gallery-loop li {
        grid-template-columns: 1fr;
      }
      .sk-gallery-section,
      .sk-gallery-loop,
      .sk-gallery-matrix,
      .sk-gallery-status {
        padding: var(--sk-space-4);
      }
    }
  </style>`;
}

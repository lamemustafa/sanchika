export function renderGalleryResponsiveStyles(): string {
  return `
    @media (min-width: 860px) {
      .sk-gallery-hero {
        grid-template-columns: minmax(0, 0.92fr) minmax(420px, 0.68fr);
      }
      .sk-gallery-loop,
      .sk-gallery-matrix,
      .sk-gallery-proof {
        grid-template-columns: minmax(0, 0.75fr) minmax(420px, 1fr);
      }
      .sk-gallery-proof-board {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .sk-gallery-proof-board article:nth-child(odd) {
        border-right: 1px solid oklch(0.96 0.018 85 / 0.14);
      }
      .sk-gallery-proof-board article:nth-last-child(-n + 2) {
        border-bottom: 0;
      }
      .sk-gallery-loop ol,
      .sk-gallery-matrix-grid,
      .sk-gallery-field-grid,
      .sk-gallery-card-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .sk-gallery-loop li:nth-child(odd),
      .sk-gallery-matrix-grid article:nth-child(odd) {
        border-right: 1px solid oklch(0.18 0.024 230 / 0.12);
      }
      .sk-gallery-loop li:nth-last-child(-n + 2),
      .sk-gallery-matrix-grid article:nth-last-child(-n + 2) {
        border-bottom: 0;
      }
    }
    @media (max-width: 640px) {
      .sk-gallery-page {
        width: min(100% - 24px, 1180px);
        padding-top: var(--sk-space-3);
      }
      .sk-gallery-masthead {
        align-items: stretch;
        flex-direction: column;
        gap: var(--sk-space-2);
      }
      .sk-gallery-nav {
        justify-content: flex-start;
      }
      .sk-gallery-nav a {
        flex: 1 1 auto;
        justify-content: center;
      }
      .sk-gallery-hero {
        min-height: auto;
        gap: var(--sk-space-4);
        padding: var(--sk-space-3);
      }
      .sk-gallery-hero h1 {
        font-size: clamp(2rem, 10.5vw, 2.75rem);
        line-height: 1;
      }
      .sk-gallery-eyebrow {
        margin-bottom: var(--sk-space-3);
        font-size: var(--sk-font-size-sm);
      }
      .sk-gallery-lede {
        margin-top: var(--sk-space-3);
        font-size: var(--sk-font-size-md);
        line-height: 1.5;
      }
      .sk-gallery-actions,
      .sk-gallery-control-row {
        margin-top: var(--sk-space-3);
      }
      .sk-gallery-proof-strip {
        display: grid;
        grid-template-columns: 1fr;
        margin-top: var(--sk-space-3);
      }
      .sk-gallery-proof-strip div {
        border-right: 0;
        border-bottom: 1px solid oklch(0.16 0.018 230 / 0.12);
        padding: var(--sk-space-3);
      }
      .sk-gallery-proof-strip div:last-child {
        border-bottom: 0;
      }
      .sk-gallery-proof-strip dt,
      .sk-gallery-proof-strip dd {
        font-size: var(--sk-font-size-sm);
      }
      .sk-gallery-workbench {
        margin-top: 0;
      }
      .sk-gallery-workbench-bar,
      .sk-gallery-claim,
      .sk-gallery-disclaimer {
        padding: var(--sk-space-3);
      }
      .sk-gallery-evidence-rail,
      .sk-gallery-current-evidence {
        grid-template-columns: 1fr;
      }
      .sk-gallery-evidence-rail span,
      .sk-gallery-current-evidence div,
      .sk-gallery-current-evidence div:nth-child(2n) {
        min-height: auto;
        border-right: 0;
        border-bottom: 1px solid oklch(1 0 0 / 0.1);
      }
      .sk-gallery-evidence-rail span:last-child,
      .sk-gallery-current-evidence div:last-child {
        border-bottom: 0;
      }
      .sk-gallery-current-evidence div:nth-last-child(2) {
        border-bottom: 1px solid oklch(1 0 0 / 0.1);
      }
      .sk-gallery-claim strong {
        font-size: 1.12rem;
      }
      .sk-gallery-disclaimer {
        padding: var(--sk-space-3);
      }
      .sk-gallery-section,
      .sk-gallery-loop,
      .sk-gallery-matrix,
      .sk-gallery-proof {
        padding-top: var(--sk-space-5);
      }
      .sk-gallery-proof-board article {
        min-height: auto;
        padding: var(--sk-space-3);
      }
      .sk-gallery-contract-body,
      .sk-gallery-contract summary,
      .sk-gallery-exemplar summary {
        padding: var(--sk-space-3);
      }
    }
  `;
}

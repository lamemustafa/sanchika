export function renderGalleryResponsiveStyles(): string {
  return `
    @media (min-width: 860px) {
      .sk-gallery-hero {
        grid-template-columns: minmax(0, 0.98fr) minmax(390px, 0.62fr);
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
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-top: var(--sk-space-3);
      }
      .sk-gallery-proof-strip li {
        flex-basis: auto;
        padding: var(--sk-space-2);
      }
      .sk-gallery-proof-strip span {
        font-size: 0.68rem;
      }
      .sk-gallery-proof-strip strong {
        font-size: 0.72rem;
      }
      .sk-gallery-workbench {
        margin-top: 0;
      }
      .sk-gallery-workbench-bar,
      .sk-gallery-claim,
      .sk-gallery-disclaimer {
        padding: var(--sk-space-3);
      }
      .sk-gallery-status-grid {
        display: none;
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

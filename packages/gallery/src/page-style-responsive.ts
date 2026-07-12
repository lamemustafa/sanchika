export function renderGalleryResponsiveStyles(): string {
  return `
    @media (min-width: 860px) {
      .sk-gallery-hero {
        grid-template-columns: minmax(0, 0.92fr) minmax(420px, 0.68fr);
      }
      .sk-gallery-loop,
      .sk-gallery-matrix,
      .sk-gallery-family,
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
      .sk-gallery-family-board,
      .sk-gallery-field-grid,
      .sk-gallery-card-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .sk-gallery-loop li:nth-child(odd),
      .sk-gallery-matrix-grid article:nth-child(odd),
      .sk-gallery-family-board article:nth-child(odd) {
        border-right: 1px solid oklch(0.18 0.024 230 / 0.12);
      }
      .sk-gallery-loop li:nth-last-child(-n + 2),
      .sk-gallery-matrix-grid article:nth-last-child(-n + 2),
      .sk-gallery-family-board article:nth-last-child(-n + 2) {
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
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        justify-content: stretch;
        width: 100%;
      }
      .sk-gallery-nav a {
        justify-content: center;
        min-width: 0;
        text-align: center;
      }
      .sk-gallery-hero {
        min-height: auto;
        gap: var(--sk-space-4);
        padding: var(--sk-space-3);
      }
      .sk-gallery-hero-copy,
      .sk-gallery-workbench {
        min-width: 0;
      }
      .sk-gallery-hero h1 {
        font-size: clamp(1.85rem, 8.5vw, 2.18rem);
        line-height: 1.02;
        overflow-wrap: normal;
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
      .sk-gallery-actions > * {
        flex: 1 1 100%;
        justify-content: center;
        min-width: 0;
      }
      .sk-gallery-proof-lattice {
        grid-template-columns: 1fr;
        margin-top: var(--sk-space-3);
      }
      .sk-gallery-proof-lattice div {
        border-right: 0;
        border-bottom: 1px solid oklch(0.16 0.018 230 / 0.12);
        padding: var(--sk-space-3);
      }
      .sk-gallery-proof-lattice div:last-child {
        border-bottom: 0;
      }
      .sk-gallery-workbench-bar span {
        max-width: 100%;
        text-align: center;
        white-space: normal;
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
      .sk-gallery-workbench-bar {
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .sk-gallery-workbench-bar p {
        min-width: 0;
      }
      .sk-gallery-evidence-rail,
      .sk-gallery-current-evidence,
      .sk-gallery-workbench-map {
        grid-template-columns: 1fr;
      }
      .sk-gallery-evidence-rail span,
      .sk-gallery-current-evidence div,
      .sk-gallery-current-evidence div:nth-child(2n),
      .sk-gallery-workbench-map div,
      .sk-gallery-workbench-map div:nth-child(2n) {
        min-height: auto;
        border-right: 0;
        border-bottom: 1px solid oklch(1 0 0 / 0.1);
      }
      .sk-gallery-evidence-rail span:last-child,
      .sk-gallery-current-evidence div:last-child,
      .sk-gallery-workbench-map div:last-child {
        border-bottom: 0;
      }
      .sk-gallery-current-evidence div:nth-last-child(2),
      .sk-gallery-workbench-map div:nth-last-child(2) {
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
      .sk-gallery-family,
      .sk-gallery-proof {
        padding-top: var(--sk-space-6);
      }
      .sk-gallery-proof-board article {
        min-height: auto;
        padding: var(--sk-space-3);
      }
      .sk-gallery-family-board article {
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

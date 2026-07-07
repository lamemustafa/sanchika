export function renderGalleryResponsiveStyles(): string {
  return `
    @media (min-width: 860px) {
      .sk-gallery-hero {
        grid-template-columns: minmax(0, 0.92fr) minmax(420px, 0.7fr);
      }
      .sk-gallery-loop,
      .sk-gallery-matrix {
        grid-template-columns: minmax(0, 0.75fr) minmax(420px, 1fr);
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
        padding: var(--sk-space-4);
      }
      .sk-gallery-hero h1 {
        font-size: clamp(2.2rem, 12vw, 3rem);
      }
      .sk-gallery-workbench {
        margin-top: var(--sk-space-4);
      }
      .sk-gallery-status-grid {
        display: none;
      }
      .sk-gallery-claim strong {
        font-size: 1.25rem;
      }
      .sk-gallery-disclaimer {
        padding: var(--sk-space-3);
      }
      .sk-gallery-section,
      .sk-gallery-loop,
      .sk-gallery-matrix {
        padding-top: var(--sk-space-5);
      }
      .sk-gallery-contract-body,
      .sk-gallery-contract summary,
      .sk-gallery-exemplar summary {
        padding: var(--sk-space-3);
      }
    }
  `;
}

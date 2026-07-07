export function renderGallerySectionStyles(): string {
  return `
    .sk-gallery-loop,
    .sk-gallery-matrix,
    .sk-gallery-section {
      margin-top: var(--sk-space-6);
    }
    .sk-gallery-loop,
    .sk-gallery-matrix {
      display: grid;
      gap: var(--sk-space-5);
      border-top: 1px solid oklch(0.18 0.024 230 / 0.2);
      padding-top: var(--sk-space-6);
    }
    .sk-gallery-loop h2,
    .sk-gallery-matrix h2,
    .sk-gallery-section h2 {
      margin: 0;
      color: oklch(0.18 0.024 230);
      font-size: clamp(1.8rem, 4vw, 3.1rem);
      line-height: 1.04;
      letter-spacing: -0.026em;
      text-wrap: balance;
    }
    .sk-gallery-loop p,
    .sk-gallery-matrix p {
      max-width: 720px;
      margin: var(--sk-space-3) 0 0;
      color: oklch(0.38 0.022 230);
      line-height: 1.65;
    }
    .sk-gallery-loop ol,
    .sk-gallery-matrix-grid {
      display: grid;
      gap: 0;
      overflow: hidden;
      margin: 0;
      border: 1px solid oklch(0.18 0.024 230 / 0.16);
      border-radius: 14px;
      padding: 0;
      background: white;
    }
    .sk-gallery-loop li,
    .sk-gallery-matrix-grid article {
      display: grid;
      gap: var(--sk-space-2);
      min-height: 150px;
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.12);
      padding: var(--sk-space-4);
    }
    .sk-gallery-loop li:last-child,
    .sk-gallery-matrix-grid article:last-child {
      border-bottom: 0;
    }
    .sk-gallery-loop strong,
    .sk-gallery-matrix-grid strong {
      color: oklch(0.18 0.024 230);
      font-size: var(--sk-font-size-lg);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-loop span,
    .sk-gallery-matrix-grid span {
      color: oklch(0.44 0.025 230);
    }
    .sk-gallery-section {
      border-top: 1px solid oklch(0.18 0.024 230 / 0.2);
      padding-top: var(--sk-space-6);
    }
    .sk-gallery-section > h2 {
      max-width: 760px;
    }
  `;
}

export function renderGalleryContractStyles(): string {
  return `
    .sk-gallery-section .sk-pattern-contract,
    .sk-gallery-section .sk-gallery-exemplar,
    .sk-gallery-contract {
      overflow: hidden;
      margin-top: var(--sk-space-3);
      border: 1px solid oklch(0.18 0.024 230 / 0.16);
      border-radius: 14px;
      background: white;
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
      color: oklch(0.43 0.025 230);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-contract-body {
      border-top: 1px solid oklch(0.18 0.024 230 / 0.12);
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
  `;
}

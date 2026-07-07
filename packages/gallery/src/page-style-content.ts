export function renderGallerySectionStyles(): string {
  return `
    .sk-gallery-loop,
    .sk-gallery-matrix,
    .sk-gallery-proof,
    .sk-gallery-section {
      margin-top: clamp(3rem, 7vw, 5.5rem);
    }
    .sk-gallery-loop,
    .sk-gallery-matrix,
    .sk-gallery-proof {
      display: grid;
      gap: clamp(1.75rem, 4vw, 3.5rem);
      border-top: 1px solid oklch(0.18 0.024 230 / 0.18);
      padding-top: clamp(2.75rem, 6vw, 4.75rem);
    }
    .sk-gallery-kicker {
      display: inline-flex;
      margin: 0 0 var(--sk-space-3);
      border: 1px solid oklch(0.34 0.067 165 / 0.25);
      border-radius: var(--sk-radius-control);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: oklch(0.31 0.066 165);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-loop h2,
    .sk-gallery-matrix h2,
    .sk-gallery-proof h2,
    .sk-gallery-section h2 {
      margin: 0;
      color: oklch(0.18 0.024 230);
      font-size: clamp(1.9rem, 4vw, 3.25rem);
      line-height: 1.04;
      letter-spacing: -0.026em;
      text-wrap: balance;
    }
    .sk-gallery-loop p,
    .sk-gallery-matrix p,
    .sk-gallery-proof-copy p {
      max-width: 720px;
      margin: var(--sk-space-3) 0 0;
      color: oklch(0.38 0.022 230);
      line-height: 1.65;
    }
    .sk-gallery-proof-board {
      display: grid;
      overflow: hidden;
      border: 1px solid oklch(0.18 0.024 230 / 0.22);
      border-radius: 10px;
      background:
        linear-gradient(115deg, oklch(0.12 0.028 185), oklch(0.14 0.032 225) 62%, oklch(0.24 0.065 32));
      color: oklch(0.98 0.012 85);
    }
    .sk-gallery-proof-board article {
      min-height: 210px;
      border-bottom: 1px solid oklch(0.96 0.018 170 / 0.14);
      padding: clamp(1.25rem, 3vw, 2rem);
    }
    .sk-gallery-proof-board article:last-child {
      border-bottom: 0;
    }
    .sk-gallery-proof-board span {
      display: inline-flex;
      border-radius: var(--sk-radius-control);
      background: oklch(0.91 0.08 82 / 0.12);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: oklch(0.91 0.08 82);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-proof-board strong {
      display: block;
      margin-top: var(--sk-space-3);
      max-width: 23rem;
      color: white;
      font-size: clamp(1.35rem, 3vw, 2rem);
      line-height: 1.08;
      letter-spacing: -0.02em;
    }
    .sk-gallery-proof-board p {
      max-width: 31rem;
      margin: var(--sk-space-3) 0 0;
      color: oklch(0.84 0.025 165);
      line-height: 1.6;
    }
    .sk-gallery-loop ol,
    .sk-gallery-matrix-grid {
      display: grid;
      gap: 0;
      overflow: hidden;
      margin: 0;
      border: 1px solid oklch(0.18 0.024 230 / 0.16);
      border-radius: 10px;
      padding: 0;
      background: oklch(0.985 0.006 170);
    }
    .sk-gallery-loop li,
    .sk-gallery-matrix-grid article {
      display: grid;
      gap: var(--sk-space-2);
      min-height: 150px;
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.12);
      padding: var(--sk-space-4);
      background: oklch(0.995 0.003 170);
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
      padding-top: clamp(2.75rem, 6vw, 4.75rem);
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
      border-radius: 10px;
      background: oklch(0.995 0.003 170);
    }
    .sk-gallery-contract summary,
    .sk-gallery-exemplar summary {
      cursor: pointer;
      display: grid;
      gap: var(--sk-space-1);
      padding: var(--sk-space-4);
      background: oklch(0.975 0.008 170);
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
      background: white;
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

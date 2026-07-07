export function renderGallerySectionStyles(): string {
  return `
    .sk-gallery-loop,
    .sk-gallery-matrix,
    .sk-gallery-family,
    .sk-gallery-proof,
    .sk-gallery-section {
      margin-top: clamp(3rem, 7vw, 5.75rem);
    }
    .sk-gallery-loop,
    .sk-gallery-matrix,
    .sk-gallery-family,
    .sk-gallery-proof {
      display: grid;
      gap: clamp(1.75rem, 4vw, 3.5rem);
      border-top: 1px solid oklch(0.16 0.018 230 / 0.18);
      padding-top: clamp(2.75rem, 6vw, 4.85rem);
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
    .sk-gallery-family h2,
    .sk-gallery-proof h2,
    .sk-gallery-section h2 {
      margin: 0;
      color: oklch(0.145 0.018 230);
      font-size: clamp(1.9rem, 4vw, 3.25rem);
      line-height: 1.04;
      letter-spacing: -0.026em;
      text-wrap: balance;
    }
    .sk-gallery-loop p,
    .sk-gallery-matrix p,
    .sk-gallery-family-copy p,
    .sk-gallery-proof-copy p {
      max-width: 720px;
      margin: var(--sk-space-3) 0 0;
      color: oklch(0.34 0.022 230);
      line-height: 1.65;
    }
    .sk-gallery-family-board {
      display: grid;
      overflow: hidden;
      border: 1px solid oklch(0.16 0.018 230 / 0.18);
      border-radius: 14px;
      background: oklch(0.97 0.012 185);
    }
    .sk-gallery-family-board article {
      display: grid;
      gap: var(--sk-space-2);
      min-height: 190px;
      border-bottom: 1px solid oklch(0.16 0.018 230 / 0.12);
      padding: var(--sk-space-4);
      background:
        linear-gradient(180deg, oklch(1 0 0 / 0.9), oklch(0.965 0.012 185 / 0.9)),
        oklch(1 0 0);
    }
    .sk-gallery-family-board article:last-child {
      border-bottom: 0;
    }
    .sk-gallery-family-board span {
      width: fit-content;
      border: 1px solid oklch(0.22 0.07 175 / 0.2);
      border-radius: var(--sk-radius-control);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: oklch(0.23 0.07 175);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-family-board strong {
      color: oklch(0.145 0.018 230);
      font-size: clamp(1.45rem, 3vw, 2.15rem);
      line-height: 1.02;
      letter-spacing: -0.02em;
    }
    .sk-gallery-family-board p {
      margin: 0;
      color: oklch(0.3 0.026 230);
      font-weight: var(--sk-font-weight-bold);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-family-board small {
      color: oklch(0.38 0.024 230);
      font-size: var(--sk-font-size-sm);
      line-height: 1.55;
    }
    .sk-gallery-family-board a {
      align-self: end;
      width: fit-content;
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      border: 1px solid oklch(0.16 0.018 230 / 0.16);
      border-radius: 8px;
      background: oklch(1 0 0);
      padding: 0 var(--sk-space-2);
      color: oklch(0.23 0.07 175);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
      text-decoration: none;
    }
    .sk-gallery-family-board a:hover {
      border-color: oklch(0.22 0.07 175);
      background: oklch(0.94 0.018 185);
    }
    .sk-gallery-family-board a:focus-visible {
      outline: 2px solid oklch(0.67 0.14 75);
      outline-offset: 3px;
    }
    .sk-gallery-proof-board {
      display: grid;
      overflow: hidden;
      border: 1px solid oklch(0.16 0.018 230 / 0.22);
      border-radius: 14px;
      background: oklch(0.155 0.018 230);
      color: oklch(0.98 0.012 85);
    }
    .sk-gallery-proof-board article {
      min-height: 210px;
      border-bottom: 1px solid oklch(1 0 0 / 0.12);
      padding: clamp(1.25rem, 3vw, 2rem);
    }
    .sk-gallery-proof-board article:last-child {
      border-bottom: 0;
    }
    .sk-gallery-proof-board span {
      display: inline-flex;
      border-radius: var(--sk-radius-control);
      background: oklch(0.91 0.12 86 / 0.14);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: oklch(0.91 0.12 86);
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
      color: oklch(0.82 0.015 220);
      line-height: 1.6;
    }
    .sk-gallery-loop ol,
    .sk-gallery-matrix-grid {
      display: grid;
      gap: 0;
      overflow: hidden;
      margin: 0;
      border: 1px solid oklch(0.16 0.018 230 / 0.16);
      border-radius: 14px;
      padding: 0;
      background: oklch(1 0 0);
    }
    .sk-gallery-loop li,
    .sk-gallery-matrix-grid article {
      display: grid;
      gap: var(--sk-space-2);
      min-height: 150px;
      border-bottom: 1px solid oklch(0.16 0.018 230 / 0.12);
      padding: var(--sk-space-4);
      background: oklch(1 0 0);
    }
    .sk-gallery-loop li:last-child,
    .sk-gallery-matrix-grid article:last-child {
      border-bottom: 0;
    }
    .sk-gallery-loop strong,
    .sk-gallery-matrix-grid strong {
      color: oklch(0.145 0.018 230);
      font-size: var(--sk-font-size-lg);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-loop span,
    .sk-gallery-matrix-grid span {
      color: oklch(0.44 0.025 230);
    }
    .sk-gallery-section {
      border-top: 1px solid oklch(0.16 0.018 230 / 0.2);
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
      border: 1px solid oklch(0.16 0.018 230 / 0.16);
      border-radius: 12px;
      background: oklch(1 0 0);
    }
    .sk-gallery-contract summary,
    .sk-gallery-exemplar summary {
      cursor: pointer;
      display: grid;
      gap: var(--sk-space-1);
      padding: var(--sk-space-4);
      background: oklch(0.96 0.008 185);
      list-style-position: inside;
    }
    .sk-gallery-contract summary span,
    .sk-gallery-exemplar summary {
      font-weight: var(--sk-font-weight-bold);
    }
    .sk-gallery-contract summary strong {
      color: oklch(0.34 0.025 230);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-contract-body {
      border-top: 1px solid oklch(0.16 0.018 230 / 0.12);
      padding: var(--sk-space-4);
      background: oklch(1 0 0);
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

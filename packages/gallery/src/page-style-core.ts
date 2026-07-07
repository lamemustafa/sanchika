export function renderGalleryBaseStyles(): string {
  return `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: oklch(0.94 0.021 85);
      color: oklch(0.18 0.024 230);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-body);
    }
    a { color: inherit; }
    .sk-gallery-page {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: var(--sk-space-4) 0 var(--sk-space-8);
    }
  `;
}

export function renderGalleryHeroStyles(): string {
  return `
    .sk-gallery-hero {
      position: relative;
      display: grid;
      gap: var(--sk-space-5);
      overflow: hidden;
      min-height: 690px;
      border-radius: 18px;
      padding: clamp(1.25rem, 4vw, 3rem);
      background:
        linear-gradient(90deg, oklch(0.83 0.16 82 / 0.16) 1px, transparent 1px),
        linear-gradient(0deg, oklch(0.83 0.16 82 / 0.11) 1px, transparent 1px),
        linear-gradient(135deg, oklch(0.17 0.034 170), oklch(0.15 0.038 230) 54%, oklch(0.22 0.055 20));
      background-size: 42px 42px, 42px 42px, auto;
      color: oklch(0.98 0.012 85);
    }
    .sk-gallery-hero::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 180px;
      background: linear-gradient(to top, oklch(0.17 0.034 170), transparent);
      pointer-events: none;
    }
    .sk-gallery-hero-copy {
      position: relative;
      z-index: 1;
      align-self: center;
    }
    .sk-gallery-eyebrow {
      display: inline-flex;
      margin: 0 0 var(--sk-space-4);
      border: 1px solid oklch(0.83 0.16 82 / 0.38);
      border-radius: var(--sk-radius-control);
      padding: var(--sk-space-1) var(--sk-space-2);
      background: oklch(0.83 0.16 82 / 0.12);
      color: oklch(0.91 0.11 82);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-hero h1 {
      max-width: 790px;
      margin: 0;
      color: oklch(0.99 0.004 85);
      font-size: clamp(3rem, 7.2vw, 5.85rem);
      line-height: 0.98;
      letter-spacing: -0.028em;
      text-wrap: balance;
    }
    .sk-gallery-lede {
      max-width: 720px;
      margin: var(--sk-space-4) 0 0;
      color: oklch(0.86 0.025 165);
      font-size: var(--sk-font-size-lg);
      line-height: 1.65;
      text-wrap: pretty;
    }
    .sk-gallery-actions,
    .sk-gallery-control-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sk-space-2);
      margin-top: var(--sk-space-4);
    }
    .sk-gallery-hero .sk-button.sk-tone-neutral {
      background: oklch(0.98 0.012 85);
      border-color: oklch(0.86 0.025 85);
      color: oklch(0.18 0.024 230);
    }
    .sk-gallery-hero .sk-button.sk-tone-neutral:hover {
      background: oklch(0.91 0.035 85);
      border-color: oklch(0.83 0.16 82);
      color: oklch(0.18 0.024 230);
    }
  `;
}

export function renderGalleryWorkbenchStyles(): string {
  return `
    .sk-gallery-workbench {
      position: relative;
      z-index: 1;
      align-self: center;
      overflow: hidden;
      border: 1px solid oklch(0.22 0.024 230 / 0.15);
      border-radius: 14px;
      background: oklch(0.96 0.022 85);
      color: oklch(0.18 0.024 230);
    }
    .sk-gallery-workbench-bar,
    .sk-gallery-claim,
    .sk-gallery-disclaimer {
      padding: var(--sk-space-4);
    }
    .sk-gallery-workbench-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sk-space-3);
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.12);
    }
    .sk-gallery-workbench-bar h2 {
      margin: 0;
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-workbench-bar span {
      border-radius: var(--sk-radius-control);
      background: oklch(0.34 0.067 165);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: white;
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-claim {
      display: grid;
      gap: var(--sk-space-2);
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.12);
    }
    .sk-gallery-claim span,
    .sk-gallery-status-grid dt {
      color: oklch(0.43 0.025 230);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-claim strong {
      max-width: 520px;
      font-size: clamp(1.35rem, 3vw, 2rem);
      line-height: 1.08;
      letter-spacing: -0.02em;
    }
    .sk-gallery-status-grid {
      display: grid;
      margin: 0;
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.12);
    }
    .sk-gallery-status-grid div {
      min-height: 118px;
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.12);
      padding: var(--sk-space-4);
    }
    .sk-gallery-status-grid div:last-child {
      border-bottom: 0;
    }
    .sk-gallery-status-grid dd {
      margin: var(--sk-space-2) 0 0;
      font-weight: var(--sk-font-weight-bold);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-disclaimer {
      margin: 0;
      background: oklch(0.53 0.13 36);
      color: oklch(0.96 0.018 65);
      font-weight: var(--sk-font-weight-semibold);
    }
  `;
}

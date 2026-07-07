export function renderGalleryBaseStyles(): string {
  return `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background:
        linear-gradient(180deg, oklch(0.965 0.008 170), oklch(0.925 0.014 185) 48%, oklch(0.955 0.006 220));
      color: oklch(0.18 0.024 230);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-body);
    }
    a { color: inherit; }
    .sk-gallery-page {
      width: min(1220px, calc(100% - 32px));
      margin: 0 auto;
      padding: clamp(1rem, 2.5vw, 1.75rem) 0 var(--sk-space-8);
    }
  `;
}

export function renderGalleryHeroStyles(): string {
  return `
    .sk-gallery-hero {
      position: relative;
      display: grid;
      gap: clamp(2rem, 4vw, 4rem);
      overflow: hidden;
      min-height: min(760px, calc(100vh - 2rem));
      border: 1px solid oklch(0.96 0.018 170 / 0.2);
      border-radius: 10px;
      padding: clamp(1.5rem, 5vw, 4.25rem);
      background:
        linear-gradient(90deg, oklch(0.96 0.018 170 / 0.11) 1px, transparent 1px),
        linear-gradient(0deg, oklch(0.96 0.018 170 / 0.08) 1px, transparent 1px),
        linear-gradient(132deg, oklch(0.13 0.03 185), oklch(0.15 0.034 225) 52%, oklch(0.23 0.07 28));
      background-size: 56px 56px, 56px 56px, auto;
      color: oklch(0.985 0.008 170);
    }
    .sk-gallery-hero::after {
      content: "";
      position: absolute;
      inset: auto 0 0 0;
      height: 34%;
      background: linear-gradient(to top, oklch(0.13 0.03 185), transparent);
      pointer-events: none;
    }
    .sk-gallery-hero-copy {
      position: relative;
      z-index: 1;
      align-self: center;
    }
    .sk-gallery-eyebrow {
      display: inline-flex;
      max-width: 38rem;
      margin: 0 0 var(--sk-space-4);
      border-bottom: 1px solid oklch(0.91 0.08 82 / 0.52);
      padding: 0 0 var(--sk-space-2);
      color: oklch(0.91 0.08 82);
      font-size: var(--sk-font-size-md);
      font-weight: var(--sk-font-weight-semibold);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-hero h1 {
      max-width: 850px;
      margin: 0;
      color: oklch(0.995 0.004 170);
      font-size: clamp(3.1rem, 7.4vw, 5.9rem);
      line-height: 0.96;
      letter-spacing: -0.03em;
      text-wrap: balance;
    }
    .sk-gallery-lede {
      max-width: 720px;
      margin: var(--sk-space-4) 0 0;
      color: oklch(0.86 0.025 175);
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
    .sk-gallery-proof-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 1px;
      overflow: hidden;
      max-width: 720px;
      margin: var(--sk-space-5) 0 0;
      border: 1px solid oklch(0.96 0.018 170 / 0.18);
      border-radius: 8px;
      padding: 0;
      list-style: none;
      background: oklch(0.96 0.018 170 / 0.13);
    }
    .sk-gallery-proof-strip li {
      flex: 1 1 160px;
      min-width: 0;
      padding: var(--sk-space-3);
      background: oklch(0.13 0.028 185 / 0.64);
    }
    .sk-gallery-proof-strip span {
      display: block;
      color: oklch(0.91 0.08 82);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-proof-strip strong {
      display: block;
      margin-top: var(--sk-space-1);
      color: oklch(0.98 0.006 170);
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-tight);
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
      border: 1px solid oklch(0.94 0.018 170 / 0.72);
      border-radius: 10px;
      background: oklch(0.965 0.012 170);
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
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.14);
      background: oklch(0.92 0.02 178);
    }
    .sk-gallery-workbench-bar h2 {
      margin: 0;
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-workbench-bar span {
      border-radius: var(--sk-radius-control);
      background: oklch(0.24 0.056 178);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: white;
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-claim {
      display: grid;
      gap: var(--sk-space-2);
      border-bottom: 1px solid oklch(0.18 0.024 230 / 0.12);
      background: white;
    }
    .sk-gallery-claim span,
    .sk-gallery-status-grid dt {
      color: oklch(0.37 0.035 178);
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
      background: oklch(0.985 0.006 170);
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
      background: oklch(0.45 0.12 36);
      color: oklch(0.98 0.012 65);
      font-weight: var(--sk-font-weight-semibold);
    }
  `;
}

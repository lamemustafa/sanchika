export function renderGalleryBaseStyles(): string {
  return `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: oklch(0.982 0 0);
      color: oklch(0.16 0.018 230);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-body);
    }
    a { color: inherit; }
    .sk-gallery-page {
      width: min(1280px, calc(100% - 32px));
      margin: 0 auto;
      padding: clamp(0.875rem, 2vw, 1.25rem) 0 var(--sk-space-8);
    }
    .sk-gallery-masthead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sk-space-4);
      margin-bottom: var(--sk-space-3);
      border: 1px solid oklch(0.16 0.018 230 / 0.14);
      border-radius: 12px;
      background: oklch(1 0 0);
      padding: var(--sk-space-2);
    }
    .sk-gallery-wordmark {
      display: inline-flex;
      min-height: 44px;
      align-items: center;
      gap: var(--sk-space-2);
      border-radius: 9px;
      padding: 0 var(--sk-space-2);
      text-decoration: none;
    }
    .sk-gallery-wordmark:focus-visible,
    .sk-gallery-nav a:focus-visible {
      outline: 2px solid oklch(0.67 0.14 75);
      outline-offset: 3px;
    }
    .sk-gallery-mark {
      display: inline-flex;
      width: 36px;
      height: 36px;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      background: oklch(0.16 0.018 230);
      color: oklch(0.91 0.12 86);
      font-weight: 800;
      line-height: 1;
    }
    .sk-gallery-wordmark strong,
    .sk-gallery-wordmark small {
      display: block;
      line-height: 1.1;
    }
    .sk-gallery-wordmark strong {
      font-size: var(--sk-font-size-md);
      letter-spacing: -0.01em;
    }
    .sk-gallery-wordmark small {
      margin-top: 0.18rem;
      color: oklch(0.42 0.025 230);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-nav {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 2px;
    }
    .sk-gallery-nav a {
      display: inline-flex;
      min-height: 40px;
      align-items: center;
      border-radius: 8px;
      padding: 0 var(--sk-space-2);
      color: oklch(0.31 0.026 230);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
      text-decoration: none;
    }
    .sk-gallery-nav a:hover {
      background: oklch(0.93 0.014 185);
      color: oklch(0.22 0.07 175);
    }
  `;
}

export function renderGalleryHeroStyles(): string {
  return `
    .sk-gallery-hero {
      position: relative;
      display: grid;
      gap: clamp(1.5rem, 4vw, 4.5rem);
      overflow: hidden;
      min-height: min(780px, calc(100vh - 5rem));
      border: 1px solid oklch(0.16 0.018 230 / 0.18);
      border-radius: 14px;
      padding: clamp(1.35rem, 5vw, 4.5rem);
      background:
        linear-gradient(90deg, oklch(0.88 0.018 195 / 0.22) 1px, transparent 1px),
        linear-gradient(0deg, oklch(0.88 0.018 195 / 0.16) 1px, transparent 1px),
        linear-gradient(124deg, oklch(0.99 0 0), oklch(0.955 0.012 185) 50%, oklch(0.925 0.035 78));
      background-size: 44px 44px, 44px 44px, auto;
      color: oklch(0.16 0.018 230);
    }
    .sk-gallery-hero::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 78% 16%, oklch(0.66 0.14 42 / 0.18), transparent 26%),
        linear-gradient(90deg, transparent 0 61%, oklch(0.16 0.018 230 / 0.06) 61% 61.3%, transparent 61.3%);
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
      border: 1px solid oklch(0.22 0.07 175 / 0.24);
      border-radius: var(--sk-radius-control);
      background: oklch(0.98 0.01 175);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: oklch(0.23 0.07 175);
      font-size: var(--sk-font-size-md);
      font-weight: var(--sk-font-weight-semibold);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-hero h1 {
      max-width: 900px;
      margin: 0;
      color: oklch(0.145 0.018 230);
      font-size: clamp(3rem, 7.2vw, 5.8rem);
      line-height: 0.98;
      letter-spacing: -0.03em;
      text-wrap: balance;
    }
    .sk-gallery-lede {
      max-width: 720px;
      margin: var(--sk-space-4) 0 0;
      color: oklch(0.3 0.026 230);
      font-size: var(--sk-font-size-lg);
      line-height: 1.68;
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
      background: oklch(1 0 0);
      border-color: oklch(0.16 0.018 230 / 0.2);
      color: oklch(0.16 0.018 230);
    }
    .sk-gallery-hero .sk-button.sk-tone-brand {
      background: oklch(0.24 0.065 245);
      border-color: oklch(0.24 0.065 245);
      color: oklch(0.98 0 0);
    }
    .sk-gallery-hero .sk-button.sk-tone-brand:hover {
      background: oklch(0.19 0.055 245);
      border-color: oklch(0.19 0.055 245);
      color: oklch(1 0 0);
    }
    .sk-gallery-hero .sk-button.sk-tone-neutral:hover {
      background: oklch(0.94 0.018 185);
      border-color: oklch(0.22 0.07 175);
      color: oklch(0.16 0.018 230);
    }
    .sk-gallery-proof-strip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0;
      overflow: hidden;
      max-width: 780px;
      margin: var(--sk-space-5) 0 0;
      border: 1px solid oklch(0.16 0.018 230 / 0.18);
      border-radius: 10px;
      padding: 0;
      background: oklch(1 0 0 / 0.74);
    }
    .sk-gallery-proof-strip div {
      min-width: 0;
      border-right: 1px solid oklch(0.16 0.018 230 / 0.12);
      padding: var(--sk-space-3);
    }
    .sk-gallery-proof-strip div:last-child {
      border-right: 0;
    }
    .sk-gallery-proof-strip dt {
      display: block;
      color: oklch(0.23 0.07 175);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-proof-strip dd {
      display: block;
      margin: var(--sk-space-1) 0 0;
      color: oklch(0.16 0.018 230);
      font-size: var(--sk-font-size-md);
      font-weight: var(--sk-font-weight-bold);
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
      border: 1px solid oklch(0.16 0.018 230 / 0.22);
      border-radius: 14px;
      background: oklch(0.155 0.018 230);
      color: oklch(0.98 0 0);
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
      border-bottom: 1px solid oklch(1 0 0 / 0.14);
      background: oklch(0.19 0.022 230);
    }
    .sk-gallery-workbench-bar p {
      margin: 0;
      font-size: var(--sk-font-size-md);
      font-weight: var(--sk-font-weight-bold);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-workbench-bar span {
      border-radius: var(--sk-radius-control);
      background: oklch(0.91 0.12 86);
      padding: var(--sk-space-1) var(--sk-space-2);
      color: oklch(0.16 0.018 230);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-claim {
      display: grid;
      gap: var(--sk-space-2);
      border-bottom: 1px solid oklch(1 0 0 / 0.14);
      background: oklch(0.13 0.016 230);
    }
    .sk-gallery-claim span,
    .sk-gallery-status-grid dt {
      color: oklch(0.78 0.1 174);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-claim strong {
      max-width: 520px;
      font-size: clamp(1.35rem, 3vw, 2rem);
      line-height: 1.08;
      letter-spacing: -0.02em;
    }
    .sk-gallery-claim p {
      margin: 0;
      color: oklch(0.82 0.015 220);
      line-height: 1.6;
    }
    .sk-gallery-evidence-rail {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border-bottom: 1px solid oklch(1 0 0 / 0.14);
    }
    .sk-gallery-evidence-rail span {
      min-height: 96px;
      border-right: 1px solid oklch(1 0 0 / 0.12);
      padding: var(--sk-space-3);
      color: oklch(0.96 0 0);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-bold);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-evidence-rail span:last-child {
      border-right: 0;
    }
    .sk-gallery-evidence-rail span::before {
      content: "";
      display: block;
      width: 12px;
      height: 12px;
      margin-bottom: var(--sk-space-3);
      border: 2px solid oklch(0.91 0.12 86);
      border-radius: 50%;
      background: oklch(0.155 0.018 230);
    }
    .sk-gallery-current-evidence {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid oklch(1 0 0 / 0.14);
      background: oklch(0.12 0.015 230);
    }
    .sk-gallery-current-evidence div {
      min-width: 0;
      border-right: 1px solid oklch(1 0 0 / 0.1);
      border-bottom: 1px solid oklch(1 0 0 / 0.1);
      padding: var(--sk-space-3);
    }
    .sk-gallery-current-evidence div:nth-child(2n) {
      border-right: 0;
    }
    .sk-gallery-current-evidence div:nth-last-child(-n + 2) {
      border-bottom: 0;
    }
    .sk-gallery-current-evidence span {
      display: inline-flex;
      border-radius: var(--sk-radius-control);
      padding: 0.18rem var(--sk-space-1);
      font-size: 0.72rem;
      font-weight: var(--sk-font-weight-bold);
      line-height: 1.2;
    }
    .sk-gallery-current-evidence strong {
      display: block;
      margin-top: var(--sk-space-2);
      color: oklch(0.96 0 0);
      font-size: var(--sk-font-size-sm);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-current-evidence code,
    .sk-gallery-current-evidence small,
    .sk-gallery-current-evidence p {
      display: block;
      margin-top: var(--sk-space-2);
    }
    .sk-gallery-current-evidence code {
      width: fit-content;
      max-width: 100%;
      border: 1px solid oklch(1 0 0 / 0.14);
      border-radius: 6px;
      padding: 0.18rem var(--sk-space-1);
      background: oklch(1 0 0 / 0.08);
      color: oklch(0.91 0.12 86);
      font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
      font-size: 0.72rem;
      line-height: 1.25;
      white-space: normal;
    }
    .sk-gallery-current-evidence small {
      color: oklch(0.78 0.1 174);
      font-size: 0.72rem;
      font-weight: var(--sk-font-weight-semibold);
      line-height: 1.3;
    }
    .sk-gallery-current-evidence p {
      margin-bottom: 0;
      color: oklch(0.78 0.015 220);
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .sk-gallery-current-evidence [data-sk-evidence-state="pass"] span,
    .sk-gallery-current-evidence [data-sk-evidence-state="recorded"] span {
      background: oklch(0.78 0.12 160 / 0.18);
      color: oklch(0.84 0.15 155);
    }
    .sk-gallery-current-evidence [data-sk-evidence-state="limited"] span {
      background: oklch(0.91 0.12 86 / 0.14);
      color: oklch(0.91 0.12 86);
    }
    .sk-gallery-status-grid {
      display: grid;
      margin: 0;
      border-bottom: 1px solid oklch(1 0 0 / 0.14);
      background: oklch(0.18 0.02 230);
    }
    .sk-gallery-status-grid div {
      min-height: 118px;
      border-bottom: 1px solid oklch(1 0 0 / 0.12);
      padding: var(--sk-space-4);
    }
    .sk-gallery-status-grid div:last-child {
      border-bottom: 0;
    }
    .sk-gallery-status-grid dd {
      margin: var(--sk-space-2) 0 0;
      color: oklch(0.98 0 0);
      font-weight: var(--sk-font-weight-bold);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-disclaimer {
      margin: 0;
      background: oklch(0.52 0.12 40);
      color: oklch(0.99 0.006 72);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-footer {
      display: grid;
      gap: var(--sk-space-5);
      margin-top: clamp(3rem, 7vw, 5.75rem);
      border-top: 1px solid oklch(0.16 0.018 230 / 0.22);
      padding: clamp(2rem, 5vw, 4rem) 0 0;
    }
    .sk-gallery-footer h2 {
      max-width: 740px;
      margin: 0;
      color: oklch(0.145 0.018 230);
      font-size: clamp(1.8rem, 4vw, 3.1rem);
      line-height: 1.06;
      letter-spacing: -0.026em;
      text-wrap: balance;
    }
    .sk-gallery-footer p {
      max-width: 780px;
      margin: var(--sk-space-3) 0 0;
      color: oklch(0.34 0.022 230);
      line-height: 1.65;
    }
    .sk-gallery-footer nav {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sk-space-2);
    }
    .sk-gallery-footer a {
      display: inline-flex;
      min-height: 44px;
      align-items: center;
      justify-content: center;
      border: 1px solid oklch(0.16 0.018 230 / 0.16);
      border-radius: 8px;
      background: oklch(1 0 0);
      padding: 0 var(--sk-space-3);
      color: oklch(0.23 0.07 175);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
      text-decoration: none;
    }
    .sk-gallery-footer a:hover {
      border-color: oklch(0.22 0.07 175);
      background: oklch(0.94 0.018 185);
    }
    .sk-gallery-footer a:focus-visible {
      outline: 2px solid oklch(0.67 0.14 75);
      outline-offset: 3px;
    }
  `;
}

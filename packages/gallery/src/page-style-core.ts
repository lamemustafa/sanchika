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
      align-items: start;
      gap: clamp(1.5rem, 4vw, 4.5rem);
      overflow: hidden;
      min-height: min(720px, calc(100vh - 5rem));
      border: 1px solid oklch(0.16 0.018 230 / 0.18);
      border-radius: 16px;
      padding: clamp(1.35rem, 5vw, 4.5rem);
      background:
        linear-gradient(90deg, oklch(0.84 0.019 185 / 0.28) 1px, transparent 1px),
        linear-gradient(0deg, oklch(0.84 0.019 185 / 0.2) 1px, transparent 1px),
        radial-gradient(circle at 10% 82%, oklch(0.86 0.11 78 / 0.34), transparent 30%),
        linear-gradient(128deg, oklch(0.99 0 0) 0.01%, oklch(0.948 0.012 185) 48%, oklch(0.885 0.035 196) 100%);
      background-size: 44px 44px, 44px 44px, auto, auto;
      color: oklch(0.16 0.018 230);
    }
    .sk-gallery-hero::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, transparent 0.01% 59%, oklch(0.16 0.018 230 / 0.08) 59% 59.25%, transparent 59.25%),
        linear-gradient(180deg, transparent 0.01% 24%, oklch(0.16 0.018 230 / 0.08) 24% 24.18%, transparent 24.18%),
        radial-gradient(circle at 78% 14%, oklch(0.7 0.13 42 / 0.16), transparent 24%);
      pointer-events: none;
    }
    .sk-gallery-hero::after {
      content: "";
      position: absolute;
      right: clamp(1rem, 5vw, 4rem);
      bottom: clamp(1rem, 5vw, 4rem);
      width: min(34vw, 25rem);
      aspect-ratio: 1;
      border: 1px solid oklch(0.2 0.04 230 / 0.12);
      border-radius: 50%;
      background:
        radial-gradient(circle, transparent 0.01% 34%, oklch(0.2 0.04 230 / 0.08) 34.4% 34.7%, transparent 35% 55%, oklch(0.2 0.04 230 / 0.08) 55.4% 55.7%, transparent 56%),
        conic-gradient(from -24deg, transparent 0.01% 10%, oklch(0.66 0.14 42 / 0.16) 10% 17%, transparent 17% 52%, oklch(0.22 0.07 175 / 0.15) 52% 60%, transparent 60%);
      pointer-events: none;
    }
    .sk-gallery-hero-copy {
      position: relative;
      z-index: 1;
      display: grid;
      align-self: start;
      max-width: 760px;
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
      font-size: clamp(3.1rem, 6.4vw, 5.8rem);
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
    .sk-gallery-proof-lattice {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0;
      overflow: hidden;
      max-width: 760px;
      margin-top: var(--sk-space-5);
      border: 1px solid oklch(0.16 0.018 230 / 0.18);
      border-radius: 12px;
      background: oklch(1 0 0 / 0.74);
    }
    .sk-gallery-proof-lattice div {
      min-width: 0;
      border-right: 1px solid oklch(0.16 0.018 230 / 0.12);
      padding: var(--sk-space-3);
    }
    .sk-gallery-proof-lattice div:last-child {
      border-right: 0;
    }
    .sk-gallery-proof-lattice span {
      color: oklch(0.52 0.12 40);
      font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
      font-size: 0.78rem;
      font-weight: var(--sk-font-weight-bold);
      letter-spacing: 0.04em;
    }
    .sk-gallery-proof-lattice strong {
      display: block;
      margin-top: var(--sk-space-2);
      color: oklch(0.145 0.018 230);
      font-size: var(--sk-font-size-md);
      line-height: var(--sk-line-height-tight);
    }
    .sk-gallery-proof-lattice p {
      margin: var(--sk-space-2) 0 0;
      color: oklch(0.38 0.024 230);
      font-size: var(--sk-font-size-sm);
      line-height: 1.5;
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
      align-self: start;
      overflow: hidden;
      border: 1px solid oklch(0.16 0.018 230 / 0.22);
      border-radius: 14px;
      background:
        linear-gradient(90deg, oklch(1 0 0 / 0.045) 1px, transparent 1px),
        linear-gradient(0deg, oklch(1 0 0 / 0.04) 1px, transparent 1px),
        oklch(0.155 0.018 230);
      background-size: 36px 36px;
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
      background:
        radial-gradient(circle at 84% 12%, oklch(0.91 0.12 86 / 0.14), transparent 28%),
        oklch(0.13 0.016 230);
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
    .sk-gallery-workbench-map {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid oklch(1 0 0 / 0.14);
      background: oklch(0.17 0.022 230 / 0.88);
    }
    .sk-gallery-workbench-map div {
      min-height: 116px;
      border-right: 1px solid oklch(1 0 0 / 0.1);
      border-bottom: 1px solid oklch(1 0 0 / 0.1);
      padding: var(--sk-space-3);
    }
    .sk-gallery-workbench-map div:nth-child(2n) {
      border-right: 0;
    }
    .sk-gallery-workbench-map div:nth-last-child(-n + 2) {
      border-bottom: 0;
    }
    .sk-gallery-workbench-map span {
      color: oklch(0.91 0.12 86);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-semibold);
    }
    .sk-gallery-workbench-map strong {
      display: block;
      margin-top: var(--sk-space-2);
      color: oklch(0.98 0 0);
      font-size: clamp(1.05rem, 2vw, 1.28rem);
      line-height: var(--sk-line-height-tight);
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

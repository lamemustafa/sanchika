export function renderGalleryHero({
  colorRoleCount,
  primaryButtonClass,
  secondaryButtonClass,
}: {
  colorRoleCount: number;
  primaryButtonClass: string;
  secondaryButtonClass: string;
}): string {
  const evidenceLedger = [
    {
      state: "pass",
      label: "Package build",
      command: "pnpm build",
      source: "packages/*/dist",
      detail: "Compiled package artifacts are required before the gallery can render.",
    },
    {
      state: "pass",
      label: "Artifact check",
      command: "pnpm gallery:check",
      source: "dist/gallery/index.html",
      detail: "The openable static artifact must include token CSS, primitive CSS, and public metadata.",
    },
    {
      state: "pass",
      label: "Pages smoke",
      command: "pnpm pages:smoke",
      source: "sanchika.complyeaze.com",
      detail: "The deployed page must expose the current evidence, adoption map, and synthetic-data boundary.",
    },
    {
      state: "limited",
      label: "Accessibility evidence",
      command: "manual browser pass",
      source: "docs/accessibility.md",
      detail: "WCAG/APG contracts exist; automated browser accessibility evidence is still limited.",
    },
    {
      state: "limited",
      label: "Consumer adoption",
      command: "pnpm consumer:check",
      source: "docs/adoption-complyeaze.md",
      detail: "ComplyEaze adoption remains the proof gate before broad rollout claims.",
    },
    {
      state: "recorded",
      label: "Rollback path",
      command: "docs/release-policy.md",
      source: "GitHub Pages artifact",
      detail: "Rollback remains a static artifact and repository release decision, not runtime migration.",
    },
  ];
  const evidenceCards = evidenceLedger
    .map(
      (item) => `<div data-sk-evidence-state="${escapeHtml(item.state)}">
        <span>${escapeHtml(titleCase(item.state))}</span>
        <strong>${escapeHtml(item.label)}</strong>
        <code>${escapeHtml(item.command)}</code>
        <small>${escapeHtml(item.source)}</small>
        <p>${escapeHtml(item.detail)}</p>
      </div>`,
    )
    .join("");

  return `<header class="sk-gallery-masthead" aria-label="Sanchika site navigation">
    <a class="sk-gallery-wordmark" href="#gallery-title" aria-label="Sanchika home">
      <span class="sk-gallery-mark" aria-hidden="true">S</span>
      <span><strong>Sanchika</strong><small>Design evidence system</small></span>
    </a>
    <nav class="sk-gallery-nav" aria-label="Gallery sections">
      <a href="#gallery-family-title">Adoption map</a>
      <a href="#evidence-loop">Evidence loop</a>
      <a href="#primitive-contracts">Primitives</a>
      <a href="#pattern-contracts">Patterns</a>
    </nav>
  </header>
  <section class="sk-gallery-hero" aria-labelledby="gallery-title">
    <div class="sk-gallery-hero-copy">
      <p class="sk-gallery-eyebrow">Live static artifact · synthetic examples only</p>
      <h1 id="gallery-title">Interfaces that survive compliance review.</h1>
      <p class="sk-gallery-lede">Sanchika is a design system for AI-shaped compliance UI. It makes the contract visible before adoption: what the surface may claim, which state it is in, what evidence rendered, and where the runtime boundary stops.</p>
      <div class="sk-gallery-actions" aria-label="Primary gallery actions">
        <a class="${primaryButtonClass}" href="#evidence-loop">Follow the evidence loop</a>
        <a class="${secondaryButtonClass}" href="#primitive-contracts">Inspect contracts</a>
      </div>
      <dl class="sk-gallery-proof-strip" aria-label="Current gallery proof signals">
        <div><dt>Live host</dt><dd>sanchika.complyeaze.com</dd></div>
        <div><dt>Tokens</dt><dd>${colorRoleCount} color roles loaded</dd></div>
        <div><dt>Boundary</dt><dd>No taxpayer, portal, filing, or client data</dd></div>
      </dl>
    </div>
    <aside class="sk-gallery-workbench" aria-labelledby="gallery-status-title">
      <div class="sk-gallery-workbench-bar">
        <p>Evidence run</p>
        <span>static artifact</span>
      </div>
      <div class="sk-gallery-claim">
        <span id="gallery-status-title">Current truth</span>
        <strong>A design system that can defend itself.</strong>
        <p>The gallery proves package behavior. Product readiness still requires browser, accessibility, consumer, and rollback evidence.</p>
      </div>
      <div class="sk-gallery-evidence-rail" aria-label="Sanchika evidence flow">
        <span>TrustBrief</span>
        <span>DesignBrief</span>
        <span>Browser evidence</span>
        <span>Adoption decision</span>
      </div>
      <dl class="sk-gallery-status-grid">
        <div><dt>Runtime</dt><dd>Static HTML, CSS, and package contracts</dd></div>
        <div><dt>Review mode</dt><dd>Open source artifact, not compliance authority</dd></div>
        <div><dt>Consumer path</dt><dd>Adopt only after real product evidence</dd></div>
      </dl>
      <div class="sk-gallery-current-evidence" aria-label="Current public evidence ledger">
        ${evidenceCards}
      </div>
      <p class="sk-gallery-disclaimer" data-sk-synthetic-disclaimer>All gallery examples are synthetic and must not be treated as taxpayer, portal, filing, or client data.</p>
    </aside>
  </section>`;
}

export function renderEvidenceJourney(): string {
  return `<section id="evidence-loop" class="sk-gallery-proof" aria-labelledby="gallery-proof-title">
    <div class="sk-gallery-proof-copy">
      <h2 id="gallery-proof-title">From prompt to proof without losing the boundary.</h2>
      <p>Each candidate surface must carry its intent, constraints, rendered state, and rollback path. Sanchika should make generated UI feel crafted without pretending the generator is a compliance authority.</p>
    </div>
    <div class="sk-gallery-proof-board" aria-label="Sanchika proof journey">
      <article>
        <span>TrustBrief</span>
        <strong>What may this surface claim?</strong>
        <p>Names the decision, source boundary, non-goals, selected patterns, and verification gates.</p>
      </article>
      <article>
        <span>DesignBrief</span>
        <strong>What should the first viewport prove?</strong>
        <p>Defines emotional intent, narrative arc, responsive constraints, interaction states, and visual gates.</p>
      </article>
      <article>
        <span>Browser evidence</span>
        <strong>What did the page actually render?</strong>
        <p>Desktop and mobile captures become acceptance evidence, not a post-hoc screenshot dump.</p>
      </article>
      <article>
        <span>Adoption decision</span>
        <strong>What changed after review?</strong>
        <p>Consumer evidence records adopted files, rollback path, residual risks, and a ready-or-blocked decision.</p>
      </article>
    </div>
  </section>`;
}

export function renderProductFamilySignal(): string {
  const products = [
    {
      name: "ComplyEaze",
      mode: "Core advisory surface",
      status: "First consumer",
      boundary: "Service-led pages and product proof before broad rollout.",
      action: "Read adoption proof plan",
      href: "https://github.com/lamemustafa/sanchika/blob/master/docs/adoption-complyeaze.md",
    },
    {
      name: "Axal",
      mode: "Workspace operations",
      status: "Next consumer",
      boundary: "Role-aware evidence desks, saved client context, audit trail.",
      action: "Inspect Axal adoption path",
      href: "https://github.com/lamemustafa/sanchika/blob/master/docs/adoption-axal.md",
    },
    {
      name: "Pack",
      mode: "Local utility",
      status: "Planned consumer",
      boundary: "Browser-extension UI without taxpayer upload or account assumptions.",
      action: "Inspect Pack boundary",
      href: "https://github.com/lamemustafa/sanchika/blob/master/docs/adoption-pack.md",
    },
    {
      name: "Tools",
      mode: "Browser-local drafts",
      status: "Later consumer",
      boundary: "Fast utilities with source-backed outputs and no backend promise.",
      action: "Inspect Tools boundary",
      href: "https://github.com/lamemustafa/sanchika/blob/master/docs/adoption-tools.md",
    },
  ];

  const productCards = products
    .map(
      (product) => `<article>
        <span>${escapeHtml(product.status)}</span>
        <strong>${escapeHtml(product.name)}</strong>
        <p>${escapeHtml(product.mode)}</p>
        <small>${escapeHtml(product.boundary)}</small>
        <a href="${escapeHtml(product.href)}">${escapeHtml(product.action)}</a>
      </article>`,
    )
    .join("");

  return `<section class="sk-gallery-family" aria-labelledby="gallery-family-title">
    <div class="sk-gallery-family-copy">
      <p class="sk-gallery-kicker">Adoption map</p>
      <h2 id="gallery-family-title">One design language, different trust boundaries.</h2>
      <p>Sanchika should not flatten every ComplyEaze product into the same look. It gives each surface a shared evidence spine while preserving its own identity, data boundary, and readiness state.</p>
    </div>
    <div class="sk-gallery-family-board" aria-label="Sanchika product adoption map">
      ${productCards}
    </div>
  </section>`;
}

export function renderHarnessLoop(): string {
  return `<section class="sk-gallery-loop" aria-labelledby="gallery-loop-title">
    <div>
      <h2 id="gallery-loop-title">Contracts first, rendered evidence next.</h2>
      <p>Sanchika should not claim a finished AI-native design system until real product surfaces prove the contracts in browsers, with accessibility and rollback evidence.</p>
    </div>
    <ol>
      <li><strong>TrustBrief</strong><span>Names the claim, boundary, selected patterns, non-goals, and verification gates.</span></li>
      <li><strong>DesignBrief</strong><span>Defines first viewport signal, narrative, responsive constraints, states, and quality gates.</span></li>
      <li><strong>Rendered pilot</strong><span>Turns the brief into a browser-tested surface before reuse across ComplyEaze products.</span></li>
    </ol>
  </section>`;
}

export function renderPrimitiveMatrix(): string {
  return `<section class="sk-gallery-matrix" aria-labelledby="gallery-matrix-title">
    <div>
      <h2 id="gallery-matrix-title">Reusable states must show proof, not decoration.</h2>
      <p>Each primitive keeps the interaction state explicit enough for a CA workflow, browser-local tool, or review surface to adopt without inventing hidden behavior.</p>
    </div>
    <div class="sk-gallery-matrix-grid">
      <article><span>Button</span><strong>Default, hover, focus, pressed, disabled, loading</strong></article>
      <article><span>Badge</span><strong>Neutral, success, warning, danger, info</strong></article>
      <article><span>Field</span><strong>Default, focus, disabled, invalid with described error</strong></article>
      <article><span>Card</span><strong>Static and focusable evidence containers</strong></article>
    </div>
  </section>`;
}

export function renderGalleryFooter(): string {
  return `<footer class="sk-gallery-footer" aria-labelledby="gallery-footer-title">
    <div>
      <h2 id="gallery-footer-title">Use Sanchika as evidence, not authority.</h2>
      <p>Sanchika publishes reusable interface contracts for compliance-grade products. It does not provide government affiliation, filing judgment, portal automation, tenant data access, or production-readiness guarantees.</p>
    </div>
    <nav aria-label="Sanchika repository links">
      <a href="https://github.com/lamemustafa/sanchika">Source repository</a>
      <a href="https://github.com/lamemustafa/sanchika/blob/master/README.md">Documentation</a>
      <a href="https://github.com/lamemustafa/sanchika/blob/master/SUPPORT.md">Support</a>
      <a href="https://github.com/lamemustafa/sanchika/blob/master/SECURITY.md">Security</a>
      <a href="https://github.com/lamemustafa/sanchika/blob/master/LICENSE.brand.md">Brand notice</a>
    </nav>
  </footer>`;
}

function titleCase(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

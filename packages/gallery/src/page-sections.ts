export function renderGalleryHero({
  colorRoleCount,
  primaryButtonClass,
  secondaryButtonClass,
}: {
  colorRoleCount: number;
  primaryButtonClass: string;
  secondaryButtonClass: string;
}): string {
  return `<section class="sk-gallery-hero" aria-labelledby="gallery-title">
    <div class="sk-gallery-hero-copy">
      <p class="sk-gallery-eyebrow">Live design harness</p>
      <h1 id="gallery-title">Sanchika Primitive Gallery</h1>
      <p class="sk-gallery-lede">A source-reviewable contract surface for compliance interfaces that need visible evidence, honest boundaries, and reusable states before broader product adoption.</p>
      <p class="sk-gallery-disclaimer" data-sk-synthetic-disclaimer>All gallery examples are synthetic and must not be treated as taxpayer, portal, filing, or client data.</p>
      <div class="sk-gallery-actions" aria-label="Primary gallery actions">
        <a class="${primaryButtonClass}" href="#primitive-contracts">Inspect contracts</a>
        <a class="${secondaryButtonClass}" href="#pattern-contracts">Review patterns</a>
      </div>
    </div>
    <aside class="sk-gallery-status" aria-labelledby="gallery-status-title">
      <h2 id="gallery-status-title">Current truth</h2>
      <dl>
        <div><dt>Live host</dt><dd>sanchika.complyeaze.com</dd></div>
        <div><dt>Loaded roles</dt><dd>${colorRoleCount} color roles loaded.</dd></div>
        <div><dt>Runtime boundary</dt><dd>Static HTML, CSS, and package contracts only</dd></div>
      </dl>
    </aside>
  </section>`;
}

export function renderHarnessLoop(): string {
  return `<section class="sk-gallery-loop" aria-labelledby="gallery-loop-title">
    <div>
      <p class="sk-gallery-section-kicker">Harness loop</p>
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
      <p class="sk-gallery-section-kicker">Primitive matrix</p>
      <h2 id="gallery-matrix-title">Reusable states must show proof, not decoration.</h2>
    </div>
    <div class="sk-gallery-matrix-grid">
      <article><span>Button</span><strong>Default, hover, focus, pressed, disabled, loading</strong></article>
      <article><span>Badge</span><strong>Neutral, success, warning, danger, info</strong></article>
      <article><span>Field</span><strong>Default, focus, disabled, invalid with described error</strong></article>
      <article><span>Card</span><strong>Static and focusable evidence containers</strong></article>
    </div>
  </section>`;
}

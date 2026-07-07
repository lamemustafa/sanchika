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
      <h1 id="gallery-title">A design system that can defend itself.</h1>
      <p class="sk-gallery-lede">Sanchika turns an AI-generated interface from a pretty guess into a reviewable artifact: brief, contract, browser evidence, and adoption decision, all visible before a consumer trusts it.</p>
      <div class="sk-gallery-actions" aria-label="Primary gallery actions">
        <a class="${primaryButtonClass}" href="#primitive-contracts">Inspect contracts</a>
        <a class="${secondaryButtonClass}" href="#pattern-contracts">Review patterns</a>
      </div>
    </div>
    <aside class="sk-gallery-workbench" aria-labelledby="gallery-status-title">
      <div class="sk-gallery-workbench-bar">
        <h2 id="gallery-status-title">Evidence workbench</h2>
        <span>static artifact</span>
      </div>
      <div class="sk-gallery-claim">
        <span>Current truth</span>
        <strong>The gallery proves package behavior. Product readiness still requires browser and consumer evidence.</strong>
      </div>
      <dl class="sk-gallery-status-grid">
        <div><dt>Live host</dt><dd>sanchika.complyeaze.com</dd></div>
        <div><dt>Loaded roles</dt><dd>${colorRoleCount} color roles</dd></div>
        <div><dt>Runtime boundary</dt><dd>Static HTML, CSS, and package contracts only</dd></div>
      </dl>
      <p class="sk-gallery-disclaimer" data-sk-synthetic-disclaimer>All gallery examples are synthetic and must not be treated as taxpayer, portal, filing, or client data.</p>
    </aside>
  </section>`;
}

export function renderEvidenceJourney(): string {
  return `<section class="sk-gallery-proof" aria-labelledby="gallery-proof-title">
    <div class="sk-gallery-proof-copy">
      <p class="sk-gallery-kicker">AI-native loop</p>
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

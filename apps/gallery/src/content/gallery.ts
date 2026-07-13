export const evidenceLedger = [
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
    source: "apps/gallery/dist/index.html",
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
] as const;

export const products = [
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
] as const;

export const proofJourney = [
  {
    label: "TrustBrief",
    title: "What may this surface claim?",
    detail: "Names the decision, source boundary, non-goals, selected patterns, and verification gates.",
  },
  {
    label: "DesignBrief",
    title: "What should the first viewport prove?",
    detail: "Defines emotional intent, narrative arc, responsive constraints, interaction states, and visual gates.",
  },
  {
    label: "Browser evidence",
    title: "What did the page actually render?",
    detail: "Desktop and mobile captures become acceptance evidence, not a post-hoc screenshot dump.",
  },
  {
    label: "Adoption decision",
    title: "What changed after review?",
    detail: "Consumer evidence records adopted files, rollback path, residual risks, and a ready-or-blocked decision.",
  },
] as const;

export const repositoryLinks = [
  ["Source repository", "https://github.com/lamemustafa/sanchika"],
  ["Documentation", "https://github.com/lamemustafa/sanchika/blob/master/README.md"],
  ["Support", "https://github.com/lamemustafa/sanchika/blob/master/SUPPORT.md"],
  ["Security", "https://github.com/lamemustafa/sanchika/blob/master/SECURITY.md"],
  ["Brand notice", "https://github.com/lamemustafa/sanchika/blob/master/LICENSE.brand.md"],
] as const;

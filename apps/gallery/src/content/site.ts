import { motionAssistUtilities, primitiveSpecs } from "@sanchika/primitives";
import { productPatternContracts, productPatternGroups, productVisualGrammar } from "@sanchika/patterns";
import { tokenDefinitions, tokenGroupDefinitions } from "@sanchika/tokens";
import patternsPackage from "../../../../packages/patterns/package.json";
import primitivesPackage from "../../../../packages/primitives/package.json";
import tokensPackage from "../../../../packages/tokens/package.json";
import release from "../../../../release.json";

export const canonicalOrigin = "https://sanchika.complyeaze.com";
export const sourceRepository = "https://github.com/lamemustafa/sanchika";
export const currentStableRelease = release.version;
export const currentStableReleaseUrl = `${sourceRepository}/releases/tag/v${currentStableRelease}`;
export type PlannedRelease = {
  readonly version: string;
  readonly status: "planned-not-released";
  readonly announcement: string;
};
const approvedPlannedRelease = (): PlannedRelease | null => null;
export const plannedRelease = approvedPlannedRelease();
export const noNextReleaseAnnouncement = "No next package release is currently announced.";
export const releaseStatus = {
  currentStable: {
    version: currentStableRelease,
    status: "released-current",
    url: currentStableReleaseUrl,
    distribution: "GitHub release artifacts; not published to npm",
  },
  next: plannedRelease,
  nextAnnouncement: plannedRelease?.announcement ?? noNextReleaseAnnouncement,
} as const;
export const projectProfile = {
  name: "Sanchika",
  description: "A framework-agnostic design contract and static evidence system for evidence-first Indian compliance interfaces. It provides typed tokens, React-ready primitive contracts, package CSS, product patterns, and inspectable gallery proof.",
  boundary: "Sanchika is not a model runtime, compliance authority, government service, automated judgment system, or proof that every consumer and assistive technology has been validated.",
  trustAndAccessibilityRules: [
    "Name source, limitation, review owner, and safe next action.",
    "Do not rely on color or motion alone.",
    "Keep human judgment explicit and label gallery examples as synthetic.",
    "Target WCAG 2.2 AA and WAI-ARIA APG behavior without claiming universal validation.",
  ],
  limitations: [
    "Real consumer adoption remains incomplete.",
    "Physical assistive-technology testing remains necessary.",
    "Synthetic gallery evidence does not prove protected-workspace depth or every production workflow.",
  ],
  nonGoals: [
    "No model runtime or automated compliance judgment.",
    "No government affiliation, certification, or guaranteed outcome.",
    "No universal framework runtime claim.",
    "No claim that synthetic gallery evidence proves every consumer or assistive technology.",
  ],
} as const;
export const preferredSourceLinks = [
  { label: "Source", url: sourceRepository },
  { label: `Release v${currentStableRelease}`, url: currentStableReleaseUrl },
  { label: "Security", url: `${sourceRepository}/blob/master/SECURITY.md` },
  { label: "License and trademark", url: `${sourceRepository}/blob/master/LICENSE.brand.md` },
] as const;
export const generatedDocumentRoutes = [
  { route: "/sanchika-manifest.json", label: "Machine-readable manifest", indexInSitemap: true },
  { route: "/llms.txt", label: "LLM-readable project summary", indexInSitemap: true },
] as const;
export const publicCopy = (value: string) => value
  .replace(/\bS\d+\b/g, "package")
  .replace(/\bC\d+\b/g, "reference composition")
  .replace(/\bNorth Stars\b/g, "reference compositions")
  .replace(/\bNorth Star\b/g, "reference composition");

export const slugForContract = (name: string) => name.toLowerCase();
const wordsForContract = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

export const modes = [
  {
    id: "complyeaze",
    label: "ComplyEaze / core",
    title: "Choose the operating boundary before work begins.",
    intent: "Editorial clarity and professional calm for a public product family.",
    density: "Focused publication",
    proof: "Product route map with a compact review excerpt",
    boundary: "The page explains account, upload, custody, and review before routing.",
    dataTreatment: "Short source seals, named limits, and one primary decision.",
    persistence: "No gallery persistence; route choice only",
    recordMoment: "AX-031 is routed to the protected Axal workspace before evidence is opened.",
    edgeState: "Unavailable route with an inspectable reason and safe alternative.",
    use: "Public pages that must route a person to workspace, local utility, or browser-local work.",
    avoid: "Treating Sanchika as a fifth product or implying one shared data boundary.",
    group: "public-product",
  },
  {
    id: "axal",
    label: "Axal / workspace",
    title: "Keep source, owner, blocker, and judgment in one review path.",
    intent: "Dense, assured, evidence-led work for a CA or compliance reviewer.",
    density: "High-density desk",
    proof: "Three-pane ReviewDeskPreview",
    boundary: "Saved synthetic context sits inside a named workspace; judgment stays human.",
    dataTreatment: "Record IDs, due states, provenance rail, audit events, and named owners.",
    persistence: "Workspace-owned record and audit history",
    recordMoment: "AX-031 carries ₹12,48,900 of synthetic exposure into a named CA checkpoint.",
    edgeState: "Blocked work when source evidence cannot be opened.",
    use: "Protected workflows where responsibility, evidence, and history must persist.",
    avoid: "Reducing professional review to a generic chat or approval button.",
    group: "axal-workspace",
  },
  {
    id: "pack",
    label: "Pack / local utility",
    title: "Trace custody from the portal response to a user-controlled file.",
    intent: "Operational confidence through explicit local custody and permission scope.",
    density: "Sequential custody proof",
    proof: "LocalArtifactFlow with receipt",
    boundary: "Credentials, session cookies, and downloaded files do not transfer to ComplyEaze.",
    dataTreatment: "Numbered custody steps, local destination, network boundary, and source proof.",
    persistence: "User-controlled browser download",
    recordMoment: "AX-031’s supporting filed-return artifact is traced to local Downloads without a workspace handoff.",
    edgeState: "Permission denied with a visible manual portal path.",
    use: "Local browser work where the destination and every crossing must be inspectable.",
    avoid: "Cloud language, workspace assumptions, or hidden file handoffs.",
    group: "pack-local-utility",
  },
  {
    id: "tools",
    label: "Tools / browser-local artifact bench",
    title: "Find a bounded draft tool by the work on the desk.",
    intent: "Quick, quiet utility with the output and review responsibility visible first.",
    density: "Scannable directory",
    proof: "Local ToolDirectory with complete no-JavaScript inventory",
    boundary: "Search and entered work stay in the browser; every output remains a draft.",
    dataTreatment: "Job, input, output, review owner, boundary, and availability per tool.",
    persistence: "Browser session and user-downloaded draft only",
    recordMoment: "AX-031 becomes a local response outline that still names the source and CA review requirement.",
    edgeState: "No results and failed output with reset or safe retry.",
    use: "Small, browser-local drafting jobs that do not require saved context.",
    avoid: "Hiding review needs or implying a local draft is an authoritative answer.",
    group: "tools-local-artifact",
  },
] as const;

export const staticRoutes = [
  { route: "/", label: "Sanchika showcase", kind: "overview", purpose: "Evidence-first design system proof across four product modes." },
  { route: "/foundations/", label: "Foundations", kind: "foundation", purpose: "Tokens, typography, motion, and Evidence Modernism foundations.", llmsLabel: "Foundations" },
  { route: "/foundations/tokens/", label: "Tokens", kind: "foundation", purpose: "Generated semantic token groups and usage guidance." },
  { route: "/foundations/typography/", label: "Typography", kind: "foundation", purpose: "Display, UI, and mono roles for evidence-led interfaces." },
  { route: "/foundations/motion/", label: "Motion", kind: "foundation", purpose: "CSS-first motion and reduced-motion responsibilities." },
  { route: "/primitives/", label: "Primitives", kind: "primitive-index", purpose: "React-ready semantic contracts and finite states.", llmsLabel: "Primitives" },
  { route: "/patterns/", label: "Patterns", kind: "pattern-index", purpose: "Product patterns for public, workspace, local, and browser-local modes.", llmsLabel: "Patterns" },
  { route: "/modes/", label: "Product modes", kind: "mode-index", purpose: "Four distinct product modes joined by one evidence grammar." },
  { route: "/adoption/", label: "Adoption", kind: "adoption", purpose: "Consumer order, artifact method, rollback, and unproven boundaries.", llmsLabel: "Adoption" },
] as const;

export const llmsDocumentationRoutes = staticRoutes.flatMap((entry) => "llmsLabel" in entry
  ? [{ label: entry.llmsLabel, route: entry.route }]
  : []);

export const primitiveRoutes = primitiveSpecs.map((primitive) => ({
  route: `/primitives/${slugForContract(primitive.name)}/`,
  label: primitive.name,
  kind: "primitive",
  purpose: publicCopy(primitive.purpose),
  keywords: [primitive.role, ...primitive.requiredStates, ...primitive.accessibility].map(publicCopy),
  contract: primitive,
}));

export const patternRoutes = productPatternContracts.map((pattern) => ({
  route: `/patterns/${slugForContract(pattern.name)}/`,
  label: pattern.name,
  kind: "pattern",
  purpose: publicCopy(pattern.purpose),
  productMode: pattern.primaryProductMode,
  keywords: [pattern.group, pattern.userJob, ...pattern.states.map((state) => state.name)].map(publicCopy),
  contract: pattern,
}));

export const modeRoutes = modes.map((mode) => ({
  route: `/modes/${mode.id}/`,
  label: mode.label,
  kind: "mode",
  purpose: mode.title,
  productMode: mode.id,
  keywords: [mode.intent, mode.density, mode.proof, mode.boundary, mode.edgeState],
  mode,
}));

export const productionRoutes = [...staticRoutes, ...primitiveRoutes, ...patternRoutes, ...modeRoutes]
  .sort((left, right) => left.route.localeCompare(right.route));

export const searchEntries = productionRoutes.map((entry) => {
  const extra = entry.route === "/foundations/tokens/"
    ? tokenGroupDefinitions.flatMap((group) => [group.title, group.description])
    : entry.route === "/foundations/motion/"
      ? motionAssistUtilities.flatMap((utility) => [utility.key, utility.purpose])
      : "keywords" in entry ? entry.keywords : [];
  const contractTerms = "contract" in entry
    ? [
        ...("classHooks" in entry.contract
          ? entry.contract.classHooks
          : [entry.contract.css.baseClass, entry.contract.semanticRoot, ...entry.contract.requiredFields]),
        ...[...entry.contract.anatomy].map((item: { readonly name: string }) => item.name),
        ...(entry.contract.name === "ReviewDeskPreview" ? ["review desk", "work queue", "evidence panel", "audit trail", "human checkpoint"] : []),
      ]
    : [];
  return {
    label: entry.label,
    kind: entry.kind,
    route: entry.route,
    purpose: entry.purpose,
    productMode: "productMode" in entry ? entry.productMode : undefined,
    search: [entry.label, wordsForContract(entry.label), entry.kind, entry.purpose, ...extra, ...contractTerms].join(" ").toLowerCase(),
  };
});

const packageSources = [
  { manifest: tokensPackage, docs: "/foundations/tokens/" },
  { manifest: primitivesPackage, docs: "/primitives/" },
  { manifest: patternsPackage, docs: "/patterns/" },
] as const;

export const packageMetadata = packageSources.map(({ manifest, docs }) => ({
  name: manifest.name,
  entrypoints: Object.keys(manifest.exports).map((entrypoint) =>
    entrypoint === "." ? manifest.name : `${manifest.name}/${entrypoint.replace(/^\.\//, "")}`,
  ),
  docs,
}));

export const manifestSource = {
  tokenDefinitions,
  tokenGroupDefinitions,
  primitiveSpecs,
  productPatternContracts,
  productPatternGroups,
  productVisualGrammar,
  motionAssistUtilities,
};

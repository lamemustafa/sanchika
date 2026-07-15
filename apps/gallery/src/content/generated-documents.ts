import {
  canonicalOrigin,
  currentStableRelease,
  generatedDocumentRoutes,
  llmsDocumentationRoutes,
  manifestSource,
  modes,
  packageMetadata,
  plannedRelease,
  preferredSourceLinks,
  projectProfile,
  productionRoutes,
  sourceRepository,
} from "./site";

export function createSanchikaManifest() {
  return {
    schemaVersion: "1.0.0",
    project: projectProfile.name,
    description: projectProfile.description,
    boundary: projectProfile.boundary,
    sourceRepository,
    canonicalSite: canonicalOrigin,
    releases: {
      currentStable: { version: currentStableRelease, status: "released" },
      planned: { version: plannedRelease, status: "planned-not-released" },
    },
    packages: packageMetadata.map((pkg) => ({
      ...pkg,
      source: `${sourceRepository}/tree/master/packages/${pkg.name.replace("@sanchika/", "")}`,
      documentation: `${canonicalOrigin}${pkg.docs}`,
    })),
    tokens: {
      groups: manifestSource.tokenGroupDefinitions.map((group) => ({
        id: group.id,
        title: group.title,
        names: manifestSource.tokenDefinitions.filter((token) => token.group === group.id).map((token) => token.id),
      })),
    },
    primitives: manifestSource.primitiveSpecs.map((primitive) => ({
      name: primitive.name,
      role: primitive.role,
      importantStates: primitive.requiredStates,
      route: `${canonicalOrigin}/primitives/${primitive.name.toLowerCase()}/`,
    })),
    patterns: manifestSource.productPatternContracts.map((pattern) => ({
      name: pattern.name,
      group: pattern.group,
      productMode: pattern.primaryProductMode,
      importantStates: pattern.states.map((state) => state.name),
      route: `${canonicalOrigin}/patterns/${pattern.name.toLowerCase()}/`,
    })),
    patternGroups: manifestSource.productPatternGroups.map((group) => ({
      name: group.name,
      label: group.label,
      patterns: group.patterns.map((pattern) => pattern.name),
    })),
    visualGrammar: Object.entries(manifestSource.productVisualGrammar).map(([name, hook]) => ({ name, ...hook })),
    motionAssist: manifestSource.motionAssistUtilities.map((utility) => ({
      key: utility.key,
      className: utility.className,
      purpose: utility.purpose,
      reducedMotionResult: utility.reducedMotionResult,
    })),
    routes: productionRoutes.map((route) => ({
      url: `${canonicalOrigin}${route.route}`,
      kind: route.kind,
      label: route.label,
    })),
    documentation: llmsDocumentationRoutes.map((entry) => ({
      label: entry.label,
      url: `${canonicalOrigin}${entry.route}`,
    })),
    generatedDocuments: generatedDocumentRoutes.map((entry) => ({
      label: entry.label,
      url: `${canonicalOrigin}${entry.route}`,
    })),
    productModes: modes.map((mode) => ({
      id: mode.id,
      label: mode.label,
      purpose: mode.title,
      route: `${canonicalOrigin}/modes/${mode.id}/`,
    })),
    trustAndAccessibilityRules: [...projectProfile.trustAndAccessibilityRules],
    limitations: [...projectProfile.limitations],
    preferredSources: preferredSourceLinks.map((source) => ({ ...source })),
    adoption: `${canonicalOrigin}/adoption/`,
    nonGoals: [...projectProfile.nonGoals],
  };
}

export function createLlmsText() {
  const manifest = createSanchikaManifest();
  const packageLines = manifest.packages.map((pkg) => `- ${pkg.name}: ${pkg.entrypoints.join(", ")} — ${pkg.documentation}`);
  return [
    "# Sanchika",
    "",
    manifest.description,
    "",
    "## What it is not",
    manifest.boundary,
    "",
    "## Packages and entrypoints",
    ...packageLines,
    "",
    "## Documentation",
    ...manifest.documentation.map((entry) => `- ${entry.label}: ${entry.url}`),
    ...manifest.generatedDocuments.filter((entry) => entry.url.endsWith("sanchika-manifest.json")).map((entry) => `- ${entry.label}: ${entry.url}`),
    "",
    "## Product modes",
    ...manifest.productModes.map((mode) => `- ${mode.label}: ${mode.purpose} — ${mode.route}`),
    "",
    "## Trust and accessibility rules",
    ...manifest.trustAndAccessibilityRules.map((rule) => `- ${rule}`),
    "",
    "## Current status and limitations",
    `Current stable release: v${manifest.releases.currentStable.version}. v${manifest.releases.planned.version} is planned and is not released.`,
    ...manifest.limitations.map((limitation) => `- ${limitation}`),
    "",
    "## Preferred sources",
    ...manifest.preferredSources.map((source) => `- ${source.label}: ${source.url}`),
    "",
  ].join("\n");
}

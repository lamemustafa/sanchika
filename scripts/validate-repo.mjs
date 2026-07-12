import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  contrastPairs,
  productSections,
  requiredMotionVariables,
  contrastRatio,
  parseOklch,
} from "./validation/contrast.mjs";
import { validateCiWorkflow } from "./validation/ci-workflow.mjs";
import { validatePagesWorkflow } from "./validation/pages-workflow.mjs";
import { validatePagesSmokeWorkflow } from "./validation/pages-smoke-workflow.mjs";
import { expectedGithubLabels } from "./validation/github-labels.mjs";
import { validatePackageManifest } from "./validation/package-manifests.mjs";
import { validatePatternContracts } from "./validation/pattern-contracts.mjs";
import { validatePrimitiveContracts } from "./validation/primitive-contracts.mjs";
import {
  createReleaseArtifactManifest,
  loadReleaseManifest,
  parseReleaseManifest,
  releaseManifestFixtureCases,
  resolveReleaseVersion,
  sha256File,
  stableReleasePackageOrder,
  validateReleaseManifest,
} from "./validation/release-manifest.mjs";
import { validateSensitiveExamples } from "./validation/sensitive-examples.mjs";
import { validateTrustBriefContracts } from "./validation/trust-brief-contracts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

function normalizeProse(text) {
  return text.replace(/\s+/g, " ");
}

function requireText(path) {
  if (!existsSync(join(root, path))) {
    fail(`${path} must exist`);
    return "";
  }

  return readText(path);
}

const expectedPackages = ["gallery", "patterns", "primitives", "tokens"];
const actualPackages = readdirSync(join(root, "packages")).filter((entry) => !entry.startsWith(".")).sort();

validateSensitiveExamples({ root, fail });

if (JSON.stringify(actualPackages) !== JSON.stringify(expectedPackages)) {
  fail(`packages/ must contain exactly ${expectedPackages.join(", ")}, found ${actualPackages.join(", ")}`);
}

for (const blocked of ["apps", "pack", "tools", "src/app"]) {
  if (existsSync(join(root, blocked))) {
    fail(`${blocked} must not exist in Sanchika v0`);
  }
}

const rootPackage = readJson("package.json");
if (rootPackage.name !== "sanchika") {
  fail("root package must be named sanchika");
}

if (rootPackage.repository?.url !== "git+https://github.com/lamemustafa/sanchika.git") {
  fail("root repository URL must point at lamemustafa/sanchika");
}

if (rootPackage.private !== true) {
  fail("root package must remain private until publish gates pass");
}

if (rootPackage.engines?.node !== ">=24") {
  fail("root package must declare engines.node >=24");
}

if (rootPackage.scripts?.["consumer:check"] !== "node scripts/check-local-link-consumer.mjs") {
  fail("root package must expose consumer:check for local-link adoption proof");
}

if (rootPackage.scripts?.["workflow:preflight"] !== "node scripts/check-workflow-preflight.mjs") {
  fail("root package must expose workflow:preflight for nested repo branch and cleanliness checks");
}

if (rootPackage.scripts?.["review:gate"] !== "node scripts/check-pr-review-gate.mjs") {
  fail("root package must expose review:gate for current-head review-thread checks");
}

if (rootPackage.scripts?.["review:gate:fixtures"] !== "node scripts/validation/review-gate-fixtures.mjs") {
  fail("root package must expose review:gate:fixtures for review-gate reducer regression checks");
}

if (rootPackage.scripts?.["review:gate:sync-fixtures"] !== "node scripts/validation/review-gate-sync-fixtures.mjs") {
  fail("root package must expose review:gate:sync-fixtures for review-gate status sync regression checks");
}

if (rootPackage.scripts?.["trust:brief:fixtures"] !== "node scripts/validation/trust-brief-fixtures.mjs") {
  fail("root package must expose trust:brief:fixtures for trust-brief runtime regression checks");
}

if (rootPackage.scripts?.["design:brief:fixtures"] !== "node scripts/validation/design-brief-fixtures.mjs") {
  fail("root package must expose design:brief:fixtures for design-brief runtime regression checks");
}

if (rootPackage.scripts?.["evidence:loop:fixtures"] !== "node scripts/validation/evidence-loop-fixtures.mjs") {
  fail("root package must expose evidence:loop:fixtures for evidence-loop runtime regression checks");
}

if (rootPackage.scripts?.["github:ruleset"] !== "node scripts/render-github-master-ruleset.mjs") {
  fail("root package must expose github:ruleset for reproducible branch ruleset setup");
}

if (rootPackage.scripts?.["github:labels"] !== "node scripts/sync-github-labels.mjs") {
  fail("root package must expose github:labels for deterministic issue template labels");
}

if (rootPackage.scripts?.["github:verify"] !== "node scripts/check-github-repo-state.mjs") {
  fail("root package must expose github:verify for post-push repository state checks");
}

if (!existsSync(join(root, "scripts/check-workflow-preflight.mjs"))) {
  fail("workflow:preflight script file must exist");
}

if (!existsSync(join(root, "scripts/check-pr-review-gate.mjs"))) {
  fail("review:gate script file must exist");
}

if (!existsSync(join(root, "scripts/validation/review-gate-fixtures.mjs"))) {
  fail("review gate fixture validator must exist");
}

if (!existsSync(join(root, "scripts/validation/review-gate-sync-fixtures.mjs"))) {
  fail("review gate sync fixture validator must exist");
}

if (!existsSync(join(root, "scripts/validation/trust-brief-fixtures.mjs"))) {
  fail("trust brief fixture validator must exist");
}

if (!existsSync(join(root, "scripts/validation/design-brief-fixtures.mjs"))) {
  fail("design brief fixture validator must exist");
}

if (!existsSync(join(root, "scripts/validation/evidence-loop-fixtures.mjs"))) {
  fail("evidence loop fixture validator must exist");
}

if (!existsSync(join(root, "scripts/sync-review-gate-status.mjs"))) {
  fail("review gate status sync script file must exist");
}

if (!existsSync(join(root, "scripts/render-github-master-ruleset.mjs"))) {
  fail("github:ruleset script file must exist");
}

if (!existsSync(join(root, "scripts/sync-github-labels.mjs"))) {
  fail("github:labels script file must exist");
}

if (!existsSync(join(root, "scripts/check-github-repo-state.mjs"))) {
  fail("github:verify script file must exist");
}

if (!existsSync(join(root, "scripts/check-local-link-consumer.mjs"))) {
  fail("consumer:check script file must exist");
}

if (!existsSync(join(root, "scripts/validation/build-artifacts.mjs"))) {
  fail("build artifact preflight helper must exist");
}

if (!existsSync(join(root, "scripts/validation/sensitive-examples.mjs"))) {
  fail("sensitive example validator must exist");
}

if (!existsSync(join(root, "scripts/validation/tarball-contents.mjs"))) {
  fail("tarball contents validator must exist");
}

if (!existsSync(join(root, "scripts/validation/pages-workflow.mjs"))) {
  fail("Pages workflow validator must exist");
}

if (!existsSync(join(root, "scripts/check-pages-smoke.mjs"))) {
  fail("Pages smoke check script file must exist");
}

if (!existsSync(join(root, "scripts/check-custom-domain-readiness.mjs"))) {
  fail("custom domain readiness check script file must exist");
}

if (!existsSync(join(root, "scripts/validation/pages-smoke-workflow.mjs"))) {
  fail("Pages smoke workflow validator must exist");
}

if (!rootPackage.scripts?.verify?.includes("pnpm consumer:check")) {
  fail("root verify script must run consumer:check");
}

if (!rootPackage.scripts?.verify?.includes("pnpm review:gate:fixtures")) {
  fail("root verify script must run review:gate:fixtures");
}

if (rootPackage.scripts?.["pages:smoke"] !== "node scripts/check-pages-smoke.mjs") {
  fail("root package must expose pages:smoke for live Pages availability checks");
}

if (rootPackage.scripts?.["hosting:domain:check"] !== "node scripts/check-custom-domain-readiness.mjs") {
  fail("root package must expose hosting:domain:check for custom-domain readiness checks");
}

if (!rootPackage.scripts?.verify?.includes("pnpm review:gate:sync-fixtures")) {
  fail("root verify script must run review:gate:sync-fixtures");
}

if (!rootPackage.scripts?.verify?.includes("pnpm trust:brief:fixtures")) {
  fail("root verify script must run trust:brief:fixtures");
}

if (!rootPackage.scripts?.verify?.includes("pnpm design:brief:fixtures")) {
  fail("root verify script must run design:brief:fixtures");
}

if (!rootPackage.scripts?.verify?.includes("pnpm evidence:loop:fixtures")) {
  fail("root verify script must run evidence:loop:fixtures");
}

if (rootPackage.scripts?.["typecheck:api"] !== "node scripts/check-package-api-types.mjs") {
  fail("root package must expose typecheck:api for package API declaration proof");
}

const verifyScript = rootPackage.scripts?.verify ?? "";
if (!verifyScript.includes("pnpm typecheck:api")) {
  fail("root verify script must run typecheck:api after build");
}

const buildIndex = verifyScript.indexOf("pnpm build");
const packageApiTypecheckIndex = verifyScript.indexOf("pnpm typecheck:api");
if (buildIndex === -1 || buildIndex > packageApiTypecheckIndex) {
  fail("root verify script must run typecheck:api after build");
}

const trustBriefFixturesIndex = verifyScript.indexOf("pnpm trust:brief:fixtures");
if (buildIndex === -1 || buildIndex > trustBriefFixturesIndex) {
  fail("root verify script must run trust:brief:fixtures after build");
}

const designBriefFixturesIndex = verifyScript.indexOf("pnpm design:brief:fixtures");
if (buildIndex === -1 || buildIndex > designBriefFixturesIndex) {
  fail("root verify script must run design:brief:fixtures after build");
}

const evidenceLoopFixturesIndex = verifyScript.indexOf("pnpm evidence:loop:fixtures");
if (buildIndex === -1 || buildIndex > evidenceLoopFixturesIndex) {
  fail("root verify script must run evidence:loop:fixtures after build");
}

if (!existsSync(join(root, "scripts/check-package-api-types.mjs")) || !existsSync(join(root, "type-tests/package-api.ts"))) {
  fail("package API typecheck project must exist");
}

if (rootPackage.scripts?.["publish:check"] !== "node scripts/check-publish-ready.mjs") {
  fail("root package must expose publish:check for future publish readiness proof");
}

if (!existsSync(join(root, "scripts/check-publish-ready.mjs"))) {
  fail("publish:check script file must exist");
}

if (rootPackage.scripts?.["publish:tarball-check"] !== "node scripts/check-packed-tarball-consumer.mjs") {
  fail("root package must expose publish:tarball-check for future packed-tarball adoption proof");
}

if (!existsSync(join(root, "scripts/check-packed-tarball-consumer.mjs"))) {
  fail("publish:tarball-check script file must exist");
}

if (rootPackage.scripts?.["release:tarballs"] !== "pnpm build && node scripts/check-packed-tarball-consumer.mjs --emit-dir dist/release") {
  fail("root package must expose release:tarballs for durable packed-tarball release artifacts");
}

if (
  rootPackage.scripts?.["release:stable-tarballs"] !==
  "pnpm build && node scripts/check-packed-tarball-consumer.mjs --stable-release --emit-dir dist/release"
) {
  fail("root package must expose release:stable-tarballs for approval-gated stable GitHub release assets");
}

let releaseManifest;
try {
  releaseManifest = loadReleaseManifest(join(root, "release.json"));
} catch (error) {
  fail(error.message);
}

if (
  releaseManifest &&
  JSON.stringify(releaseManifest.packages) !== JSON.stringify(stableReleasePackageOrder)
) {
  fail(`release.json packages must be exactly ${stableReleasePackageOrder.join(", ")}`);
}

let releaseManifestFixtureCount = 0;
for (const fixture of releaseManifestFixtureCases()) {
  releaseManifestFixtureCount += 1;
  const fixtureFailures = validateReleaseManifest(fixture.manifest);
  const matched = fixture.expectedFailure
    ? fixtureFailures.some((message) => message.includes(fixture.expectedFailure))
    : fixtureFailures.length === 0;
  if (!matched) {
    fail(
      `Release manifest fixture ${fixture.name} expected ${fixture.expectedFailure ?? "success"}; found ${fixtureFailures.join(", ") || "success"}`,
    );
  }
}

for (const [name, operation, expectedFailure] of [
  ["missing manifest", () => loadReleaseManifest(join(root, "release-does-not-exist.json")), "is missing"],
  ["malformed manifest", () => parseReleaseManifest("{", "fixture"), "malformed JSON"],
  [
    "version mismatch",
    () => resolveReleaseVersion({ manifest: releaseManifest, override: `${releaseManifest?.version}-mismatch` }),
    "must match release manifest version",
  ],
]) {
  releaseManifestFixtureCount += 1;
  try {
    operation();
    fail(`Release manifest fixture ${name} must fail`);
  } catch (error) {
    if (!error.message.includes(expectedFailure)) {
      fail(`Release manifest fixture ${name} must fail with ${expectedFailure}; received ${error.message}`);
    }
  }
}

releaseManifestFixtureCount += 1;
try {
  if (resolveReleaseVersion({ manifest: releaseManifest, override: releaseManifest.version }) !== releaseManifest.version) {
    fail("Release manifest fixture matching version override must use the manifest version");
  }
} catch (error) {
  fail(`Release manifest fixture matching version override failed unexpectedly: ${error.message}`);
}

const fixtureArtifactPath = join(root, "release.json");
const fixtureChecksum = sha256File(fixtureArtifactPath);
const validArtifactTarballs = () =>
  releaseManifest.packages.map((packageName) => ({
    packageName,
    version: releaseManifest.version,
    filename: `${packageName.replace("@sanchika/", "sanchika-")}-${releaseManifest.version}.tgz`,
    path: fixtureArtifactPath,
    sha256: fixtureChecksum,
  }));

for (const [name, mutate, expectedFailure] of [
  ["valid emitted metadata", (tarballs) => tarballs, null],
  [
    "artifact version mismatch",
    (tarballs) => tarballs.map((tarball, index) => index === 0 ? { ...tarball, version: "9.9.9" } : tarball),
    "artifact version",
  ],
  [
    "artifact filename mismatch",
    (tarballs) => tarballs.map((tarball, index) => index === 0 ? { ...tarball, filename: "wrong-version.tgz" } : tarball),
    "artifact filename",
  ],
  [
    "invalid artifact checksum",
    (tarballs) => tarballs.map((tarball, index) => index === 0 ? { ...tarball, sha256: "invalid" } : tarball),
    "SHA-256 checksum",
  ],
  [
    "artifact checksum does not match bytes",
    (tarballs) => tarballs.map((tarball, index) => index === 0 ? { ...tarball, sha256: "a".repeat(64) } : tarball),
    "checksum must match the bytes",
  ],
]) {
  releaseManifestFixtureCount += 1;
  try {
    const artifactManifest = createReleaseArtifactManifest({
      version: releaseManifest.version,
      channel: releaseManifest.channel,
      source: { repository: "fixture", commit: "fixture" },
      generatedAt: "fixture",
      tarballs: mutate(validArtifactTarballs()),
    });
    if (expectedFailure) {
      fail(`Release manifest fixture ${name} must fail with ${expectedFailure}`);
    } else if (
      artifactManifest.version !== releaseManifest.version ||
      artifactManifest.packages.some(
        (entry) => entry.version !== releaseManifest.version || entry.sha256 !== fixtureChecksum,
      )
    ) {
      fail("Release manifest fixture emitted metadata must agree with release version and final-byte checksums");
    }
  } catch (error) {
    if (!expectedFailure) {
      fail(`Release manifest fixture ${name} failed unexpectedly: ${error.message}`);
    } else if (!error.message.includes(expectedFailure)) {
      fail(`Release manifest fixture ${name} must fail with ${expectedFailure}; received ${error.message}`);
    }
  }
}

if (releaseManifest) {
  const stableVersion = releaseManifest.version;
  const embeddedVersionTargets = [
    ["package.json scripts", JSON.stringify(rootPackage.scripts)],
    ["scripts/check-packed-tarball-consumer.mjs", readText("scripts/check-packed-tarball-consumer.mjs")],
  ];
  for (const [label, source] of embeddedVersionTargets) {
    if (source.includes(stableVersion)) {
      fail(`${label} must not embed stable release version ${stableVersion}; read it from release.json`);
    }
  }
}

for (const [scriptPath, commandName] of [
  ["scripts/smoke-gallery.mjs", "pnpm smoke"],
  ["scripts/check-package-api-types.mjs", "pnpm typecheck:api"],
  ["scripts/check-local-link-consumer.mjs", "pnpm consumer:check"],
  ["scripts/check-packed-tarball-consumer.mjs", "pnpm publish:tarball-check"],
  ["scripts/validation/trust-brief-fixtures.mjs", "pnpm trust:brief:fixtures"],
  ["scripts/validation/evidence-loop-fixtures.mjs", "pnpm evidence:loop:fixtures"],
]) {
  const scriptSource = requireText(scriptPath);
  if (!scriptSource.includes("assertBuiltPackageArtifacts")) {
    fail(`${scriptPath} must check built package artifacts before running ${commandName}`);
  }
  if (!scriptSource.includes(commandName)) {
    fail(`${scriptPath} must name ${commandName} in its build-artifact preflight`);
  }
}

const packedTarballScript = requireText("scripts/check-packed-tarball-consumer.mjs");
for (const requiredTarballEvidenceFragment of [
  "sha256File",
  "sha256",
  "Tarball evidence:",
  "artifactVersion",
  "--version",
  "--stable-release",
  "resolveReleaseVersion",
  "assertValidSimulatedVersion",
  "0.0.0-tarball-check.0",
  "--emit-dir",
  "manifest.json",
  "Release artifact bundle written to",
]) {
  if (!packedTarballScript.includes(requiredTarballEvidenceFragment)) {
    fail(`scripts/check-packed-tarball-consumer.mjs must emit tarball evidence with ${requiredTarballEvidenceFragment}`);
  }
}

const publishReadyScript = requireText("scripts/check-publish-ready.mjs");
for (const requiredPublishReadyFragment of [
  "validatePublishWorkflow",
  "contents: read",
  "id-token: write",
  "package-manager-cache: false",
  "registry-url",
  "https://registry.npmjs.org",
  "npm publish",
  "NPM_TOKEN",
  "NODE_AUTH_TOKEN",
  "_authToken",
  "npm\\s+login",
  "npm\\s+config",
  "write-all",
  "pull_request_target",
  "pull_request",
  "workflow_run",
  "schedule",
  "workflow_dispatch",
  "branches:",
  "tags:",
  "pnpm install --frozen-lockfile --ignore-scripts",
  "pnpm run verify",
  "pnpm publish:check",
  "pnpm publish:tarball-check",
  "npm publish ./packages/tokens",
  "npm publish ./packages/primitives",
  "npm publish ./packages/patterns",
  "npm publish ./packages/gallery",
  "--provenance",
  "dependencyFields",
  "peerDependencies",
  "optionalDependencies",
  "devDependencies",
  "github.repository == 'lamemustafa/sanchika'",
  "npm --version",
  "11.5.1",
  "--strict-publish-manifests",
  "repository?.url",
  "repository?.directory",
  "git+https://github.com/lamemustafa/sanchika.git",
]) {
  if (publishReadyScript && !publishReadyScript.includes(requiredPublishReadyFragment)) {
    fail(`publish:check script must enforce ${requiredPublishReadyFragment}`);
  }
}

const expectedGithubLabelNames = new Set(expectedGithubLabels.map((label) => label.name));
const issueTemplateDir = ".github/ISSUE_TEMPLATE";
const referencedIssueLabels = new Set();
for (const template of readdirSync(join(root, issueTemplateDir)).filter((entry) => entry.endsWith(".yml"))) {
  const templateSource = requireText(`${issueTemplateDir}/${template}`);
  const labelsMatch = templateSource.match(/^labels:\s*(\[.*\])$/m);
  if (!labelsMatch) continue;

  let labels = [];
  try {
    labels = JSON.parse(labelsMatch[1]);
  } catch {
    fail(`${issueTemplateDir}/${template} must declare labels as a JSON-compatible array`);
    continue;
  }

  for (const label of labels) {
    referencedIssueLabels.add(label);
    if (!expectedGithubLabelNames.has(label)) {
      fail(`${issueTemplateDir}/${template} references unmanaged GitHub label ${label}`);
    }
  }
}

for (const label of expectedGithubLabelNames) {
  if (!referencedIssueLabels.has(label)) {
    fail(`GitHub label ${label} must be referenced by an issue template`);
  }
}

const productText = requireText("PRODUCT.md");
if (productText && !productText.includes("## Register\n\nproduct")) {
  fail("PRODUCT.md must declare product register");
}

for (const section of productSections) {
  if (productText && !productText.includes(section)) {
    fail(`PRODUCT.md is missing ${section}`);
  }
}

for (const packageName of expectedPackages) {
  const manifest = readJson(`packages/${packageName}/package.json`);
  validatePackageManifest(packageName, manifest, fail);
}

const syntheticPublishablePatternManifest = {
  ...readJson("packages/patterns/package.json"),
  private: false,
  version: "0.1.0",
  publishConfig: { registry: "https://registry.npmjs.org/", access: "public" },
  dependencies: { "@sanchika/primitives": "0.1.0" },
};
validatePackageManifest("patterns", syntheticPublishablePatternManifest, fail);

const tokenSource = readText("packages/tokens/src/index.ts");
const tokenCss = readText("packages/tokens/src/theme.css");
const primitiveSource = readText("packages/primitives/src/index.ts");
const primitiveCss = readText("packages/primitives/src/styles.css");
const patternSource = readText("packages/patterns/src/index.ts");
const gallerySource = readText("packages/gallery/src/index.ts");
const tokenDocs = readText("docs/tokens.md");
const primitiveDocs = requireText("docs/primitives.md");
const patternDocs = readText("docs/patterns.md");
const accessibilityDocs = readText("docs/accessibility.md");
const ciWorkflow = requireText(".github/workflows/ci.yml");
const pagesWorkflow = requireText(".github/workflows/pages.yml");
const pagesSmokeWorkflow = requireText(".github/workflows/pages-smoke.yml");
const reviewGateWorkflow = requireText(".github/workflows/review-gate.yml");
const codeowners = requireText(".github/CODEOWNERS");
const claudeGuide = requireText("CLAUDE.md");
const issueTemplateConfig = requireText(".github/ISSUE_TEMPLATE/config.yml");
const bugIssueTemplate = requireText(".github/ISSUE_TEMPLATE/bug_report.yml");
const featureIssueTemplate = requireText(".github/ISSUE_TEMPLATE/feature_request.yml");
const conductIssueTemplate = requireText(".github/ISSUE_TEMPLATE/conduct_report.yml");
const questionIssueTemplate = requireText(".github/ISSUE_TEMPLATE/question.yml");
const dependabotConfig = requireText(".github/dependabot.yml");
const agentGuide = readText("AGENTS.md");
const contributingDocs = readText("CONTRIBUTING.md");
const codeOfConduct = requireText("CODE_OF_CONDUCT.md");
const supportDocs = requireText("SUPPORT.md");
const releasePolicy = readText("docs/release-policy.md");
const hostingDocs = requireText("docs/hosting.md");
const githubSetupDocs = requireText("docs/github-repository-setup.md");
const repositorySettingsDocs = requireText("docs/repository-settings.md");
const packageManifestValidationSource = readText("scripts/validation/package-manifests.mjs");
const galleryReadme = readText("packages/gallery/README.md");
const workflowPreflightSource = readText("scripts/check-workflow-preflight.mjs");
const githubRulesetSource = readText("scripts/render-github-master-ruleset.mjs");
const githubStateCheckSource = readText("scripts/check-github-repo-state.mjs");
const packageArtifactCheckSource = readText("scripts/check-package-artifacts.mjs");
const packedTarballCheckSource = readText("scripts/check-packed-tarball-consumer.mjs");
const tarballContentsSource = readText("scripts/validation/tarball-contents.mjs");
const architectureDocs = readText("docs/architecture.md");
const aiNativeToolingDocs = readText("docs/ai-native-tooling.md");
const complyeazeAdoptionDocs = readText("docs/adoption-complyeaze.md");
const adoptionDocs = {
  ComplyEaze: complyeazeAdoptionDocs,
  Axal: readText("docs/adoption-axal.md"),
  Pack: readText("docs/adoption-pack.md"),
  Tools: readText("docs/adoption-tools.md"),
  External: readText("docs/adoption-external.md"),
};

if (tokenSource.includes("oklch(")) {
  fail("TypeScript token metadata must not duplicate raw OKLCH values");
}

const tokenVariables = [...tokenSource.matchAll(/cssVariable: "(--sk-[^"]+)"/g)].map((match) => match[1]);
const tokenCssDeclarations = new Map(
  [...tokenCss.matchAll(/(--sk-[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]),
);

for (const variable of tokenVariables) {
  if (!tokenCssDeclarations.has(variable)) {
    fail(`theme.css is missing ${variable}`);
  }
}

for (const variable of tokenCssDeclarations.keys()) {
  if (!tokenVariables.includes(variable)) {
    fail(`TypeScript token metadata is missing ${variable}`);
  }
}

for (const [variable, value] of tokenCssDeclarations) {
  if (variable.startsWith("--sk-color-") && !value.startsWith("oklch(")) {
    fail(`${variable} must use OKLCH in theme.css`);
  }

  if (variable.startsWith("--sk-color-") && /#|rgb\(|hsl\(/i.test(value)) {
    fail(`${variable} must not use hex, rgb, or hsl in theme.css`);
  }
}

for (const variable of ["--sk-color-border-control"]) {
  if (!tokenCssDeclarations.has(variable)) {
    fail(`theme.css is missing ${variable}`);
  }
}

for (const pair of contrastPairs) {
  const [name, foreground, background, minimum] = pair;
  const ratio = contrastRatio(readOklch(foreground), readOklch(background));
  if (ratio < minimum) {
    fail(`${name} contrast ${ratio.toFixed(2)}:1 is below ${minimum}:1`);
  }
}

if (/spacingTokens[\s\S]*?"[0-9.]+rem"/.test(tokenSource)) {
  fail("TypeScript spacing token metadata must not duplicate raw rem values");
}

if (/radiusTokens[\s\S]*?"[0-9.]+rem"/.test(tokenSource)) {
  fail("TypeScript radius token metadata must not duplicate raw rem values");
}

for (const motionVariable of requiredMotionVariables) {
  if (!tokenCss.includes(`${motionVariable}:`)) {
    fail(`theme.css is missing ${motionVariable}`);
  }
}

if (tokenCss.includes("--sk-motion-standard:")) {
  fail("theme.css must split motion duration and easing tokens");
}

if (tokenDocs.includes("--sk-motion-standard")) {
  fail("docs/tokens.md must document split motion tokens");
}

validatePrimitiveContracts({ primitiveSource, primitiveDocs, primitiveCss, tokenCssDeclarations, fail });

const primitiveManifest = readJson("packages/primitives/package.json");
if (primitiveManifest.exports?.["./styles.css"] !== "./dist/styles.css") {
  fail("@sanchika/primitives must export ./styles.css");
}

const tokenManifest = readJson("packages/tokens/package.json");
if (tokenManifest.exports?.["./theme.css"] !== "./dist/theme.css") {
  fail("@sanchika/tokens must export ./theme.css");
}

validatePatternContracts({ patternSource, patternDocs, fail });
validateTrustBriefContracts({ patternSource, patternDocs, aiNativeToolingDocs, fail });

for (const requiredConsumerModeFragment of [
  "external/operational-saas",
  'consumerModes: ["axal/workspace", "tools/local-artifact", "external/operational-saas"]',
  'consumerModes: ["pack/local-utility", "tools/local-artifact", "external/operational-saas"]',
  'consumerModes: ["complyeaze/core", "external/operational-saas"]',
]) {
  if (!patternSource.includes(requiredConsumerModeFragment)) {
    fail(`pattern package must include ${requiredConsumerModeFragment}`);
  }
}

for (const patternTypeExport of [
  "PatternA11yCheck",
  "PatternA11yCheckFor",
  "PatternA11yCriterion",
  "PatternA11ySourceReference",
  "PatternName",
  "PatternProgrammaticStatus",
  "PatternProgrammaticStatusFor",
  "PatternSpecFor",
  "PatternSlotName",
  "PatternSlotNameFor",
  "PatternStateName",
  "PatternStateNameFor",
  "PatternStateFor",
  "PatternStateRequiredSlotNameFor",
  "TrustBrief",
  "TrustBriefValidationIssue",
  "validateTrustBrief",
  "DesignBrief",
  "DesignBriefValidationIssue",
  "validateDesignBrief",
  "EvidenceLoop",
  "EvidenceLoopAdoptionEvidence",
  "EvidenceLoopDecision",
  "EvidenceLoopRenderEvidence",
  "EvidenceLoopValidationIssue",
  "validateEvidenceLoop",
]) {
  if (!patternSource.includes(patternTypeExport)) {
    fail(`pattern package must export ${patternTypeExport}`);
  }
  if (!patternDocs.includes(patternTypeExport)) {
    fail(`docs/patterns.md must document ${patternTypeExport}`);
  }
}

const normalizedPatternDocs = patternDocs.replace(/\s+/g, " ").toLowerCase();
for (const requiredPatternDocFragment of [
  "Pattern state exemplars",
  "concrete `role`",
  "`aria-live` markup",
  "every required pattern state",
  "required slots",
  "visible signals",
  "every required state that declares `programmaticStatus`",
]) {
  if (!normalizedPatternDocs.includes(requiredPatternDocFragment.toLowerCase())) {
    fail(`docs/patterns.md must document ${requiredPatternDocFragment}`);
  }
}

for (const requiredGalleryStatusFragment of [
  "renderPatternStateExemplars",
  "pattern.requiredStates.flatMap",
  "state.requiredVisibleSignals",
  "state.programmaticStatus",
  "data-sk-visible-signal",
  "data-sk-slot",
]) {
  if (!gallerySource.includes(requiredGalleryStatusFragment)) {
    fail(`gallery source must implement ${requiredGalleryStatusFragment}`);
  }
}

for (const sourceUrl of [
  "https://www.w3.org/TR/css-variables-1/",
  "https://www.w3.org/community/design-tokens/",
]) {
  if (!tokenDocs.includes(sourceUrl)) {
    fail(`docs/tokens.md must reference ${sourceUrl}`);
  }
}

for (const sourceUrl of ["https://www.w3.org/TR/WCAG22/", "https://www.w3.org/WAI/ARIA/apg/"]) {
  if (!accessibilityDocs.includes(sourceUrl)) {
    fail(`docs/accessibility.md must reference ${sourceUrl}`);
  }
}

for (const sourceUrl of [
  "https://docs.npmjs.com/trusted-publishers/",
  "https://docs.npmjs.com/generating-provenance-statements/",
  "https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository",
]) {
  if (!releasePolicy.includes(sourceUrl)) {
    fail(`docs/release-policy.md must reference ${sourceUrl}`);
  }
}

if (!readText("CONTRIBUTING.md").includes("PRODUCT.md")) {
  fail("CONTRIBUTING.md must tell contributors to read PRODUCT.md");
}

const pullRequestTemplate = requireText(".github/PULL_REQUEST_TEMPLATE.md");
if (pullRequestTemplate && !pullRequestTemplate.includes("PRODUCT.md")) {
  fail("Sanchika PR template must reference PRODUCT.md");
}

for (const requiredClaudeFragment of [
  "@AGENTS.md",
  "independent public design-system SDK repository",
  "pnpm review:gate",
  "Review gate",
  "GraphQL `reviewThreads`",
]) {
  if (!claudeGuide.includes(requiredClaudeFragment)) {
    fail(`CLAUDE.md must include ${requiredClaudeFragment}`);
  }
}

for (const adoptionChecklistPath of [
  "docs/adoption-evidence.md",
  "docs/adoption-complyeaze.md",
  "docs/adoption-axal.md",
  "docs/adoption-pack.md",
  "docs/adoption-tools.md",
  "docs/adoption-external.md",
]) {
  if (!readText("CONTRIBUTING.md").includes(adoptionChecklistPath)) {
    fail(`CONTRIBUTING.md must reference ${adoptionChecklistPath}`);
  }
  if (pullRequestTemplate && !pullRequestTemplate.includes(adoptionChecklistPath)) {
    fail(`Sanchika PR template must reference ${adoptionChecklistPath}`);
  }
}

const requiredVerificationCommands = [
  "pnpm validate",
  "pnpm typecheck",
  "pnpm build",
  "pnpm typecheck:api",
  "pnpm artifact:check",
  "pnpm consumer:check",
  "pnpm smoke",
  "pnpm workflow:preflight",
  "pnpm review:gate",
  "pnpm publish:tarball-check",
  "pnpm verify",
];
for (const command of requiredVerificationCommands) {
  if (!agentGuide.includes(command)) {
    fail(`AGENTS.md must list ${command}`);
  }
  if (!readText("CONTRIBUTING.md").includes(command)) {
    fail(`CONTRIBUTING.md must list ${command}`);
  }
  if (pullRequestTemplate && !pullRequestTemplate.includes(command)) {
    fail(`Sanchika PR template must list ${command}`);
  }
}

if (!readText("README.md").includes("tools.complyeaze.com")) {
  fail("README must document Tools as the fourth consumer");
}

for (const requiredExternalAdoptionFragment of [
  "External operational SaaS adopters",
  "docs/adoption-external.md",
  "private and unpublished in V0",
]) {
  if (!readText("README.md").includes(requiredExternalAdoptionFragment)) {
    fail(`README must document external adoption with ${requiredExternalAdoptionFragment}`);
  }
}

for (const requiredReadmeCommand of ["pnpm artifact:check", "pnpm workflow:preflight", "pnpm publish:tarball-check"]) {
  if (!readText("README.md").includes(requiredReadmeCommand)) {
    fail(`README must list ${requiredReadmeCommand}`);
  }
}

if (!readText("README.md").includes("docs/adoption-evidence.md")) {
  fail("README must link adoption evidence template");
}

for (const requiredAdoptionEvidenceFragment of [
  "Sanchika commit",
  "Package link or artifact method",
  "Desktop browser review",
  "Mobile browser review",
  "Rollback files",
  "No production-readiness claim",
]) {
  if (!readText("docs/adoption-evidence.md").includes(requiredAdoptionEvidenceFragment)) {
    fail(`docs/adoption-evidence.md must include ${requiredAdoptionEvidenceFragment}`);
  }
}

for (const requiredRuntimeFragment of [
  "## Runtime Prerequisites",
  "Node 24+",
  "pnpm@10.28.2",
  "npm Trusted Publishing minimum",
  "supported Sanchika package",
  "runtime floor",
]) {
  if (!readText("README.md").includes(requiredRuntimeFragment)) {
    fail(`README must document ${requiredRuntimeFragment}`);
  }
}

for (const packageName of expectedPackages) {
  const packageReadme = requireText(`packages/${packageName}/README.md`);
  for (const requiredPackageReadmeFragment of [
    "## Runtime And Status",
    "private and unpublished",
    'engines.node: ">=24"',
    "Do not lower the package runtime floor",
    "## License And Marks",
    "Source code is Apache-2.0",
    "not licensed for endorsement",
  ]) {
    if (packageReadme && !packageReadme.includes(requiredPackageReadmeFragment)) {
      fail(`packages/${packageName}/README.md must include ${requiredPackageReadmeFragment}`);
    }
  }
}

const galleryManifest = readJson("packages/gallery/package.json");
const galleryTypecheckConfig = readText("packages/gallery/tsconfig.typecheck.json");
if (galleryManifest.scripts?.typecheck !== "tsc -p tsconfig.typecheck.json --noEmit") {
  fail("@sanchika/gallery typecheck must use tsconfig.typecheck.json");
}

for (const requiredGalleryTypecheckFragment of [
  '"@sanchika/tokens": ["../tokens/src/index.ts"]',
  '"@sanchika/primitives": ["../primitives/src/index.ts"]',
  '"@sanchika/patterns": ["../patterns/src/index.ts"]',
]) {
  if (!galleryTypecheckConfig.includes(requiredGalleryTypecheckFragment)) {
    fail(`packages/gallery/tsconfig.typecheck.json must include ${requiredGalleryTypecheckFragment}`);
  }
}

for (const requiredGalleryDocumentFragment of [
  "package-specifier HTML review document",
  "not a directly openable browser artifact",
  "resolves `@sanchika/*` CSS hrefs",
]) {
  if (!galleryReadme.includes(requiredGalleryDocumentFragment)) {
    fail(`packages/gallery/README.md must clarify ${requiredGalleryDocumentFragment}`);
  }
  if (!readText("README.md").includes(requiredGalleryDocumentFragment)) {
    fail(`README.md must clarify ${requiredGalleryDocumentFragment}`);
  }
}

if (/package link or packed artifact|Link or pack|package link\/artifact method/i.test(complyeazeAdoptionDocs)) {
  fail("docs/adoption-complyeaze.md must not present packed artifacts as a supported V0 adoption path");
}

if (!complyeazeAdoptionDocs.includes("pnpm publish:tarball-check")) {
  fail("docs/adoption-complyeaze.md must name the publish:tarball-check gate before tarball adoption");
}

for (const requiredLocalLinkFragment of ["pnpm consumer:check", "local package-directory links"]) {
  if (!complyeazeAdoptionDocs.includes(requiredLocalLinkFragment)) {
    fail(`docs/adoption-complyeaze.md must include ${requiredLocalLinkFragment}`);
  }
}

for (const requiredPackageApiFragment of ["pnpm typecheck:api", "public package-name TypeScript imports"]) {
  if (!complyeazeAdoptionDocs.includes(requiredPackageApiFragment)) {
    fail(`docs/adoption-complyeaze.md must include ${requiredPackageApiFragment}`);
  }
}

for (const requiredTarballPostureFragment of [
  "validated packaging smoke artifact",
  "not the default V0 adoption path",
  "consumer-specific adoption plan",
  "tarball version and checksum",
]) {
  if (!complyeazeAdoptionDocs.includes(requiredTarballPostureFragment)) {
    fail(`docs/adoption-complyeaze.md must document packed tarballs as ${requiredTarballPostureFragment}`);
  }
}

for (const requiredArchitectureTarballFragment of [
  "packed tarballs are verified by",
  "`pnpm publish:tarball-check`",
  "consumer-specific adoption plan approves",
  "that artifact path",
]) {
  if (!architectureDocs.includes(requiredArchitectureTarballFragment)) {
    fail(`docs/architecture.md must document ${requiredArchitectureTarballFragment}`);
  }
}

if (architectureDocs.includes("packed tarball adoption remains unsupported until workspace dependency rewriting is proven")) {
  fail("docs/architecture.md must not use stale packed-tarball unsupported-until-proven wording");
}

for (const [consumerName, docs] of Object.entries(adoptionDocs)) {
  for (const heading of ["## Entry Criteria", "## Completion Evidence"]) {
    if (!docs.includes(heading)) {
      fail(`${consumerName} adoption docs must include ${heading}`);
    }
  }
}

for (const [consumerName, requiredFragment] of [
  ["Axal", "ComplyEaze completion evidence"],
  ["Pack", "Axal completion evidence"],
  ["Tools", "Pack completion evidence"],
]) {
  if (!adoptionDocs[consumerName].includes(requiredFragment)) {
    fail(`${consumerName} adoption docs must require ${requiredFragment}`);
  }
}

for (const requiredExternalFragment of [
  "independent operational SaaS teams",
  "public source, not a published npm release",
  "local package-directory link",
  "approved packed artifact",
  "direct imports from `packages/*/src` are not allowed",
]) {
  if (!adoptionDocs.External.includes(requiredExternalFragment)) {
    fail(`External adoption docs must include ${requiredExternalFragment}`);
  }
}

for (const [consumerName, docs] of Object.entries(adoptionDocs)) {
  const normalizedDocs = normalizeProse(docs);

  for (const requiredEvidenceFragment of [
    "package link or artifact method",
    "changed files",
    "rollback files",
    "tarball version and checksum",
  ]) {
    if (!normalizedDocs.includes(requiredEvidenceFragment)) {
      fail(`${consumerName} adoption docs must require ${requiredEvidenceFragment}`);
    }
  }
}

validateCiWorkflow({ ciWorkflow, fail });
validatePagesWorkflow({ pagesWorkflow, fail });
validatePagesSmokeWorkflow({ pagesSmokeWorkflow, fail });

const retentionFailureMessage =
  "Pages workflow ordinary build evidence retention-days must be a literal integer from 1 to 7";
const pagesArtifactPath = "          path: dist/gallery";
for (const [name, retentionYaml, shouldFail] of [
  ["unquoted lower bound", "          retention-days: 1", false],
  ["unquoted upper bound", "          retention-days: 7", false],
  ["double-quoted value", '          retention-days: "7"', false],
  ["single-quoted value", "          retention-days: '1'", false],
  ["commented value", "          # retention-days: 99", false],
  ["expression value", "          retention-days: ${{ inputs.retention-days }}", true],
  ["malformed value", "          retention-days: seven", true],
  ["empty value", "          retention-days:", true],
  ["zero", "          retention-days: 0", true],
  ["negative value", "          retention-days: -1", true],
  ["above upper bound", "          retention-days: 8", true],
  [
    "unrelated safe field cannot mask unsafe retention",
    "          retention-days: 8\n          unrelated-retention-days: 7",
    true,
  ],
  [
    "duplicate retention cannot mask unsafe retention",
    "          retention-days: 7\n          retention-days: 8",
    true,
  ],
]) {
  const fixtureFailures = [];
  validatePagesWorkflow({
    pagesWorkflow: pagesWorkflow.replace(
      pagesArtifactPath,
      `${pagesArtifactPath}\n${retentionYaml}`,
    ),
    fail: (message) => fixtureFailures.push(message),
  });
  const retentionFailed = fixtureFailures.includes(retentionFailureMessage);
  if (retentionFailed !== shouldFail) {
    fail(
      `Pages retention fixture ${name} must ${shouldFail ? "fail" : "pass"} validation`,
    );
  }
  for (const unexpectedFailure of fixtureFailures.filter(
    (message) => message !== retentionFailureMessage,
  )) {
    fail(`Pages retention fixture ${name} failed unexpectedly: ${unexpectedFailure}`);
  }
}

for (const requiredHostingFragment of [
  "sanchika.complyeaze.com",
  "The authoritative public host is `sanchika.complyeaze.com`",
  "GitHub Pages",
  "pnpm gallery:build",
  "pnpm gallery:check",
  ".github/workflows/pages-smoke.yml",
  "node scripts/check-pages-smoke.mjs",
  "pnpm pages:smoke",
  "Do not add a `CNAME` file",
  "existing `CNAME` file is ignored",
  "pnpm hosting:domain:check",
  "sanchika.complyeaze.com. CNAME lamemustafa.github.io.",
  "Ongoing live-host checks",
  "https://sanchika.complyeaze.com/",
  "tools.complyeaze.com/sanchika/",
]) {
  if (!normalizeProse(hostingDocs).includes(requiredHostingFragment)) {
    fail(`docs/hosting.md must include ${requiredHostingFragment}`);
  }
}

function activeWorkflowLines(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, ""))
    .filter((line) => line.trim().length > 0);
}

function leadingSpaces(line) {
  return line.match(/^ */)[0].length;
}

function activeWorkflowBlock(lines, headerPattern) {
  const start = lines.findIndex((line) => headerPattern.test(line));
  if (start < 0) return [];
  const indent = leadingSpaces(lines[start]);
  let end = start + 1;
  while (end < lines.length && leadingSpaces(lines[end]) > indent) end += 1;
  return lines.slice(start, end);
}

function normalizeYamlScalar(value) {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function validateReviewGateWorkflow(source, reportFailure) {
  const lines = activeWorkflowLines(source);
  const activeSource = lines.join("\n");

  function requireEventTypes(event, expectedTypes) {
    const block = activeWorkflowBlock(lines, new RegExp(`^  ${event}:\\s*$`));
    const typesLine = block.find((line) => /^    types:\s*/.test(line));
    const actualTypes = typesLine
      ?.replace(/^    types:\s*\[/, "")
      .replace(/\]\s*$/, "")
      .split(",")
      .map((value) => normalizeYamlScalar(value))
      .sort();
    if (JSON.stringify(actualTypes) !== JSON.stringify([...expectedTypes].sort())) {
      reportFailure(`Review gate ${event} must use exactly ${expectedTypes.join(", ")}`);
    }
  }

  requireEventTypes("pull_request_target", [
    "opened",
    "reopened",
    "synchronize",
    "ready_for_review",
    "edited",
  ]);
  requireEventTypes("pull_request_review", ["submitted", "edited", "dismissed"]);
  requireEventTypes("pull_request_review_comment", ["created", "edited", "deleted"]);

  const scheduleBlock = activeWorkflowBlock(lines, /^  schedule:\s*$/);
  const reviewGateCrons = scheduleBlock
    .map((line) => line.match(/^\s*-\s+cron:\s+(.+?)\s*$/)?.[1])
    .filter(Boolean)
    .map(normalizeYamlScalar);
  if (reviewGateCrons.length !== 1 || reviewGateCrons[0] !== "23 4 * * *") {
    reportFailure("Review gate must use one daily reconciliation cron and no frequent polling");
  }

  if (!lines.some((line) => /^permissions:\s*\{\}\s*$/.test(line))) {
    reportFailure("Review gate must disable permissions by default");
  }

  const selectionJob = activeWorkflowBlock(lines, /^  select-pull-requests:\s*$/);
  const selectionPermissions = activeWorkflowBlock(selectionJob, /^    permissions:\s*$/)
    .slice(1)
    .map((line) => line.trim())
    .sort();
  if (JSON.stringify(selectionPermissions) !== JSON.stringify(["pull-requests: read"])) {
    reportFailure("Review gate pull-request selection must have only pull-requests: read");
  }
  const selectionCondition = activeWorkflowBlock(selectionJob, /^    if:\s*>-\s*$/)
    .slice(1)
    .map((line) => line.trim())
    .join(" ");
  const expectedSelectionCondition =
    "github.event_name == 'schedule' || github.event_name == 'pull_request_target' || github.event.pull_request.head.repo.full_name == github.repository";
  if (selectionCondition !== expectedSelectionCondition) {
    reportFailure("Review gate pull-request selection must use the trusted event and fork guard");
  }

  const selectionStep = activeWorkflowBlock(
    selectionJob,
    /^      - name:\s+Select current pull requests\s*$/,
  );
  const selectionEnv = activeWorkflowBlock(selectionStep, /^        env:\s*$/)
    .slice(1)
    .map((line) => line.trim())
    .sort();
  const expectedSelectionEnv = [
    "EVENT_NAME: ${{ github.event_name }}",
    "GH_TOKEN: ${{ github.token }}",
    "PR_NUMBER: ${{ github.event.pull_request.number }}",
  ].sort();
  if (JSON.stringify(selectionEnv) !== JSON.stringify(expectedSelectionEnv)) {
    reportFailure("Review gate pull-request selection must use only trusted event inputs");
  }
  const selectionRun = activeWorkflowBlock(selectionStep, /^        run:\s*\|[-+]?\s*$/)
    .slice(1)
    .join("\n");
  for (const requiredSelectionRunFragment of [
    'if [ "${EVENT_NAME}" = "schedule" ]; then',
    'gh pr list --repo "${GITHUB_REPOSITORY}" --state open --limit 1000 --json number',
    '[[ ! "${PR_NUMBER}" =~ ^[1-9][0-9]*$ ]]',
    'pull_requests="[${PR_NUMBER}]"',
  ]) {
    if (!selectionRun.includes(requiredSelectionRunFragment)) {
      reportFailure(
        `Review gate pull-request selection run block must include ${requiredSelectionRunFragment}`,
      );
    }
  }

  const syncJob = activeWorkflowBlock(lines, /^  review-gate:\s*$/);
  const syncPermissions = activeWorkflowBlock(syncJob, /^    permissions:\s*$/)
    .slice(1)
    .map((line) => line.trim())
    .sort();
  const expectedSyncPermissions = [
    "contents: read",
    "pull-requests: read",
    "statuses: write",
  ].sort();
  if (JSON.stringify(syncPermissions) !== JSON.stringify(expectedSyncPermissions)) {
    reportFailure(
      "Review gate status sync must use only contents: read, pull-requests: read, and statuses: write",
    );
  }
  if (!syncJob.some((line) => line === "    needs: select-pull-requests")) {
    reportFailure("Review gate status sync must depend on pull-request selection");
  }
  if (
    !syncJob.some(
      (line) => line === "    if: needs.select-pull-requests.outputs.has_targets == 'true'",
    )
  ) {
    reportFailure("Review gate status sync must skip an empty pull-request matrix");
  }
  const matrixBlock = activeWorkflowBlock(syncJob, /^      matrix:\s*$/);
  if (
    !matrixBlock.some(
      (line) =>
        line.trim() ===
        "pr: ${{ fromJSON(needs.select-pull-requests.outputs.pull_requests) }}",
    )
  ) {
    reportFailure("Review gate status sync matrix must contain the selected pull requests");
  }
  const concurrencyBlock = activeWorkflowBlock(syncJob, /^    concurrency:\s*$/)
    .slice(1)
    .map((line) => line.trim())
    .sort();
  const expectedConcurrency = [
    "cancel-in-progress: true",
    "group: review-gate-${{ github.workflow }}-${{ matrix.pr }}",
  ].sort();
  if (JSON.stringify(concurrencyBlock) !== JSON.stringify(expectedConcurrency)) {
    reportFailure("Review gate status sync must use cancellable PR-specific concurrency");
  }

  const syncStep = activeWorkflowBlock(
    syncJob,
    /^      - name:\s+Sync current-head review status\s*$/,
  );
  const syncRun = activeWorkflowBlock(syncStep, /^        run:\s*\|[-+]?\s*$/)
    .slice(1)
    .join("\n");
  for (const requiredSyncRunFragment of [
    'args+=(--pr "${PR_NUMBER}")',
    "node scripts/sync-review-gate-status.mjs",
    "--strict-head-review",
    "--wait-head-review-ms 0",
    "--required-review-author chatgpt-codex-connector",
    "--allow-missing-head-review",
  ]) {
    if (!syncRun.includes(requiredSyncRunFragment)) {
      reportFailure(`Review gate status sync run block must include ${requiredSyncRunFragment}`);
    }
  }
  const scheduledSkipPendingBlock =
    'if [ "${EVENT_NAME}" = "schedule" ]; then\n            args+=(--skip-pending-status)\n          fi';
  if (
    !syncRun.includes(scheduledSkipPendingBlock) ||
    syncRun.match(/--skip-pending-status/g)?.length !== 1
  ) {
    reportFailure(
      "Review gate status sync must skip pending writes only during scheduled repair",
    );
  }
  const syncEnv = activeWorkflowBlock(syncStep, /^        env:\s*$/)
    .slice(1)
    .map((line) => line.trim())
    .sort();
  const expectedSyncEnv = [
    "EVENT_NAME: ${{ github.event_name }}",
    "GH_TOKEN: ${{ github.token }}",
    "PR_NUMBER: ${{ matrix.pr }}",
    "RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}",
  ].sort();
  if (JSON.stringify(syncEnv) !== JSON.stringify(expectedSyncEnv)) {
    reportFailure("Review gate status sync must use only trusted matrix and run inputs");
  }

  const checkoutIndexes = lines
    .map((line, index) => (/^\s+uses:\s+actions\/checkout@/.test(line) ? index : -1))
    .filter((index) => index >= 0);
  if (checkoutIndexes.length !== 1) {
    reportFailure("Review gate must contain exactly one active checkout step");
  } else {
    const checkoutIndex = checkoutIndexes[0];
    if (
      lines[checkoutIndex].trim() !==
      "uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0"
    ) {
      reportFailure("Review gate checkout action must remain pinned to the approved commit");
    }
    let stepStart = checkoutIndex;
    while (stepStart > 0 && !/^\s*-\s+(?:name|uses):/.test(lines[stepStart])) stepStart -= 1;
    const stepIndent = leadingSpaces(lines[stepStart]);
    let stepEnd = checkoutIndex + 1;
    while (stepEnd < lines.length && leadingSpaces(lines[stepEnd]) > stepIndent) stepEnd += 1;
    const checkoutStep = lines.slice(stepStart, stepEnd);
    const withIndex = checkoutStep.findIndex((line) => line.trim() === "with:");
    const withIndent = withIndex >= 0 ? leadingSpaces(checkoutStep[withIndex]) : -1;
    let withEnd = withIndex + 1;
    while (
      withIndex >= 0 &&
      withEnd < checkoutStep.length &&
      leadingSpaces(checkoutStep[withEnd]) > withIndent
    ) {
      withEnd += 1;
    }
    const withLines = withIndex < 0 ? [] : checkoutStep.slice(withIndex + 1, withEnd);

    for (const [key, expectedValue] of [
      ["repository", "${{ github.repository }}"],
      ["ref", "${{ github.event.repository.default_branch }}"],
      ["persist-credentials", "false"],
    ]) {
      const values = withLines
        .map((line) => line.trim().match(new RegExp(`^${key}:\\s*(.+)$`))?.[1])
        .filter(Boolean)
        .map(normalizeYamlScalar);
      if (values.length !== 1 || values[0] !== expectedValue) {
        reportFailure(`Review gate checkout with.${key} must be exactly ${expectedValue}`);
      }
    }
  }

  for (const forbiddenFragment of [
    "workflow_dispatch:",
    "ref: ${{ github.event.pull_request.head",
    "github.head_ref",
    "github.event.review.commit_id",
    "github.event.review.body",
    "github.event.comment.body",
    "--all-open",
    "sleep ",
  ]) {
    if (activeSource.includes(forbiddenFragment)) {
      reportFailure(`Review gate active workflow must not include ${forbiddenFragment}`);
    }
  }
}

validateReviewGateWorkflow(reviewGateWorkflow, fail);

for (const [name, source] of [
  [
    "fork guard replaced by active env decoy",
    reviewGateWorkflow.replace(
      "      github.event.pull_request.head.repo.full_name == github.repository\n    permissions:",
      "      true\n    env:\n      DECOY: github.event.pull_request.head.repo.full_name == github.repository\n    permissions:",
    ),
  ],
  [
    "untrusted ref with trusted comment decoy",
    reviewGateWorkflow
      .replace(
        "ref: ${{ github.event.repository.default_branch }}",
        "ref: ${{ github.event.review.commit_id }}",
      )
      .concat("\n# ref: ${{ github.event.repository.default_branch }}\n"),
  ],
  [
    "persisted credentials with trusted comment decoy",
    reviewGateWorkflow
      .replace("persist-credentials: false", "persist-credentials: true")
      .concat("\n# persist-credentials: false\n"),
  ],
  [
    "duplicate active checkout ref",
    reviewGateWorkflow.replace(
      "ref: ${{ github.event.repository.default_branch }}",
      "ref: ${{ github.event.repository.default_branch }}\n          ref: ${{ github.event.repository.default_branch }}",
    ),
  ],
  [
    "trusted checkout values present only under env",
    reviewGateWorkflow.replace(
      "        with:\n          repository: ${{ github.repository }}\n          ref: ${{ github.event.repository.default_branch }}\n          persist-credentials: false",
      "        with:\n          repository: ${{ github.repository }}\n        env:\n          ref: ${{ github.event.repository.default_branch }}\n          persist-credentials: false",
    ),
  ],
  [
    "review trigger present only in comments",
    reviewGateWorkflow.replace(
      "  pull_request_review:\n    types: [submitted, edited, dismissed]",
      "  # pull_request_review:\n  #   types: [submitted, edited, dismissed]",
    ),
  ],
  [
    "skip-pending applied outside scheduled repair",
    reviewGateWorkflow.replace(
      '          if [ "${EVENT_NAME}" = "schedule" ]; then\n            args+=(--skip-pending-status)\n          fi',
      "          args+=(--skip-pending-status)",
    ),
  ],
]) {
  const fixtureFailures = [];
  validateReviewGateWorkflow(source, (message) => fixtureFailures.push(message));
  if (fixtureFailures.length === 0) {
    fail(`Review gate workflow fixture ${name} must fail validation`);
  }
}

const harmlessReviewGateFormattingFailures = [];
validateReviewGateWorkflow(
  reviewGateWorkflow
    .replace("persist-credentials: false", 'persist-credentials: "false"')
    .replace(
      "ref: ${{ github.event.repository.default_branch }}",
      'ref: "${{ github.event.repository.default_branch }}"',
    ),
  (message) => harmlessReviewGateFormattingFailures.push(message),
);
if (harmlessReviewGateFormattingFailures.length > 0) {
  fail(
    `Review gate workflow harmless quoted scalars must pass validation: ${harmlessReviewGateFormattingFailures.join("; ")}`,
  );
}

for (const [path, requiredReviewGateScriptFragment] of [
  ["scripts/sync-review-gate-status.mjs", "No active review blockers; current-head Codex review missing."],
  ["scripts/sync-review-gate-status.mjs", "runReviewGate(target)"],
  ["scripts/sync-review-gate-status.mjs", "--expected-head"],
  ["scripts/sync-review-gate-status.mjs", "context=Review gate"],
  ["scripts/check-pr-review-gate.mjs", "review-gate:allowed-missing-head-review"],
  ["scripts/check-pr-review-gate.mjs", "Expected head"],
  ["scripts/check-pr-review-gate.mjs", "authorAssociation"],
  ["scripts/check-pr-review-gate.mjs", "REVIEW_BLOCKING_AUTHOR_ASSOCIATIONS"],
  ["scripts/check-pr-review-gate.mjs", "blockingReview: previous.blockingReview"],
  ["scripts/check-pr-review-gate.mjs", "previous.blockingReview?.commit?.oid === headRefOid"],
  ["scripts/validation/review-gate-fixtures.mjs", "owner-requested-changes-then-comment.json"],
  ["scripts/validation/review-gate-fixtures.mjs", "owner-requested-changes-then-approval.json"],
  ["scripts/validation/review-gate-fixtures.mjs", "current-head-requested-changes-then-stale-approval.json"],
  ["scripts/validation/review-gate-fixtures.mjs", "missing-current-head-codex-review.json"],
  ["scripts/validation/review-gate-sync-fixtures.mjs", "write success for missing Codex review"],
  ["scripts/validation/review-gate-sync-fixtures.mjs", "Expected head head-sha"],
]) {
  if (!readText(path).includes(requiredReviewGateScriptFragment)) {
    fail(`${path} must include ${requiredReviewGateScriptFragment}`);
  }
}

const securityText = readText("SECURITY.md").toLowerCase().replace(/\s+/g, " ");
if (!securityText.includes("private vulnerability reporting")) {
  fail("SECURITY.md must reference GitHub private vulnerability reporting");
}

for (const requiredSecurityFragment of ["lamemustafa", "Post-Create Checklist"]) {
  if (!readText("SECURITY.md").includes(requiredSecurityFragment)) {
    fail(`SECURITY.md must include ${requiredSecurityFragment}`);
  }
}

for (const requiredReleaseFragment of [
  "lamemustafa/sanchika",
  ".github/workflows/publish.yml",
  "ubuntu-latest",
  "npm CLI 11.5.1 or later",
  "Node 22.14.0 or later",
  "pnpm publish:check",
  "pnpm publish:tarball-check",
  "npm publish",
  "workspace:*",
  "id-token: write",
  "registry-url",
  "https://registry.npmjs.org",
  "package-manager-cache: false",
  "NPM_TOKEN",
  "NODE_AUTH_TOKEN",
  "tag push only",
  "pull requests",
  "branch pushes",
  "scheduled workflows",
  "workflow-run chaining",
  "--provenance",
  "pnpm install --frozen-lockfile --ignore-scripts",
  "pnpm run verify",
  "pnpm publish:check",
  "pnpm publish:tarball-check",
  "npm publish ./packages/tokens --provenance",
  "npm publish ./packages/primitives --provenance",
  "npm publish ./packages/patterns --provenance",
  "npm publish ./packages/gallery --provenance",
  "private orchestration root",
]) {
  if (!releasePolicy.includes(requiredReleaseFragment)) {
    fail(`docs/release-policy.md must include ${requiredReleaseFragment}`);
  }
}

for (const requiredGithubSetupFragment of [
  "lamemustafa/sanchika",
  "public",
  "Do not auto-add a README, license, or .gitignore",
  "gh repo create lamemustafa/sanchika",
  "--disable-wiki",
  "pnpm verify",
  "pnpm publish:tarball-check",
  "git push -u origin HEAD:master",
  "pnpm github:ruleset",
  "pnpm github:verify",
  "--required-check",
  "--owner-bypass-id",
  "Review gate",
  "private vulnerability reporting",
  "branch ruleset",
  "required status checks",
  "no long-lived npm publish tokens",
]) {
  if (!normalizeProse(githubSetupDocs).includes(requiredGithubSetupFragment)) {
    fail(`docs/github-repository-setup.md must include ${requiredGithubSetupFragment}`);
  }
}

for (const requiredRepositorySettingsFragment of [
  "Default branch: `master`",
  "private vulnerability reporting",
  "branch ruleset",
  "required status checks",
  "Single-Maintainer Bootstrap",
  "owner-bypass path",
  "Review gate",
  "Require pull requests before merging",
  "Require conversation resolution",
  "Block force pushes",
  "Block branch deletion",
  "Disable wiki",
  "blank issues disabled",
  "CODEOWNERS",
  "Dependabot",
  "pnpm github:ruleset",
  "pnpm github:verify",
  "--required-check",
  "--owner-bypass-id",
]) {
  if (!repositorySettingsDocs.includes(requiredRepositorySettingsFragment)) {
    fail(`docs/repository-settings.md must include ${requiredRepositorySettingsFragment}`);
  }
}

for (const requiredRulesetFragment of [
  "Protect master",
  'const reviewGateCheck = { context: "Review gate" };',
  "refs/heads/master",
  "pull_request",
  "required_status_checks",
  "Review gate",
  "non_fast_forward",
  "deletion",
  "required_review_thread_resolution",
  "require_code_owner_review",
  "required_approving_review_count",
  "required_approving_review_count: 0",
  "require_code_owner_review: false",
  "dismiss_stale_reviews_on_push",
  "strict_required_status_checks_policy",
  "do_not_enforce_on_create",
  "allowed_merge_methods",
  "squash",
  "owner-bypass-id",
  "required-check",
  "review-gate-integration-id",
  "integration_id",
]) {
  if (!githubRulesetSource.includes(requiredRulesetFragment)) {
    fail(`github:ruleset script must include ${requiredRulesetFragment}`);
  }
}

for (const requiredGithubStateCheckFragment of [
  "lamemustafa/sanchika",
  "github:verify",
  "owner-bypass-id",
  "bypass_actors",
  "bypass_mode",
  "git ls-remote",
  "gh repo view",
  "deleteBranchOnMerge",
  "defaultBranchRef",
  "hasIssuesEnabled",
  "hasWikiEnabled",
  "squashMergeAllowed",
  "mergeCommitAllowed",
  "rebaseMergeAllowed",
  "repositoryTopics",
  "Protect master",
  "required_status_checks",
  "Review gate",
  "review-gate-integration-id",
  "integration_id",
  "required_review_thread_resolution",
  "single-maintainer bootstrap ruleset must not require approving reviews",
  "single-maintainer bootstrap ruleset must not require CODEOWNERS review",
  "non_fast_forward",
  "self-test",
]) {
  if (!githubStateCheckSource.includes(requiredGithubStateCheckFragment)) {
    fail(`github:verify script must include ${requiredGithubStateCheckFragment}`);
  }
}

if (!codeowners.includes("* @lamemustafa")) {
  fail(".github/CODEOWNERS must assign repository ownership to @lamemustafa");
}

for (const requiredCodeownersFragment of [
  "Single-maintainer bootstrap owner",
  "owner-authored PRs",
  "owner-bypass path",
]) {
  if (!codeowners.includes(requiredCodeownersFragment)) {
    fail(`.github/CODEOWNERS must document ${requiredCodeownersFragment}`);
  }
}

for (const [path, text] of [
  [".github/ISSUE_TEMPLATE/config.yml", issueTemplateConfig],
  [".github/ISSUE_TEMPLATE/bug_report.yml", bugIssueTemplate],
  [".github/ISSUE_TEMPLATE/feature_request.yml", featureIssueTemplate],
  [".github/ISSUE_TEMPLATE/conduct_report.yml", conductIssueTemplate],
  [".github/ISSUE_TEMPLATE/question.yml", questionIssueTemplate],
]) {
  for (const requiredFragment of ["PAN", "GSTIN", "Aadhaar", "credentials", "private vulnerability reporting"]) {
    if (!text.includes(requiredFragment)) {
      fail(`${path} must warn about ${requiredFragment}`);
    }
  }
}

if (!issueTemplateConfig.includes("blank_issues_enabled: false")) {
  fail(".github/ISSUE_TEMPLATE/config.yml must disable blank issues");
}

for (const requiredDependabotFragment of [
  "multi-ecosystem-groups:",
  "sanchika-dependency-hygiene",
  "multi-ecosystem-group: sanchika-dependency-hygiene",
  "package-ecosystem: npm",
  "package-ecosystem: github-actions",
  "directory: /",
  "interval: monthly",
  "patterns:",
  '- "*"',
]) {
  if (!dependabotConfig.includes(requiredDependabotFragment)) {
    fail(`.github/dependabot.yml must include ${requiredDependabotFragment}`);
  }
}

for (const requiredConductFragment of ["Code of Conduct", "private", "harassment", "sensitive data"]) {
  if (!codeOfConduct.includes(requiredConductFragment)) {
    fail(`CODE_OF_CONDUCT.md must include ${requiredConductFragment}`);
  }
}

for (const requiredConductRouteFragment of ["conduct report issue template", "non-sensitive conduct concerns"]) {
  if (!codeOfConduct.includes(requiredConductRouteFragment)) {
    fail(`CODE_OF_CONDUCT.md must include ${requiredConductRouteFragment}`);
  }
  if (!conductIssueTemplate.includes(requiredConductRouteFragment)) {
    fail(`.github/ISSUE_TEMPLATE/conduct_report.yml must include ${requiredConductRouteFragment}`);
  }
}

for (const requiredSensitiveConductFragment of [
  "security@complyeaze.com",
  "Sanchika conduct report",
  "sensitive conduct concerns",
]) {
  if (!codeOfConduct.includes(requiredSensitiveConductFragment)) {
    fail(`CODE_OF_CONDUCT.md must include ${requiredSensitiveConductFragment}`);
  }
  if (!supportDocs.includes(requiredSensitiveConductFragment)) {
    fail(`SUPPORT.md must include ${requiredSensitiveConductFragment}`);
  }
  if (!conductIssueTemplate.includes(requiredSensitiveConductFragment)) {
    fail(`.github/ISSUE_TEMPLATE/conduct_report.yml must include ${requiredSensitiveConductFragment}`);
  }
}

for (const requiredConductConfigFragment of ["Sensitive conduct report", "security@complyeaze.com"]) {
  if (!issueTemplateConfig.includes(requiredConductConfigFragment)) {
    fail(`.github/ISSUE_TEMPLATE/config.yml must include ${requiredConductConfigFragment}`);
  }
}

for (const requiredSupportFragment of [
  "Support",
  "question issue template",
  "tokens, primitives, patterns, gallery",
  "ComplyEaze app support",
  "Pack portal debugging",
  "tax or legal advice",
  "private vulnerability reporting",
]) {
  if (!supportDocs.includes(requiredSupportFragment)) {
    fail(`SUPPORT.md must include ${requiredSupportFragment}`);
  }
}

for (const requiredQuestionTemplateFragment of [
  "Question",
  "tokens",
  "primitives",
  "patterns",
  "gallery",
  "adoption guidance",
  "tax, legal, filing",
  "ComplyEaze app",
  "Pack portal",
  "private vulnerability reporting",
]) {
  if (!questionIssueTemplate.includes(requiredQuestionTemplateFragment)) {
    fail(`.github/ISSUE_TEMPLATE/question.yml must include ${requiredQuestionTemplateFragment}`);
  }
}

for (const requiredGovernanceLink of [
  "CODE_OF_CONDUCT.md",
  "SUPPORT.md",
  "docs/github-repository-setup.md",
  "docs/repository-settings.md",
  "docs/hosting.md",
]) {
  if (!readText("README.md").includes(requiredGovernanceLink)) {
    fail(`README.md must link ${requiredGovernanceLink}`);
  }
  if (!contributingDocs.includes(requiredGovernanceLink)) {
    fail(`CONTRIBUTING.md must link ${requiredGovernanceLink}`);
  }
}

for (const requiredPreflightFragment of [
  "expectedRemoteUrl",
  "https://github.com/lamemustafa/sanchika.git",
  "--allow-new-repo-bootstrap",
  "remote.origin.url",
  "remote.origin.pushurl",
]) {
  if (!workflowPreflightSource.includes(requiredPreflightFragment)) {
    fail(`scripts/check-workflow-preflight.mjs must include ${requiredPreflightFragment}`);
  }
}

for (const requiredPackageArtifactFragment of [
  "dependencyFields",
  "dependencies",
  "peerDependencies",
  "optionalDependencies",
  "devDependencies",
  "publishable ${dependencyField}",
]) {
  if (!packageArtifactCheckSource.includes(requiredPackageArtifactFragment)) {
    fail(`scripts/check-package-artifacts.mjs must include ${requiredPackageArtifactFragment}`);
  }
}

for (const requiredPackageManifestValidationFragment of [
  "validatePackagePhase",
  "manifest.private === true",
  "publishable manifest",
  "publishConfig.registry",
  "publishConfig.access",
  "dependencyFields",
  "workspace:",
  "isRealSemver",
]) {
  if (!packageManifestValidationSource.includes(requiredPackageManifestValidationFragment)) {
    fail(`scripts/validation/package-manifests.mjs must include ${requiredPackageManifestValidationFragment}`);
  }
}

for (const requiredTarballCheckFragment of [
  "assertPackedFileList",
  "./validation/tarball-contents.mjs",
  "package/package.json",
  "tarballPath",
  "strict publish manifest check must match package/package.json inside the tarball",
]) {
  if (!packedTarballCheckSource.includes(requiredTarballCheckFragment)) {
    fail(`scripts/check-packed-tarball-consumer.mjs must include ${requiredTarballCheckFragment}`);
  }
}

for (const requiredTarballContentsFragment of [
  "packed.files",
  "src",
  ".npmrc",
  "pnpm-lock",
  "dist/index.js",
  "dist/index.d.ts",
]) {
  if (!tarballContentsSource.includes(requiredTarballContentsFragment)) {
    fail(`scripts/validation/tarball-contents.mjs must include ${requiredTarballContentsFragment}`);
  }
}

if (failures.length > 0) {
  console.error("Sanchika repo validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Sanchika release manifest fixtures passed (${releaseManifestFixtureCount} cases).`);
console.log("Sanchika repo validation passed.");

function readOklch(variable) {
  const value = tokenCssDeclarations.get(variable);
  const color = value ? parseOklch(value) : null;
  if (!color) {
    fail(`${variable} must be an OKLCH token`);
    return { l: 0, c: 0, h: 0 };
  }

  return color;
}

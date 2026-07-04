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
import { validatePackageManifest } from "./validation/package-manifests.mjs";
import { validatePatternContracts } from "./validation/pattern-contracts.mjs";
import { validatePrimitiveContracts } from "./validation/primitive-contracts.mjs";
import { validateSensitiveExamples } from "./validation/sensitive-examples.mjs";

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

if (rootPackage.scripts?.["github:ruleset"] !== "node scripts/render-github-master-ruleset.mjs") {
  fail("root package must expose github:ruleset for reproducible branch ruleset setup");
}

if (!existsSync(join(root, "scripts/check-workflow-preflight.mjs"))) {
  fail("workflow:preflight script file must exist");
}

if (!existsSync(join(root, "scripts/render-github-master-ruleset.mjs"))) {
  fail("github:ruleset script file must exist");
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

if (!rootPackage.scripts?.verify?.includes("pnpm consumer:check")) {
  fail("root verify script must run consumer:check");
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

for (const [scriptPath, commandName] of [
  ["scripts/smoke-gallery.mjs", "pnpm smoke"],
  ["scripts/check-package-api-types.mjs", "pnpm typecheck:api"],
  ["scripts/check-local-link-consumer.mjs", "pnpm consumer:check"],
  ["scripts/check-packed-tarball-consumer.mjs", "pnpm publish:tarball-check"],
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
  "createHash",
  "sha256",
  "Tarball evidence:",
  "simulatedVersion",
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
  "pnpm install --frozen-lockfile",
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
const codeowners = requireText(".github/CODEOWNERS");
const issueTemplateConfig = requireText(".github/ISSUE_TEMPLATE/config.yml");
const bugIssueTemplate = requireText(".github/ISSUE_TEMPLATE/bug_report.yml");
const featureIssueTemplate = requireText(".github/ISSUE_TEMPLATE/feature_request.yml");
const dependabotConfig = requireText(".github/dependabot.yml");
const agentGuide = readText("AGENTS.md");
const contributingDocs = readText("CONTRIBUTING.md");
const codeOfConduct = requireText("CODE_OF_CONDUCT.md");
const releasePolicy = readText("docs/release-policy.md");
const githubSetupDocs = requireText("docs/github-repository-setup.md");
const repositorySettingsDocs = requireText("docs/repository-settings.md");
const workflowPreflightSource = readText("scripts/check-workflow-preflight.mjs");
const githubRulesetSource = readText("scripts/render-github-master-ruleset.mjs");
const packageArtifactCheckSource = readText("scripts/check-package-artifacts.mjs");
const packedTarballCheckSource = readText("scripts/check-packed-tarball-consumer.mjs");
const tarballContentsSource = readText("scripts/validation/tarball-contents.mjs");
const architectureDocs = readText("docs/architecture.md");
const complyeazeAdoptionDocs = readText("docs/adoption-complyeaze.md");
const adoptionDocs = {
  ComplyEaze: complyeazeAdoptionDocs,
  Axal: readText("docs/adoption-axal.md"),
  Pack: readText("docs/adoption-pack.md"),
  Tools: readText("docs/adoption-tools.md"),
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

for (const adoptionChecklistPath of ["docs/adoption-complyeaze.md", "docs/adoption-axal.md", "docs/adoption-pack.md", "docs/adoption-tools.md"]) {
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

for (const requiredReadmeCommand of ["pnpm artifact:check", "pnpm workflow:preflight", "pnpm publish:tarball-check"]) {
  if (!readText("README.md").includes(requiredReadmeCommand)) {
    fail(`README must list ${requiredReadmeCommand}`);
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
  "pnpm install --frozen-lockfile",
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
  "--required-check",
  "--owner-bypass-id",
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
  "Require pull requests before merging",
  "Require conversation resolution",
  "Block force pushes",
  "Block branch deletion",
  "Disable wiki",
  "blank issues disabled",
  "CODEOWNERS",
  "Dependabot",
  "pnpm github:ruleset",
  "--required-check",
  "--owner-bypass-id",
]) {
  if (!repositorySettingsDocs.includes(requiredRepositorySettingsFragment)) {
    fail(`docs/repository-settings.md must include ${requiredRepositorySettingsFragment}`);
  }
}

for (const requiredRulesetFragment of [
  "Protect master",
  "refs/heads/master",
  "pull_request",
  "required_status_checks",
  "non_fast_forward",
  "deletion",
  "required_review_thread_resolution",
  "require_code_owner_review",
  "dismiss_stale_reviews_on_push",
  "strict_required_status_checks_policy",
  "do_not_enforce_on_create",
  "allowed_merge_methods",
  "squash",
  "owner-bypass-id",
  "required-check",
]) {
  if (!githubRulesetSource.includes(requiredRulesetFragment)) {
    fail(`github:ruleset script must include ${requiredRulesetFragment}`);
  }
}

if (!codeowners.includes("* @lamemustafa")) {
  fail(".github/CODEOWNERS must assign repository ownership to @lamemustafa");
}

for (const [path, text] of [
  [".github/ISSUE_TEMPLATE/config.yml", issueTemplateConfig],
  [".github/ISSUE_TEMPLATE/bug_report.yml", bugIssueTemplate],
  [".github/ISSUE_TEMPLATE/feature_request.yml", featureIssueTemplate],
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
  "package-ecosystem: npm",
  "package-ecosystem: github-actions",
  "directory: /",
  "interval: monthly",
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

for (const requiredGovernanceLink of [
  "CODE_OF_CONDUCT.md",
  "docs/github-repository-setup.md",
  "docs/repository-settings.md",
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

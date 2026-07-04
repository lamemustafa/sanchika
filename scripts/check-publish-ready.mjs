import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const packages = ["tokens", "primitives", "patterns", "gallery"];
const dependencyFields = ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"];
const packagePublishCommands = [
  "npm publish ./packages/tokens --provenance",
  "npm publish ./packages/primitives --provenance",
  "npm publish ./packages/patterns --provenance",
  "npm publish ./packages/gallery --provenance",
];
const publishWorkflowPath = ".github/workflows/publish.yml";
const failures = [];

const rootPackage = readJson("package.json");
const pnpmVersion = parsePackageManagerVersion(rootPackage.packageManager);
if (rootPackage.repository?.url !== "git+https://github.com/lamemustafa/sanchika.git") {
  failures.push("root package repository.url must be git+https://github.com/lamemustafa/sanchika.git");
}

if (rootPackage.private !== true) {
  failures.push("root package must remain private for workspace-only orchestration");
}

const publishWorkflow = readTextIfExists(publishWorkflowPath);
if (!publishWorkflow) {
  failures.push(`publish workflow ${publishWorkflowPath} must exist before package publishing`);
} else {
  validatePublishWorkflow(publishWorkflow);
}

for (const packageName of packages) {
  const packagePath = `packages/${packageName}`;
  const manifest = readJson(`${packagePath}/package.json`);
  const label = manifest.name ?? packagePath;

  if (manifest.repository?.url !== rootPackage.repository?.url) {
    failures.push(`${label} repository.url must be git+https://github.com/lamemustafa/sanchika.git`);
  }

  if (manifest.repository?.directory !== packagePath) {
    failures.push(`${label} repository.directory must be ${packagePath}`);
  }

  if (manifest.private === true) {
    failures.push(`${label} must remove private: true before publish`);
  }

  if (manifest.version === "0.0.0") {
    failures.push(`${label} must set a real semver version before publish`);
  }

  if (manifest.publishConfig?.registry !== "https://registry.npmjs.org/") {
    failures.push(`${label} must declare publishConfig.registry for npm`);
  }

  if (manifest.publishConfig?.access !== "public") {
    failures.push(`${label} must declare publishConfig.access public after scope ownership is confirmed`);
  }

  if (JSON.stringify(manifest.files) !== JSON.stringify(["dist"])) {
    failures.push(`${label} must publish only dist files`);
  }

  for (const dependencyField of dependencyFields) {
    for (const [dependencyName, version] of Object.entries(manifest[dependencyField] ?? {})) {
      if (typeof version === "string" && version.startsWith("workspace:")) {
        failures.push(`${label} ${dependencyField} ${dependencyName} must not use ${version}`);
      }
    }
  }

  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    if (subpath === ".") continue;
    if (typeof target !== "string" || !target.startsWith("./dist/")) {
      failures.push(`${label} export ${subpath} must point at dist before publish`);
    }
  }

  for (const requiredFile of ["README.md", "LICENSE", "dist/index.js", "dist/index.d.ts"]) {
    if (!existsSync(join(root, packagePath, requiredFile))) {
      failures.push(`${label} is missing ${requiredFile}`);
    }
  }
}

if (failures.length === 0) {
  runPackedTarballConsumerCheck();
}

if (failures.length > 0) {
  console.error("Sanchika publish readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sanchika publish readiness check passed.");

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function runPackedTarballConsumerCheck() {
  try {
    execFileSync(process.execPath, [join(root, "scripts/check-packed-tarball-consumer.mjs"), "--strict-publish-manifests"], {
      cwd: root,
      stdio: "inherit",
    });
  } catch {
    failures.push("pnpm publish:tarball-check must pass before package publishing");
  }
}

function readTextIfExists(path) {
  const fullPath = join(root, path);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, "utf8");
}

function parsePackageManagerVersion(packageManager) {
  const match = /^pnpm@(.+)$/.exec(packageManager ?? "");
  return match?.[1] ?? null;
}

function validatePublishWorkflow(workflow) {
  for (const [pattern, message] of [
    [/^\s*permissions:\s*$/m, "publish workflow must declare explicit permissions"],
    [/^\s*contents:\s*read\s*$/m, "publish workflow must request contents: read"],
    [/^\s*id-token:\s*write\s*$/m, "publish workflow must request id-token: write for npm Trusted Publishing"],
    [/^\s*if:\s*github\.repository\s*==\s*['"]lamemustafa\/sanchika['"]\s*$/m, "publish workflow must guard on github.repository == 'lamemustafa/sanchika'"],
    [/^\s*runs-on:\s*ubuntu-latest\s*$/m, "publish workflow must run on ubuntu-latest"],
    [/^\s*node-version:\s*['"]?24['"]?\s*$/m, "publish workflow must build on Node 24"],
    [
      /^\s*registry-url:\s*['"]?https:\/\/registry\.npmjs\.org['"]?\s*$/m,
      "publish workflow must set registry-url to https://registry.npmjs.org",
    ],
    [/^\s*package-manager-cache:\s*false\s*$/m, "publish workflow must set package-manager-cache: false"],
    [/\bnpm\s+publish\b/, "publish workflow must use npm publish"],
    [
      /\bpnpm\s+install\s+--frozen-lockfile\s+--ignore-scripts\b/,
      "publish workflow must install with pnpm install --frozen-lockfile --ignore-scripts",
    ],
    [/\bpnpm\s+run\s+verify\b/, "publish workflow must run pnpm run verify before publish"],
    [/\bpnpm\s+publish:check\b/, "publish workflow must run pnpm publish:check before publish"],
    [/\bpnpm\s+publish:tarball-check\b/, "publish workflow must run pnpm publish:tarball-check before publish"],
    [/\bnpm\s+--version\b/, "publish workflow must check npm --version before publish"],
    [/\b11\.5\.1\b/, "publish workflow must document or enforce npm 11.5.1 minimum before publish"],
  ]) {
    if (!pattern.test(workflow)) {
      failures.push(message);
    }
  }

  if (pnpmVersion && !new RegExp(`^\\s*version:\\s*['"]?${escapeRegExp(pnpmVersion)}['"]?\\s*$`, "m").test(workflow)) {
    failures.push(`publish workflow must pin pnpm setup to ${pnpmVersion}`);
  }

  for (const forbiddenTrigger of ["pull_request_target", "pull_request", "workflow_run", "schedule", "workflow_dispatch"]) {
    if (new RegExp(`\\b${forbiddenTrigger}\\b`).test(workflow)) {
      failures.push(`publish workflow must not use ${forbiddenTrigger} trigger`);
    }
  }

  if (/^\s*branches:\s*$/m.test(workflow)) {
    failures.push("publish workflow must not publish from branch push triggers");
  }

  if (!/^\s*tags:\s*$/m.test(workflow)) {
    failures.push("publish workflow must publish only from tag push triggers");
  }

  if (/\bpnpm\s+publish(?:\s|$)/.test(workflow)) {
    failures.push("publish workflow must not use pnpm publish");
  }

  if (/\bwrite-all\b/.test(workflow)) {
    failures.push("publish workflow must not use write-all permissions");
  }

  for (const match of workflow.matchAll(/^\s*([A-Za-z][\w-]*):\s*write\b/gm)) {
    const permission = match[1];
    if (permission !== "id-token") {
      failures.push(`publish workflow must not request ${permission}: write`);
    }
  }

  if (usesNpmTokenAuth(workflow)) {
    failures.push("publish workflow must not use long-lived npm token secrets such as NPM_TOKEN or NODE_AUTH_TOKEN");
  }

  for (const match of workflow.matchAll(/^\s*(?:-\s*)?uses:\s*([^\s#]+)\s*(?:#.*)?$/gm)) {
    const actionRef = match[1].replace(/^['"]|['"]$/g, "");
    if (!/@[0-9a-f]{40}$/.test(actionRef)) {
      failures.push(`publish workflow action reference ${actionRef} must be pinned to a full commit SHA`);
    }
  }

  validateCommandOrder(workflow, [
    "pnpm install --frozen-lockfile --ignore-scripts",
    "pnpm run verify",
    "pnpm publish:check",
    "pnpm publish:tarball-check",
  ]);
  validatePackagePublishCommands(workflow);
}

function validateCommandOrder(workflow, orderedCommands) {
  let previousIndex = -1;
  for (const command of orderedCommands) {
    const index = workflow.indexOf(command);
    if (index === -1) return;
    if (index < previousIndex) {
      failures.push(`publish workflow must run ${orderedCommands.join(" before ")}`);
      return;
    }
    previousIndex = index;
  }

  const firstPublishIndex = workflow.match(/\bnpm\s+publish\b/)?.index ?? -1;
  if (firstPublishIndex !== -1 && previousIndex > firstPublishIndex) {
    failures.push(`publish workflow must run ${orderedCommands.join(" before ")} before npm publish`);
  }
}

function validatePackagePublishCommands(workflow) {
  let previousIndex = -1;

  for (const command of packagePublishCommands) {
    const index = workflow.indexOf(command);
    if (index === -1) {
      failures.push(`publish workflow must run ${command}`);
      continue;
    }
    if (index < previousIndex) {
      failures.push(`publish workflow must publish packages in dependency order: ${packages.join(", ")}`);
    }
    previousIndex = index;
  }

  for (const match of workflow.matchAll(/^\s*(?:-\s*)?(?:run:\s*)?npm\s+publish\b(.*)$/gm)) {
    const args = match[1] ?? "";
    if (!/\.\/packages\/(?:tokens|primitives|patterns|gallery)\b/.test(args)) {
      failures.push("publish workflow must not run npm publish from the private root package");
    }
    if (!/\s--provenance\b/.test(args)) {
      failures.push("publish workflow package publish commands must include --provenance");
    }
  }
}

function usesNpmTokenAuth(workflow) {
  return [
    /\b(?:NPM_TOKEN|NODE_AUTH_TOKEN|npm_token)\b/i,
    /secrets\.[A-Za-z0-9_]*NPM[A-Za-z0-9_]*/i,
    /_authToken/i,
    /^\s*(?:-\s*)?(?:run:\s*)?npm\s+login\b/im,
    /^\s*(?:-\s*)?(?:run:\s*)?npm\s+config\s+set\b.*(?:token|_authToken)/im,
  ].some((pattern) => pattern.test(workflow));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

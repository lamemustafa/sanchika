import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
const expectedRemoteUrl = "https://github.com/lamemustafa/sanchika.git";
const protectedBranches = new Set(["main", "master"]);
const issues = [];
const warnings = [];

checkBranch();
checkRemote();
checkCleanTree();
checkBlockedRuntimeFolders();
checkContributionGates();

for (const warning of warnings) {
  console.error(`warn: ${warning}`);
}

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`error: ${issue}`);
  }
  process.exit(1);
}

console.log(`Sanchika workflow preflight passed for ${currentBranch() || "HEAD"}.`);

function checkBranch() {
  const branch = currentBranch();
  if (!branch) {
    issues.push("current checkout is detached; create a Sanchika task branch");
    return;
  }

  if (protectedBranches.has(branch) && !args.has("--allow-protected-branch")) {
    issues.push(`current branch is ${branch}; use a Sanchika task branch for non-trivial edits`);
  }

  const statusHeader = gitText(["status", "--short", "--branch"]).split("\n")[0] ?? "";
  if (!statusHeader.includes("...")) {
    if (args.has("--allow-new-repo-bootstrap")) {
      warnings.push("current branch has no upstream; allowed only for new repository bootstrap");
    } else {
      issues.push("current branch has no upstream; push or set upstream before handoff");
    }
  }
}

function checkRemote() {
  const fetchUrl = gitOptionalText(["config", "--get", "remote.origin.url"]);
  const pushUrl = gitOptionalText(["config", "--get", "remote.origin.pushurl"]) || fetchUrl;

  if (fetchUrl !== expectedRemoteUrl) {
    issues.push(`remote.origin.url must be ${expectedRemoteUrl}`);
  }

  if (pushUrl !== expectedRemoteUrl) {
    issues.push(`remote.origin.pushurl must be ${expectedRemoteUrl}`);
  }
}

function checkCleanTree() {
  const status = gitText(["status", "--porcelain"]);
  if (status) {
    issues.push("Sanchika repo has uncommitted files; commit or stash before handoff");
  }
}

function checkBlockedRuntimeFolders() {
  for (const blocked of ["pack", "tools", join("src", "app")]) {
    if (existsSync(join(root, blocked))) {
      issues.push(`${blocked} must not exist in Sanchika v0`);
    }
  }
}

function checkContributionGates() {
  const contributing = readText("CONTRIBUTING.md");
  const pullRequestTemplate = readText(join(".github", "PULL_REQUEST_TEMPLATE.md"));

  for (const required of [
    "docs/adoption-complyeaze.md",
    "docs/adoption-axal.md",
    "docs/adoption-pack.md",
    "docs/adoption-tools.md",
    "Sanchika commit",
    "package link or artifact method",
    "tarball version and checksum",
    "rollback files",
  ]) {
    if (!contributing.includes(required) && !pullRequestTemplate.includes(required)) {
      issues.push(`workflow guidance must reference ${required}`);
    }
  }
}

function currentBranch() {
  return gitText(["branch", "--show-current"]);
}

function gitText(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function gitOptionalText(args) {
  try {
    return gitText(args);
  } catch {
    return "";
  }
}

function readText(relativePath) {
  const path = join(root, relativePath);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

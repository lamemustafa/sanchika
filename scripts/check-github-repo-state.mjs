import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expectedGithubLabels, validateGithubLabels } from "./validation/github-labels.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const repo = "lamemustafa/sanchika";
const commandName = "github:verify";
const remoteRefsCheckLabel = "git ls-remote";
const repoViewCommandLabel = "gh repo view";
const expectedRemoteUrl = "https://github.com/lamemustafa/sanchika.git";
const expectedTopics = ["accessibility", "compliance", "design-system", "tokens", "typescript"];
const args = parseArgs(process.argv.slice(2));
const requiredCheck = args.get("required-check");
const ownerBypassId = args.get("owner-bypass-id");
const taskBranch = args.get("task-branch") ?? "tapish-codex/sanchika-sdk-hardening";

if (args.has("self-test")) {
  runSelfTest();
  console.log(`Sanchika ${commandName} self-test passed.`);
  process.exit(0);
}

if (!requiredCheck) {
  fail("missing --required-check <github-check-context>");
}

if (!ownerBypassId || !/^[1-9]\d*$/.test(ownerBypassId)) {
  fail("missing --owner-bypass-id <numeric-github-user-id>");
}

checkRemote();
checkRefs();
checkRepositorySettings(JSON.parse(run("gh", ["repo", "view", repo, "--json", repoViewFields().join(",")])));
checkLabels(JSON.parse(run("gh", ["api", `repos/${repo}/labels?per_page=100`])));
checkRuleset(JSON.parse(run("gh", ["api", `repos/${repo}/rulesets`])), requiredCheck, ownerBypassId);

console.log("Sanchika GitHub repository state check passed.");

function checkRemote() {
  const remoteUrl = run("git", ["config", "--get", "remote.origin.url"]).trim();
  const pushUrl = optionalRun("git", ["config", "--get", "remote.origin.pushurl"]).trim() || remoteUrl;

  if (remoteUrl !== expectedRemoteUrl) {
    fail(`remote.origin.url must be ${expectedRemoteUrl}`);
  }

  if (pushUrl !== expectedRemoteUrl) {
    fail(`remote.origin.pushurl must be ${expectedRemoteUrl}`);
  }
}

function checkRefs() {
  const refs = run("git", ["ls-remote", "--heads", "origin"]).trim();

  for (const branch of ["master", taskBranch]) {
    if (!new RegExp(`refs/heads/${escapeRegExp(branch)}$`, "m").test(refs)) {
      fail(`${remoteRefsCheckLabel} must return refs/heads/${branch}`);
    }
  }
}

function checkRepositorySettings(state) {
  if (!state) fail(`${repoViewCommandLabel} must return repository state`);

  const topics = new Set((state.repositoryTopics ?? []).map((topic) => topic.name ?? topic));

  const checks = [
    [state.nameWithOwner === repo, `repository must be ${repo}`],
    [state.visibility === "PUBLIC", "repository visibility must be PUBLIC"],
    [state.defaultBranchRef?.name === "master", "default branch must be master"],
    [state.hasIssuesEnabled === true, "issues must be enabled"],
    [state.hasWikiEnabled === false, "wiki must be disabled"],
    [state.deleteBranchOnMerge === true, "delete branch on merge must be enabled"],
    [state.squashMergeAllowed === true, "squash merge must be enabled"],
    [state.mergeCommitAllowed === false, "merge commits must be disabled"],
    [state.rebaseMergeAllowed === false, "rebase merges must be disabled"],
  ];

  for (const [passed, message] of checks) {
    if (!passed) fail(message);
  }

  for (const topic of expectedTopics) {
    if (!topics.has(topic)) {
      fail(`repository topic ${topic} must be set`);
    }
  }
}

function checkLabels(labels) {
  validateGithubLabels(labels, fail);
}

function checkRuleset(summaries, checkContext, expectedOwnerBypassId) {
  const summary = summaries.find((ruleset) => ruleset.name === "Protect master");
  if (!summary) {
    fail("Protect master ruleset must exist");
  }

  const ruleset = JSON.parse(run("gh", ["api", `repos/${repo}/rulesets/${summary.id}`]));
  validateRuleset(ruleset, checkContext, expectedOwnerBypassId);
}

function validateRuleset(ruleset, checkContext, expectedOwnerBypassId) {
  const enforcement = ruleset.enforcement;
  if (ruleset.name !== "Protect master") fail("ruleset name must be Protect master");
  if (ruleset.target !== "branch") fail("ruleset target must be branch");
  if (enforcement !== "active" && enforcement !== "enabled") fail("ruleset enforcement must be active");

  const bypassActors = ruleset.bypass_actors ?? [];
  if (bypassActors.length !== 1) fail("ruleset must have exactly one bypass actor");
  const ownerBypass = bypassActors[0] ?? {};
  if (String(ownerBypass.actor_id) !== String(expectedOwnerBypassId)) {
    fail(`ruleset bypass actor must be owner id ${expectedOwnerBypassId}`);
  }
  if (ownerBypass.actor_type !== "User") fail("ruleset bypass actor must be a User");
  if (ownerBypass.bypass_mode !== "pull_request") fail("ruleset bypass actor must use pull_request mode");

  const includedRefs = ruleset.conditions?.ref_name?.include ?? [];
  if (!includedRefs.includes("refs/heads/master") && !includedRefs.includes("~DEFAULT_BRANCH")) {
    fail("ruleset must include refs/heads/master or ~DEFAULT_BRANCH");
  }

  requireRule(ruleset, "deletion");
  requireRule(ruleset, "non_fast_forward");

  const pullRequest = requireRule(ruleset, "pull_request").parameters ?? {};
  if (!pullRequest.allowed_merge_methods?.includes("squash")) fail("ruleset must allow squash merges");
  if (pullRequest.required_approving_review_count !== 0) {
    fail("single-maintainer bootstrap ruleset must not require approving reviews");
  }
  if (pullRequest.require_code_owner_review !== false) {
    fail("single-maintainer bootstrap ruleset must not require CODEOWNERS review");
  }
  if (pullRequest.dismiss_stale_reviews_on_push !== true) fail("ruleset must dismiss stale approvals");
  if (pullRequest.required_review_thread_resolution !== true) fail("ruleset must require conversation resolution");

  const statusChecks = requireRule(ruleset, "required_status_checks").parameters ?? {};
  const contexts = (statusChecks.required_status_checks ?? []).map((check) => check.context);
  if (!contexts.includes(checkContext)) fail(`ruleset must require status check ${checkContext}`);
  if (!contexts.includes("Review gate")) fail("ruleset must require status check Review gate");
  if (statusChecks.strict_required_status_checks_policy !== true) {
    fail("ruleset must require branches to be up to date before merge");
  }
}

function requireRule(ruleset, type) {
  const rule = ruleset.rules?.find((entry) => entry.type === type);
  if (!rule) fail(`ruleset must include ${type}`);
  return rule;
}

function runSelfTest() {
  checkRepositorySettings({
    nameWithOwner: repo,
    visibility: "PUBLIC",
    defaultBranchRef: { name: "master" },
    hasIssuesEnabled: true,
    hasWikiEnabled: false,
    deleteBranchOnMerge: true,
    squashMergeAllowed: true,
    mergeCommitAllowed: false,
    rebaseMergeAllowed: false,
    repositoryTopics: expectedTopics.map((name) => ({ name })),
  });

  validateGithubLabels(
    expectedGithubLabels.map((label) => ({ ...label })),
    fail,
  );

  validateRuleset(
    {
      name: "Protect master",
      target: "branch",
      enforcement: "active",
      bypass_actors: [{ actor_id: 12345, actor_type: "User", bypass_mode: "pull_request" }],
      conditions: { ref_name: { include: ["refs/heads/master"], exclude: [] } },
      rules: [
        { type: "deletion" },
        { type: "non_fast_forward" },
        {
          type: "pull_request",
          parameters: {
            allowed_merge_methods: ["squash"],
            dismiss_stale_reviews_on_push: true,
            require_code_owner_review: false,
            required_approving_review_count: 0,
            required_review_thread_resolution: true,
          },
        },
        {
          type: "required_status_checks",
          parameters: {
            required_status_checks: [{ context: "verify" }, { context: "Review gate" }],
            strict_required_status_checks_policy: true,
          },
        },
      ],
    },
    "verify",
    "12345",
  );
}

function repoViewFields() {
  return [
    "deleteBranchOnMerge",
    "defaultBranchRef",
    "hasIssuesEnabled",
    "hasWikiEnabled",
    "mergeCommitAllowed",
    "nameWithOwner",
    "rebaseMergeAllowed",
    "repositoryTopics",
    "squashMergeAllowed",
    "visibility",
  ];
}

function parseArgs(rawArgs) {
  const parsed = new Map();

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) {
      fail(`unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const next = rawArgs[index + 1];
    if (!next || next.startsWith("--")) {
      parsed.set(key, true);
      continue;
    }

    parsed.set(key, next);
    index += 1;
  }

  return parsed;
}

function run(command, commandArgs) {
  try {
    return execFileSync(command, commandArgs, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    if (error.stdout) process.stdout.write(error.stdout);
    if (error.stderr) process.stderr.write(error.stderr);
    throw new Error(`Command failed: ${command} ${commandArgs.join(" ")}`);
  }
}

function optionalRun(command, commandArgs) {
  try {
    return run(command, commandArgs);
  } catch {
    return "";
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

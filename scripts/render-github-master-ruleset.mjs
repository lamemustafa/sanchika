const args = parseArgs(process.argv.slice(2));
const requiredCheck = args.get("required-check");
const ownerBypassId = args.get("owner-bypass-id");
const reviewGateIntegrationId = args.get("review-gate-integration-id");

if (!requiredCheck) {
  fail("missing --required-check <github-check-context>");
}

if (!ownerBypassId || !/^[1-9]\d*$/.test(ownerBypassId)) {
  fail("missing --owner-bypass-id <numeric-github-user-id>");
}

if (reviewGateIntegrationId && !/^[1-9]\d*$/.test(reviewGateIntegrationId)) {
  fail("--review-gate-integration-id must be a numeric GitHub integration id");
}

const reviewGateCheck = { context: "Review gate" };
if (reviewGateIntegrationId) {
  reviewGateCheck.integration_id = Number(reviewGateIntegrationId);
}

const ruleset = {
  name: "Protect master",
  target: "branch",
  enforcement: "active",
  bypass_actors: [
    {
      actor_id: Number(ownerBypassId),
      actor_type: "User",
      bypass_mode: "pull_request",
    },
  ],
  conditions: {
    ref_name: {
      include: ["refs/heads/master"],
      exclude: [],
    },
  },
  rules: [
    { type: "deletion" },
    { type: "non_fast_forward" },
    {
      type: "pull_request",
      parameters: {
        allowed_merge_methods: ["squash"],
        dismiss_stale_reviews_on_push: true,
        require_code_owner_review: false,
        require_last_push_approval: false,
        required_approving_review_count: 0,
        required_review_thread_resolution: true,
      },
    },
    {
      type: "required_status_checks",
      parameters: {
        do_not_enforce_on_create: true,
        required_status_checks: [{ context: requiredCheck }, reviewGateCheck],
        strict_required_status_checks_policy: true,
      },
    },
  ],
};

process.stdout.write(`${JSON.stringify(ruleset, null, 2)}\n`);

function parseArgs(rawArgs) {
  const parsed = new Map();

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) {
      fail(`unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = rawArgs[index + 1];
    if (!value || value.startsWith("--")) {
      fail(`missing value for ${arg}`);
    }

    parsed.set(key, value);
    index += 1;
  }

  return parsed;
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expectedGithubLabels, validateGithubLabels } from "./validation/github-labels.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const repo = "lamemustafa/sanchika";
const args = new Set(process.argv.slice(2));

if (args.has("--self-test")) {
  runSelfTest();
  console.log("Sanchika GitHub label self-test passed.");
  process.exit(0);
}

if (args.has("--print-json")) {
  process.stdout.write(`${JSON.stringify(expectedGithubLabels, null, 2)}\n`);
  process.exit(0);
}

if (args.has("--apply")) {
  for (const label of expectedGithubLabels) {
    upsertLabel(label);
  }
  console.log("Sanchika GitHub labels applied.");
}

if (args.has("--verify")) {
  verifyLabels();
  console.log("Sanchika GitHub label check passed.");
}

if (!args.has("--apply") && !args.has("--verify")) {
  fail("usage: pnpm github:labels -- --apply|--verify|--print-json|--self-test");
}

function verifyLabels() {
  const labels = JSON.parse(run("gh", ["api", `repos/${repo}/labels?per_page=100`]));
  validateGithubLabels(labels, fail);
}

function upsertLabel(label) {
  const labelPath = `repos/${repo}/labels/${encodeURIComponent(label.name)}`;
  const existing = optionalRun("gh", ["api", labelPath]);
  const method = existing ? "PATCH" : "POST";
  const path = existing ? labelPath : `repos/${repo}/labels`;

  run("gh", [
    "api",
    "--method",
    method,
    path,
    "-f",
    `name=${label.name}`,
    "-f",
    `color=${label.color}`,
    "-f",
    `description=${label.description}`,
  ]);
}

function runSelfTest() {
  validateGithubLabels(
    expectedGithubLabels.map((label) => ({ ...label })),
    fail,
  );
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
    return execFileSync(command, commandArgs, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

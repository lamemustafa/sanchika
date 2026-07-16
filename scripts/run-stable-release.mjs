import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadReleaseManifest, resolveReleaseVersion } from "./validation/release-manifest.mjs";
import { assertStableReleaseRuntime } from "./validation/release-runtime.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const runtime = assertStableReleaseRuntime();
const environment = { ...process.env, SANCHIKA_RELEASE_PROMOTED: "true" };
const releaseArguments = stableReleaseArguments(process.argv.slice(2));
const releaseManifest = loadReleaseManifest(fileURLToPath(new URL("../release.json", import.meta.url)));
resolveReleaseVersion({ manifest: releaseManifest, override: releaseArguments[1] });
const pnpmCli = process.env.npm_execpath;
if (!pnpmCli || !existsSync(pnpmCli)) {
  throw new Error("pnpm release:stable-tarballs must provide its pinned npm_execpath");
}

console.log(`Sanchika stable release runtime passed (${runtime.node}; npm ${runtime.npm}; zlib ${runtime.zlib}).`);
run(process.execPath, [pnpmCli, "-r", "build"]);
run(process.execPath, [pnpmCli, "--filter", "@sanchika/gallery-app", "browser:check"]);
run(process.execPath, [
  "scripts/check-packed-tarball-consumer.mjs",
  "--stable-release",
  "--emit-dir",
  "dist/release",
  ...releaseArguments,
]);

function run(command, args) {
  execFileSync(command, args, {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
}

function stableReleaseArguments(args) {
  if (args.length === 0) return [];
  if (args.length === 2 && args[0] === "--version" && args[1] && !args[1].startsWith("--")) {
    return args;
  }
  throw new Error("stable release runner accepts only --version <semantic-version>");
}

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertStableReleaseRuntime } from "./validation/release-runtime.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const runtime = assertStableReleaseRuntime();
const environment = { ...process.env, SANCHIKA_RELEASE_PROMOTED: "true" };
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
]);

function run(command, args) {
  execFileSync(command, args, {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
}

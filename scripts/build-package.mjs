import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { writePackageBuildMetadata } from "./validation/build-artifacts.mjs";

const assets = process.argv.slice(2);
const packageDir = process.cwd();
const distDir = join(packageDir, "dist");

rmSync(distDir, { recursive: true, force: true });
execFileSync("tsc", ["-p", "tsconfig.json"], { cwd: packageDir, stdio: "inherit" });

for (const asset of assets) {
  mkdirSync(distDir, { recursive: true });
  copyFileSync(join(packageDir, "src", asset), join(distDir, asset));
}

writePackageBuildMetadata({ root: resolve(packageDir, "../.."), packageName: basename(packageDir) });

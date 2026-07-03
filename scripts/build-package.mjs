import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const assets = process.argv.slice(2);
const packageDir = process.cwd();
const distDir = join(packageDir, "dist");

rmSync(distDir, { recursive: true, force: true });
execFileSync("tsc", ["-p", "tsconfig.json"], { cwd: packageDir, stdio: "inherit" });

for (const asset of assets) {
  mkdirSync(distDir, { recursive: true });
  copyFileSync(join(packageDir, "src", asset), join(distDir, asset));
}

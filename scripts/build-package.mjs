import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { writePackageBuildMetadata } from "./validation/build-artifacts.mjs";
import { renderMotionDocs } from "./validation/motion-assist.mjs";

const assets = process.argv.slice(2);
const packageDir = process.cwd();
const distDir = join(packageDir, "dist");

rmSync(distDir, { recursive: true, force: true });
execFileSync("tsc", ["-p", "tsconfig.json"], { cwd: packageDir, stdio: "inherit" });

for (const asset of assets) {
  mkdirSync(distDir, { recursive: true });
  copyFileSync(join(packageDir, "src", asset), join(distDir, asset));
}

if (basename(packageDir) === "primitives") {
  const { assistGuidanceEntries, motionAssistUtilities } = await import(`${join(distDir, "motion-assist.js")}?build=${Date.now()}`);
  writeFileSync(
    resolve(packageDir, "../..", "docs", "motion.md"),
    renderMotionDocs({ utilities: motionAssistUtilities, guidance: assistGuidanceEntries }),
  );
}

writePackageBuildMetadata({ root: resolve(packageDir, "../.."), packageName: basename(packageDir) });

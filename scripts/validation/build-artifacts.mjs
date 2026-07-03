import { existsSync } from "node:fs";
import { join } from "node:path";

const requiredArtifactsByPackage = new Map([
  ["tokens", ["dist/index.js", "dist/index.d.ts", "dist/theme.css"]],
  ["primitives", ["dist/index.js", "dist/index.d.ts", "dist/styles.css"]],
  ["patterns", ["dist/index.js", "dist/index.d.ts"]],
  ["gallery", ["dist/index.js", "dist/index.d.ts"]],
]);

export function assertBuiltPackageArtifacts({ root, commandName, packageNames = [...requiredArtifactsByPackage.keys()] }) {
  const missing = [];

  for (const packageName of packageNames) {
    const requiredArtifacts = requiredArtifactsByPackage.get(packageName);
    if (!requiredArtifacts) {
      throw new Error(`Unknown Sanchika package ${packageName} in build-artifact preflight`);
    }

    for (const artifact of requiredArtifacts) {
      const relativePath = join("packages", packageName, artifact);
      if (!existsSync(join(root, relativePath))) {
        missing.push(relativePath);
      }
    }
  }

  if (missing.length === 0) return;

  throw new Error(
    [
      `Sanchika build artifacts are missing before ${commandName}:`,
      ...missing.map((relativePath) => `- ${relativePath}`),
      `Run pnpm build before ${commandName}.`,
    ].join("\n"),
  );
}

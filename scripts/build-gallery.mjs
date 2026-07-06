import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertBuiltPackageArtifacts } from "./validation/build-artifacts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertBuiltPackageArtifacts({ root, commandName: "pnpm gallery:build" });

const { renderOpenablePrimitiveGalleryDocument } = await import("../packages/gallery/dist/index.js");

const galleryDir = join(root, "dist", "gallery");
const assetsDir = join(galleryDir, "assets");

rmSync(galleryDir, { recursive: true, force: true });
mkdirSync(assetsDir, { recursive: true });

copyFileSync(join(root, "packages", "tokens", "dist", "theme.css"), join(assetsDir, "theme.css"));
copyFileSync(join(root, "packages", "primitives", "dist", "styles.css"), join(assetsDir, "primitives.css"));
writeFileSync(join(galleryDir, "index.html"), renderOpenablePrimitiveGalleryDocument(), "utf8");

console.log("Sanchika gallery artifact written to dist/gallery/index.html.");

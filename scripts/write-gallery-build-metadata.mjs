import { fileURLToPath } from "node:url";
import { writeGalleryBuildMetadata } from "./validation/build-artifacts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
writeGalleryBuildMetadata({ root });

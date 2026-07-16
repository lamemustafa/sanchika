import { assertStableReleaseRuntime } from "./validation/release-runtime.mjs";

const runtime = assertStableReleaseRuntime();
console.log(`Sanchika stable release runtime passed (${runtime.node}; npm ${runtime.npm}; zlib ${runtime.zlib}).`);

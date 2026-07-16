import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
assertGalleryBuildArtifacts({ root, commandName: "pnpm smoke:check" });
const dist = new URL("../apps/gallery/dist/", import.meta.url);
const failures = [];
const documents = readdirSync(dist, { recursive: true }).filter((path) => typeof path === "string" && path.endsWith(".html")).sort();
if (documents.length !== 61) failures.push(`production gallery must emit 61 HTML routes; found ${documents.length}`);
if (documents.some((path) => /(^|\/)lab(\/|$)/.test(path))) failures.push("production gallery must not emit lab routes");

const checks = new Map([
  ["index.html", ["Build compliance interfaces that show their evidence.", "sk-pattern-review-desk-preview", "Related by evidence. Different by work.", "Find the contract behind the interface.", "Proven, limited, current.", "No next package release is currently announced."]],
  ["foundations/index.html", ["Evidence Modernism grammar", "/foundations/typography/"]],
  ["foundations/tokens/index.html", ["108 generated tokens", "@sanchika/tokens/theme.css"]],
  ["foundations/motion/index.html", ["Motion confirms state", "focus-feedback", "skeleton-loading"]],
  ["primitives/searchfield/index.html", ["Labelled local filtering control", "Composed synthetic exemplar", "role=search"]],
  ["patterns/reviewdeskpreview/index.html", ["ReviewDeskPreview", "sk-pattern-review-desk-preview", "Composed synthetic exemplar"]],
  ["modes/axal/index.html", ["Axal / workspace", "Source evidence", "Human approval checkpoint"]],
  ["modes/pack/index.html", ["Pack / local utility", "Chrome Downloads", "manual download path"]],
  ["adoption/index.html", ["Known consumer order", "Package artifact method", "What remains unproven"]],
]);
for (const [path, fragments] of checks) {
  const markup = readFileSync(new URL(path, dist), "utf8");
  for (const fragment of fragments) if (!markup.includes(fragment)) failures.push(`${path} must include ${fragment}`);
}
const manifest = JSON.parse(readFileSync(new URL("sanchika-manifest.json", dist), "utf8"));
if (manifest.releases.currentStable.version !== "0.1.0" || manifest.releases.currentStable.status !== "released-current" || manifest.releases.next !== null || manifest.releases.nextAnnouncement !== "No next package release is currently announced." || Object.hasOwn(manifest.releases, "planned")) failures.push("manifest release status must remain truthful");
const llms = readFileSync(new URL("llms.txt", dist), "utf8");
if (!llms.includes("design contract and static evidence system") || !llms.includes("Current stable release: v0.1.0. GitHub release artifacts; not published to npm.") || !llms.includes("No next package release is currently announced.")) failures.push("llms.txt must expose the concise generated project and release boundary");
if (failures.length) {
  console.error("Sanchika gallery smoke failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Sanchika gallery smoke passed (61 production HTML routes; manifest and llms.txt verified)." );

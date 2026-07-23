import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertGalleryBuildArtifacts } from "./validation/build-artifacts.mjs";
import { resolveGalleryReleaseState } from "./validation/gallery-release-state.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const release = JSON.parse(readFileSync(new URL("../release.json", import.meta.url), "utf8"));
const galleryReleaseState = resolveGalleryReleaseState(release);
assertGalleryBuildArtifacts({ root, commandName: "pnpm smoke:check" });
const dist = new URL("../apps/gallery/dist/", import.meta.url);
const failures = [];
const documents = readdirSync(dist, { recursive: true }).filter((path) => typeof path === "string" && path.endsWith(".html")).sort();
if (documents.length !== 61) failures.push(`production gallery must emit 61 HTML routes; found ${documents.length}`);
if (documents.some((path) => /(^|\/)lab(\/|$)/.test(path))) failures.push("production gallery must not emit lab routes");

const checks = new Map([
  ["index.html", ["Make regulated interfaces that show their work.", "Sanchika gives coding agents and engineers a repeatable way to turn source, uncertainty, and human review into clear, accessible product UI.", "It supplies contracts and a review loop—not compliance judgment, customer evidence, or an application runtime.", "sk-pattern-review-desk-preview", "One grammar. Four working conditions.", "Contracts first. Craft loop clearly labelled.", "Useful, bounded, and still in review.", galleryReleaseState.nextAnnouncement]],
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
if (manifest.releases.currentStable.version !== galleryReleaseState.currentStable || manifest.releases.currentStable.status !== "released-current" || (manifest.releases.next?.version ?? null) !== galleryReleaseState.next || manifest.releases.nextAnnouncement !== galleryReleaseState.nextAnnouncement || Object.hasOwn(manifest.releases, "planned")) failures.push("manifest release status must remain truthful");
const llms = readFileSync(new URL("llms.txt", dist), "utf8");
if (!llms.includes("design contract and static evidence system") || !llms.includes(`Current stable release: v${galleryReleaseState.currentStable}. GitHub release artifacts; not published to npm.`) || !llms.includes(galleryReleaseState.nextAnnouncement)) failures.push("llms.txt must expose the concise generated project and release boundary");
if (failures.length) {
  console.error("Sanchika gallery smoke failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Sanchika gallery smoke passed (61 production HTML routes; manifest and llms.txt verified)." );

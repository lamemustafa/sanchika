import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const scannedRoots = ["docs", "packages", "type-tests", "README.md", "PRODUCT.md", "DESIGN.md"];
const skippedNames = new Set(["dist", "node_modules", ".git"]);
const scannedExtensions = new Set([".md", ".ts", ".js", ".mjs", ".css", ".json"]);
const sensitivePatterns = [
  [/\/Users\/[^\s"'`<>]+/g, "local macOS path"],
  [/\/private\/tmp\/[^\s"'`<>]+/g, "local temp path"],
  [/[A-Z]:\\Users\\[^\s"'`<>]+/g, "local Windows path"],
  [/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, "PAN-like identifier"],
  [/\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/g, "GSTIN-like identifier"],
  [/\b(?:[2-9][0-9]{3}\s?[0-9]{4}\s?[0-9]{4})\b/g, "Aadhaar-like identifier"],
  [/\b(?:\+91[-\s]?)?[6-9][0-9]{9}\b/g, "Indian phone-like identifier"],
  [/\b(?:sk|ghp|npm)_[A-Za-z0-9]{20,}\b/g, "token-like secret"],
];

export function validateSensitiveExamples({ root, fail }) {
  for (const path of filesToScan(root)) {
    const text = readFileSync(path, "utf8");
    const relativePath = relative(root, path);

    for (const [pattern, label] of sensitivePatterns) {
      for (const match of text.matchAll(pattern)) {
        fail(`${relativePath} contains ${label}: ${redact(match[0])}`);
      }
    }
  }
}

function filesToScan(root) {
  return scannedRoots.flatMap((entry) => {
    const path = join(root, entry);
    if (!existsSync(path)) return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (skippedNames.has(entry.name)) return [];

    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    if (!entry.isFile()) return [];
    if (!scannedExtensions.has(extensionFor(entry.name))) return [];
    return [path];
  });
}

function extensionFor(fileName) {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index);
}

function redact(value) {
  if (value.length <= 8) return "[redacted]";
  return `${value.slice(0, 3)}...[redacted]...${value.slice(-3)}`;
}

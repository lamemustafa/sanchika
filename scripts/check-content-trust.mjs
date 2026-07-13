import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { invalidTrustCopyFixtures } from "./validation/content-trust-fixtures.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const failures = [];

for (const fixture of invalidTrustCopyFixtures) {
  const findings = lintTrustCopy(fixture.text);
  if (!findings.some((finding) => finding.reason === fixture.expected)) {
    failures.push(`fixture "${fixture.name}" must trigger ${fixture.expected}`);
  }
}

const galleryDir = join(root, "apps", "gallery", "dist");
const galleryDocuments = readdirSync(galleryDir, { recursive: true })
  .filter((path) => typeof path === "string" && path.endsWith(".html"))
  .sort();

for (const documentPath of galleryDocuments) {
  const galleryHtml = readFileSync(join(galleryDir, documentPath), "utf8");
  for (const finding of lintTrustCopy(stripTags(galleryHtml))) {
    failures.push(`apps/gallery/dist/${documentPath} ${finding.reason}: ${finding.match}`);
  }
}

if (failures.length > 0) {
  console.error("Sanchika content trust check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sanchika content trust check passed.");

function lintTrustCopy(text) {
  const findings = [];
  const checks = [
    { reason: "unsupported trust claim", pattern: /\b(bank-grade|audit-proof|government-official|CA-verified|filing-ready|production-ready)\b/i },
    { reason: "multiple rupee/year prices", pattern: /₹[\d,.]+\/year[\s\S]*₹[\d,.]+\/year/i },
    { reason: "placeholder metric", pattern: /(?:^|[^\d])0(?:\+|%)(?=$|[^\w])/ },
    { reason: "AI completion claim", pattern: /\bAI\b[\s\S]{0,80}\b(all returns reconciled|done for the month|completed automatically|ready to file)\b/i },
    {
      reason: "stale month-year reference",
      pattern: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+2026\b/,
    },
  ];

  for (const check of checks) {
    const match = text.match(check.pattern);
    if (match) findings.push({ reason: check.reason, match: match[0] });
  }

  return findings;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ");
}

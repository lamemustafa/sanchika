import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { resolveGalleryReleaseState } from "./validation/gallery-release-state.mjs";
import { fileURLToPath } from "node:url";
import { invalidTrustCopyFixtures } from "./validation/content-trust-fixtures.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const release = JSON.parse(readFileSync(join(root, "release.json"), "utf8"));
const galleryReleaseState = resolveGalleryReleaseState(release);
const failures = [];

for (const fixture of invalidTrustCopyFixtures) {
  const findings = lintTrustCopy(fixture.text);
  if (!findings.some((finding) => finding.reason === fixture.expected)) {
    failures.push(`fixture "${fixture.name}" modeled on ${fixture.productionPath} must trigger ${fixture.expected}`);
  }
}

const galleryDir = join(root, "apps", "gallery", "dist");
const galleryDocuments = readdirSync(galleryDir, { recursive: true })
  .filter((path) => typeof path === "string" && path.endsWith(".html"))
  .sort();

for (const documentPath of galleryDocuments) {
  const galleryHtml = readFileSync(join(galleryDir, documentPath), "utf8");
  const visibleText = stripTags(galleryHtml);
  const planningReference = visibleText.match(/\b(?:S\d+|C\d+|North Star(?:s)?)\b/);
  if (planningReference) failures.push(`apps/gallery/dist/${documentPath} exposes internal planning vocabulary: ${planningReference[0]}`);
  for (const finding of lintTrustCopy(visibleText, { requireBoundaryDisclosure: false })) {
    failures.push(`apps/gallery/dist/${documentPath} ${finding.reason}: ${finding.match}`);
  }
  if (!visibleText.includes("All gallery records are synthetic")) {
    failures.push(`apps/gallery/dist/${documentPath} must expose the synthetic-data boundary`);
  }
  validateProductionPathTrust({ documentPath, visibleText, failures });
}

if (failures.length > 0) {
  console.error("Sanchika content trust check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Sanchika content trust check passed (${invalidTrustCopyFixtures.length} negative fixtures; ${galleryDocuments.length} gallery documents).`);

function lintTrustCopy(text, { requireBoundaryDisclosure = true } = {}) {
  const findings = [];
  const checks = [
    { reason: "unsupported trust claim", pattern: /\b(bank-grade|audit-proof|government-official|CA-verified|filing-ready|production-ready)\b/i },
    { reason: "government affiliation claim", pattern: /\b(?:(?:government|GSTN|tax authority)[ -](?:affiliated|approved|endorsed|official)|official (?:government|GSTN) (?:partner|product|service))\b/i },
    { reason: "multiple rupee/year prices", pattern: /₹\s?[\d,.]+(?:\s*(?:\/\s*year|per year|annual(?:ly)?))[\s\S]*₹\s?[\d,.]+(?:\s*(?:\/\s*year|per year|annual(?:ly)?))/i },
    { reason: "unsupported price claim", pattern: /\b(?:guaranteed lowest|lowest guaranteed|best price guaranteed|price will never change)\b/i },
    { reason: "guaranteed outcome claim", pattern: /\bguarante(?:e|ed|es)\b[\s\S]{0,64}\b(?:approval|acceptance|compliance|filing|outcome|refund|result|accuracy)\b/i, allowNegated: true },
    { reason: "placeholder metric", pattern: /(?:^|[^\d])0(?:\+|%)(?=$|[^\w])/ },
    { reason: "unsupported metric", pattern: /\b\d+(?:\.\d+)?(?:%|x|\+)\s*(?:accuracy|clients?|customers?|faster|filings?|matches?|users?)\b/i },
    { reason: "stale cohort claim", pattern: /\b(?:trusted|used|chosen|adopted) by\b[\s\S]{0,48}\b(?:clients?|customers?|firms?|professionals?|users?)\b/i },
    { reason: "AI completion claim", pattern: /\bAI\b[\s\S]{0,80}\b(all returns reconciled|done for the month|completed automatically|ready to file)\b/i },
    { reason: "autonomous filing or reply claim", pattern: /\b(?:AI|system|agent|product|tool)\b\s+(?:(?:autonomously|automatically)\s+|without human review\s+)?(?:files?|filed|submits?|submitted|replies?|replied|responds?|responded)\b/i },
    { reason: "unsupported production domain", pattern: /\b(?:tool\.complyeaze\.com|shanchika\.complyeaze\.com)\b/i },
    { reason: "unsupported approval claim", pattern: /\b(?:AI|generated (?:artifact|output)|draft (?:artifact|output)|filing|response)\b[\s\S]{0,48}\b(?:is |has been |successfully )?(?:professionally )?approved\b/i },
    {
      reason: "stale status reference",
      pattern: /\b(?:current|latest|status|launch(?:ed)?)\b[\s\S]{0,48}\b(?:January|February|March|April|May|June)\s+2026\b/i,
    },
    { reason: "color-only state copy", pattern: /\b(?:green|red|amber|orange)\s+(?:means|indicates|shows)\s+(?:reviewed|ready|blocked|pending|error)\b/i },
    { reason: "benchmark rule overextension", pattern: /\b(?:guarantees?|always achieves?|must achieve)\b[\s\S]{0,80}\b(?:WCAG|Lighthouse\s*100|perfect accessibility|zero violations)\b/i },
  ];

  for (const check of checks) {
    const match = text.match(check.pattern);
    if (!match) continue;
    const prefix = text.slice(Math.max(0, match.index - 96), match.index);
    if (check.allowNegated && /(?:do not|does not|must not|never|no)\b[^.!?]*$/i.test(prefix)) continue;
    findings.push({ reason: check.reason, match: match[0] });
  }

  if (/\b(?:verified|source-backed|current)\b/i.test(text) && !/\b(?:source|evidence|checked|reviewer|limitation)\b/i.test(text)) {
    findings.push({ reason: "missing provenance cue", match: text.match(/\b(?:verified|source-backed|current)\b/i)?.[0] ?? "claim" });
  }

  if (requireBoundaryDisclosure && /\b(?:browser-local|local utility)\b/i.test(text)) {
    const hasAccount = /\b(?:account|not required)\b/i.test(text);
    const hasUpload = /\b(?:upload|nothing is uploaded|handoff)\b/i.test(text);
    const hasReview = /\b(?:review|draft|human)\b/i.test(text);
    if (!hasAccount || !hasUpload || !hasReview) findings.push({ reason: "missing boundary disclosure", match: "local/account/upload/review" });
  }

  const genericPhrases = text.match(/\b(?:unlock insights|streamline your workflow|boost productivity|all-in-one platform|seamless experience)\b/gi) ?? [];
  if (genericPhrases.length >= 3) findings.push({ reason: "excessive generic card copy", match: genericPhrases.join(", ") });

  return findings;
}

function validateProductionPathTrust({ documentPath, visibleText, failures }) {
  const requirements = new Map([
    ["index.html", ["No model runtime", "No automated compliance judgment", "Synthetic examples", `Current stable release: v${galleryReleaseState.currentStable}`, galleryReleaseState.nextAnnouncement]],
    ["modes/complyeaze/index.html", ["Product-family boundary", "Credentials or artifacts", "person choosing the route"]],
    ["modes/axal/index.html", ["Saved synthetic context", "judgment stays human", "Source evidence", "CA decision required"]],
    ["modes/pack/index.html", ["Credentials, session cookies, and downloaded files", "No ComplyEaze account", "Inspect permission contract", "manual download path"]],
    ["modes/tools/index.html", ["Search and entered work stay in the browser", "Nothing is uploaded", "Professional review", "outputs remain drafts"]],
    ["adoption/index.html", ["Consumers own product copy, authorization", "Real consumer adoption remains incomplete", "rollback"]],
  ]);
  for (const required of requirements.get(documentPath) ?? []) {
    if (!visibleText.includes(required)) failures.push(`apps/gallery/dist/${documentPath} missing trust disclosure: ${required}`);
  }
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ");
}

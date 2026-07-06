import { resolveCname } from "node:dns/promises";

const targetDomain = process.env.SANCHIKA_CUSTOM_DOMAIN || "sanchika.complyeaze.com";
const expectedCname = normalizeDnsName(
  process.env.SANCHIKA_EXPECTED_CNAME || "lamemustafa.github.io",
);

try {
  const records = await resolveCname(targetDomain);
  const normalizedRecords = records.map(normalizeDnsName);

  if (!normalizedRecords.includes(expectedCname)) {
    throw new Error(
      `${targetDomain} CNAME must point to ${expectedCname}; received ${records.join(", ") || "no CNAME records"}`,
    );
  }

  console.log(
    `${targetDomain} DNS is ready for GitHub Pages (${expectedCname}).`,
  );
} catch (error) {
  console.error("Sanchika custom-domain readiness check failed:");
  console.error(error instanceof Error ? error.message : error);
  console.error("");
  console.error("Expected DNS after saving the GitHub Pages custom domain:");
  console.error(`${targetDomain}. CNAME ${expectedCname}.`);
  console.error("");
  console.error(
    "After DNS is live, rerun this check and keep HTTPS enforced in GitHub Pages settings.",
  );
  process.exitCode = 1;
}

function normalizeDnsName(value) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

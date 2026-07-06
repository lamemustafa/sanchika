export const invalidTrustCopyFixtures = [
  {
    name: "bank-grade claim",
    text: "Bank-grade security protects every filing.",
    expected: "unsupported trust claim",
  },
  {
    name: "multiple public prices",
    text: "Choose ₹3,649/year or ₹7,999/year today.",
    expected: "multiple rupee/year prices",
  },
  {
    name: "placeholder metric",
    text: "0+ clients and 0% match accuracy.",
    expected: "placeholder metric",
  },
  {
    name: "AI completion without review",
    text: "Axal AI: All returns reconciled. Your team is done for the month.",
    expected: "AI completion claim",
  },
  {
    name: "stale dated month",
    text: "April 2026 launch guarantee for every compliance page.",
    expected: "stale month-year reference",
  },
];

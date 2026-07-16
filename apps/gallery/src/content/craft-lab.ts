export const craftTerritories = [
  "joined-planes",
  "variable-measure",
  "decision-theatre",
] as const;

export type CraftTerritory = (typeof craftTerritories)[number];

export const craftTerritoryLabels: Record<CraftTerritory, string> = {
  "joined-planes": "Joined Planes",
  "variable-measure": "Variable Measure",
  "decision-theatre": "Decision Theatre",
};

export const craftFixture = {
  id: "AX-031",
  source: "Synthetic GST notice · SRC-01",
  sourceDate: "14 July 2026 · 09:42",
  interpretation:
    "A source difference may affect the proposed response position.",
  uncertainty:
    "Interpretation remains under review; no statutory conclusion is recorded.",
  owner: "AK · assigned CA reviewer",
  decision: "Approve, revise, or request evidence after opening the source.",
  status: "CA review needed",
} as const;

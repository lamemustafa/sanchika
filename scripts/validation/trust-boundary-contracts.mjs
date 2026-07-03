const requiredSignalsByState = {
  "local-only": ["Runs locally", "No upload", "Inspect source", "proof artifact", "generated artifact"],
  "upload-required": ["Upload required", "ComplyEaze workspace", "human review", "proof artifact"],
  "permission-required": ["Permission required", "File read permission", "inspect selected local artifact"],
  unavailable: ["Unavailable", "boundary cannot be completed safely", "manual review path"],
};

const placeholderOnlySignals = ["Destination or processor", "Permission purpose", "Reason", "Fallback action"];

export function validateTrustBoundarySignals({ pattern, state, fail }) {
  if (pattern.name !== "TrustBoundary") return;

  const signals = state.requiredVisibleSignals.join(" ");
  for (const placeholder of placeholderOnlySignals) {
    if (state.requiredVisibleSignals.includes(placeholder)) {
      fail(`TrustBoundary.${state.name} must replace placeholder visible signal ${placeholder}`);
    }
  }

  for (const fragment of requiredSignalsByState[state.name] ?? []) {
    if (!signals.includes(fragment)) {
      fail(`TrustBoundary.${state.name} visible signals must include ${fragment}`);
    }
  }
}

export const expectedGithubLabels = [
  {
    name: "bug",
    color: "d73a4a",
    description: "Reproducible SDK bug with synthetic data only.",
  },
  {
    name: "enhancement",
    color: "a2eeef",
    description: "SDK improvement proposal with public-safe context.",
  },
  {
    name: "conduct",
    color: "5319e7",
    description: "Public-safe Code of Conduct concern.",
  },
  {
    name: "question",
    color: "d876e3",
    description: "Public, non-sensitive SDK question.",
  },
];

export function validateGithubLabels(actualLabels, fail) {
  const labelsByName = new Map(actualLabels.map((label) => [label.name, label]));

  for (const expected of expectedGithubLabels) {
    const actual = labelsByName.get(expected.name);
    if (!actual) {
      fail(`GitHub label ${expected.name} must exist`);
      continue;
    }

    if (actual.color?.toLowerCase() !== expected.color) {
      fail(`GitHub label ${expected.name} must use color ${expected.color}`);
    }

    if ((actual.description ?? "") !== expected.description) {
      fail(`GitHub label ${expected.name} must use the expected description`);
    }
  }
}

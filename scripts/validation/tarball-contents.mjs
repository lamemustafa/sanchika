const packageCssAssets = new Map([
  ["tokens", "dist/theme.css"],
  ["primitives", "dist/styles.css"],
  ["patterns", "dist/styles.css"],
]);

const packageInternalDistFiles = new Map([
  [
    "tokens",
    [
      "dist/generated.d.ts",
      "dist/generated.js",
    ],
  ],
  [
    "primitives",
    [
      "dist/classes.d.ts",
      "dist/classes.js",
      "dist/components.css",
      "dist/contracts/actions.d.ts",
      "dist/contracts/actions.js",
      "dist/contracts/form-status.d.ts",
      "dist/contracts/form-status.js",
      "dist/contracts/search-feedback.d.ts",
      "dist/contracts/search-feedback.js",
      "dist/contracts/states.d.ts",
      "dist/contracts/states.js",
      "dist/contracts/process.d.ts",
      "dist/contracts/process.js",
      "dist/contracts/navigation-data.d.ts",
      "dist/contracts/navigation-data.js",
      "dist/contracts/layout-core.d.ts",
      "dist/contracts/layout-core.js",
      "dist/contracts/layout-planes.d.ts",
      "dist/contracts/layout-planes.js",
      "dist/contracts/types.d.ts",
      "dist/contracts/types.js",
      "dist/contracts/typography.d.ts",
      "dist/contracts/typography.js",
      "dist/foundation.css",
      "dist/formatting/indian.d.ts",
      "dist/formatting/indian.js",
      "dist/process-data.css",
      "dist/motion-assist.d.ts",
      "dist/motion-assist.js",
      "dist/motion.css",
      "dist/registry.d.ts",
      "dist/registry.js",
      "dist/typography.css",
      "dist/search-feedback.css",
    ],
  ],
  [
    "patterns",
    [
      "dist/axal.css",
      "dist/contracts/axal-workspace.d.ts",
      "dist/contracts/axal-workspace.js",
      "dist/contracts/pack-local-utility.d.ts",
      "dist/contracts/pack-local-utility.js",
      "dist/contracts/public-product.d.ts",
      "dist/contracts/public-product.js",
      "dist/contracts/tools-local-artifact.d.ts",
      "dist/contracts/tools-local-artifact.js",
      "dist/evidence-loop.d.ts",
      "dist/evidence-loop.js",
      "dist/pack.css",
      "dist/product-pattern-definition.d.ts",
      "dist/product-pattern-definition.js",
      "dist/product-pattern-registry.d.ts",
      "dist/product-pattern-registry.js",
      "dist/product-pattern-types.d.ts",
      "dist/product-pattern-types.js",
      "dist/public.css",
      "dist/responsive.css",
      "dist/tools.css",
      "dist/visual-grammar.css",
      "dist/visual-grammar.d.ts",
      "dist/visual-grammar.js",
    ],
  ],
]);

const commonAllowedPaths = new Set(["package.json", "README.md", "LICENSE", "dist/index.js", "dist/index.d.ts"]);
const forbiddenPathPatterns = [
  /^src\//,
  /^type-tests\//,
  /^tests?\//,
  /\/tests?\//,
  /\/__tests__\//,
  /\.map$/i,
  /^\.npmrc$/i,
  /(^|\/)\.env(?:\.|$)/i,
  /\.(?:key|pem|p12|pfx)$/i,
  /^pnpm-lock\.yaml$/i,
  /^package-lock\.json$/i,
  /^yarn\.lock$/i,
];

export function assertPackedFileList({ packageName, packed }) {
  if (!Array.isArray(packed?.files)) {
    throw new Error(`@sanchika/${packageName} npm pack output must include packed.files`);
  }

  const allowedPaths = allowedPathsFor(packageName);
  const inventory = packed.files.map((file) => ({
    path: normalizePackedPath(file.path),
    size: file.size,
  }));
  const actualPaths = inventory.map((file) => file.path);
  if (new Set(actualPaths).size !== actualPaths.length) {
    throw new Error(`@sanchika/${packageName} tarball file inventory must not contain duplicate paths`);
  }

  for (const file of inventory) {
    if (!file.path || file.path.startsWith("/") || file.path.includes("\\") || file.path.split("/").includes("..")) {
      throw new Error(`@sanchika/${packageName} tarball file inventory path is invalid: ${file.path || "missing"}`);
    }
    if (!Number.isSafeInteger(file.size) || file.size < 0) {
      throw new Error(`@sanchika/${packageName} tarball file ${file.path} must include a non-negative byte size`);
    }
  }
  inventory.sort((left, right) => left.path.localeCompare(right.path));
  actualPaths.sort();

  for (const path of actualPaths) {
    if (forbiddenPathPatterns.some((pattern) => pattern.test(path))) {
      throw new Error(`@sanchika/${packageName} tarball must not include ${path}`);
    }

    if (!allowedPaths.has(path)) {
      throw new Error(`@sanchika/${packageName} tarball contains unexpected file ${path}`);
    }
  }

  for (const path of allowedPaths) {
    if (!actualPaths.includes(path)) {
      throw new Error(`@sanchika/${packageName} tarball is missing ${path}`);
    }
  }

  return inventory;
}

export function runTarballContentsFixtures() {
  const validPaths = [
    "LICENSE",
    "README.md",
    "dist/generated.d.ts",
    "dist/generated.js",
    "dist/index.d.ts",
    "dist/index.js",
    "dist/theme.css",
    "package.json",
  ];
  const validFiles = () => validPaths.map((path, index) => ({ path, size: index + 1 }));
  const cases = [
    { name: "valid tokens inventory", files: validFiles(), expected: null },
    { name: "missing required file", files: validFiles().filter((file) => file.path !== "README.md"), expected: "is missing README.md" },
    { name: "extra file", files: [...validFiles(), { path: "CHANGELOG.md", size: 1 }], expected: "unexpected file CHANGELOG.md" },
    { name: "forbidden source file", files: [...validFiles(), { path: "src/index.ts", size: 1 }], expected: "must not include src/index.ts" },
    { name: "mismatched package file", files: validFiles().map((file) => file.path === "dist/theme.css" ? { ...file, path: "dist/styles.css" } : file), expected: "unexpected file dist/styles.css" },
    { name: "duplicate file", files: [...validFiles(), { path: "README.md", size: 1 }], expected: "duplicate paths" },
    { name: "invalid byte size", files: validFiles().map((file, index) => index === 0 ? { ...file, size: -1 } : file), expected: "non-negative byte size" },
    { name: "absolute archive path", files: validFiles().map((file, index) => index === 0 ? { ...file, path: "/LICENSE" } : file), expected: "path is invalid" },
  ];
  const failures = [];
  for (const fixture of cases) {
    try {
      const inventory = assertPackedFileList({ packageName: "tokens", packed: { files: fixture.files } });
      if (fixture.expected) failures.push(`${fixture.name} should fail with ${fixture.expected}`);
      else if (JSON.stringify(inventory.map((file) => file.path)) !== JSON.stringify([...validPaths].sort((left, right) => left.localeCompare(right)))) failures.push(`${fixture.name} did not return deterministic path order`);
    } catch (error) {
      if (!fixture.expected) failures.push(`${fixture.name} should pass: ${String(error)}`);
      else if (!String(error).includes(fixture.expected)) failures.push(`${fixture.name} should mention ${fixture.expected}; received ${String(error)}`);
    }
  }
  return { count: cases.length, failures };
}

function allowedPathsFor(packageName) {
  const paths = new Set(commonAllowedPaths);
  const cssAsset = packageCssAssets.get(packageName);
  if (cssAsset) paths.add(cssAsset);
  for (const internalFile of packageInternalDistFiles.get(packageName) ?? []) {
    paths.add(internalFile);
  }
  return paths;
}

function normalizePackedPath(path) {
  return String(path).replace(/^package\//, "");
}

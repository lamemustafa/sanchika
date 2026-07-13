const packageCssAssets = new Map([
  ["tokens", "dist/theme.css"],
  ["primitives", "dist/styles.css"],
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
      "dist/contracts/layout-core.d.ts",
      "dist/contracts/layout-core.js",
      "dist/contracts/layout-planes.d.ts",
      "dist/contracts/layout-planes.js",
      "dist/contracts/types.d.ts",
      "dist/contracts/types.js",
      "dist/contracts/typography.d.ts",
      "dist/contracts/typography.js",
      "dist/foundation.css",
      "dist/registry.d.ts",
      "dist/registry.js",
      "dist/typography.css",
    ],
  ],
  [
    "patterns",
    [
      "dist/evidence-loop.d.ts",
      "dist/evidence-loop.js",
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
  const actualPaths = packed.files.map((file) => normalizePackedPath(file.path)).sort();

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

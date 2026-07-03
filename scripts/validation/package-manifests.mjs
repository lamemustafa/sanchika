export const expectedPackageFiles = ["dist"];
const cssSideEffectExports = new Map([
  ["tokens", "./dist/theme.css"],
  ["primitives", "./dist/styles.css"],
]);

export function validatePackageManifest(packageName, manifest, fail) {
  const displayName = `@sanchika/${packageName}`;

  if (manifest.name !== displayName) {
    fail(`packages/${packageName}/package.json has unexpected package name ${manifest.name}`);
  }

  if (manifest.private !== true) {
    fail(`${displayName} must remain private until publish gates pass`);
  }

  if (manifest.license !== "Apache-2.0") {
    fail(`${displayName} must declare Apache-2.0`);
  }

  if (typeof manifest.description !== "string" || !manifest.description.includes("Sanchika")) {
    fail(`${displayName} must declare a Sanchika package description`);
  }

  for (const keyword of ["sanchika", "design-system", "compliance"]) {
    if (!manifest.keywords?.includes(keyword)) {
      fail(`${displayName} keywords must include ${keyword}`);
    }
  }

  if (manifest.repository?.url !== "git+https://github.com/lamemustafa/sanchika.git") {
    fail(`${displayName} repository must point at lamemustafa/sanchika`);
  }

  if (manifest.repository?.directory !== `packages/${packageName}`) {
    fail(`${displayName} repository directory must be packages/${packageName}`);
  }

  if (manifest.homepage !== `https://github.com/lamemustafa/sanchika/tree/master/packages/${packageName}#readme`) {
    fail(`${displayName} homepage must point at its package README`);
  }

  if (manifest.bugs?.url !== "https://github.com/lamemustafa/sanchika/issues") {
    fail(`${displayName} bugs URL must point at lamemustafa/sanchika issues`);
  }

  if (manifest.engines?.node !== ">=24") {
    fail(`${displayName} engines.node must be >=24`);
  }

  if (manifest.type !== "module") {
    fail(`${displayName} must publish as an ESM package`);
  }

  if (manifest.main !== "./dist/index.js") {
    fail(`${displayName} main must point at ./dist/index.js`);
  }

  if (manifest.types !== "./dist/index.d.ts") {
    fail(`${displayName} types must point at ./dist/index.d.ts`);
  }

  const rootExport = manifest.exports?.["."];
  if (rootExport?.types !== "./dist/index.d.ts") {
    fail(`${displayName} root export types must point at ./dist/index.d.ts`);
  }

  if (rootExport?.default !== "./dist/index.js") {
    fail(`${displayName} root export default must point at ./dist/index.js`);
  }

  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    if (subpath === ".") continue;
    if (typeof target !== "string" || !target.startsWith("./dist/")) {
      fail(`${displayName} export ${subpath} must point at ./dist/`);
    }
  }

  const expectedCssSideEffect = cssSideEffectExports.get(packageName);
  if (expectedCssSideEffect) {
    if (JSON.stringify(manifest.sideEffects) !== JSON.stringify([expectedCssSideEffect])) {
      fail(`${displayName} must mark ${expectedCssSideEffect} as a package side effect`);
    }
  } else if (manifest.sideEffects !== false) {
    fail(`${displayName} must declare sideEffects false`);
  }

  if (JSON.stringify(manifest.files) !== JSON.stringify(expectedPackageFiles)) {
    fail(`${displayName} files must explicitly allowlist ${expectedPackageFiles.join(", ")}`);
  }
}

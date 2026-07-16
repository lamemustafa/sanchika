import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";

export const stableReleaseRuntime = Object.freeze({
  node: "v24.18.0",
  npm: "11.16.0",
  zlib: "1.3.1-e00f703",
});

export function currentReleaseRuntime() {
  return {
    node: process.version,
    npm: execFileSync(process.execPath, [resolveBundledNpmCli(), "--version"], { encoding: "utf8" }).trim(),
    zlib: process.versions.zlib,
  };
}

export function resolveBundledNpmCli(execPath = process.execPath) {
  const candidates = releaseNpmCliCandidates(execPath);
  const npmCli = candidates.find((candidate) => existsSync(candidate));
  if (!npmCli) {
    throw new Error(`stable release Node runtime has no bundled npm CLI beside ${execPath}`);
  }
  return npmCli;
}

export function releaseNpmCliCandidates(execPath = process.execPath) {
  const executableDirectory = dirname(execPath);
  const candidates = [
    resolve(executableDirectory, "../lib/node_modules/npm/bin/npm-cli.js"),
    resolve(executableDirectory, "node_modules/npm/bin/npm-cli.js"),
  ];
  const cellarMarker = `${sep}Cellar${sep}`;
  const cellarIndex = execPath.indexOf(cellarMarker);
  if (cellarIndex >= 0) {
    candidates.push(resolve(execPath.slice(0, cellarIndex), "lib/node_modules/npm/bin/npm-cli.js"));
  }
  return candidates;
}

export function validateReleaseRuntime(actual) {
  return Object.entries(stableReleaseRuntime).flatMap(([name, expected]) =>
    actual?.[name] === expected
      ? []
      : [`stable release ${name} runtime must be ${expected}; received ${String(actual?.[name])}`],
  );
}

export function assertStableReleaseRuntime(actual = currentReleaseRuntime()) {
  const failures = validateReleaseRuntime(actual);
  if (failures.length > 0) {
    throw new Error(
      `stable release runtime is not reproducible:\n- ${failures.join("\n- ")}\nUse the exact Node version in .node-version with its bundled npm before generating stable assets.`,
    );
  }
  return actual;
}

export function releaseRuntimeFixtureCases() {
  return [
    { name: "exact stable runtime", actual: { ...stableReleaseRuntime }, expectedFailure: null },
    { name: "wrong Node runtime", actual: { ...stableReleaseRuntime, node: "v26.3.0" }, expectedFailure: "node runtime" },
    { name: "wrong npm runtime", actual: { ...stableReleaseRuntime, npm: "11.15.0" }, expectedFailure: "npm runtime" },
    { name: "wrong zlib runtime", actual: { ...stableReleaseRuntime, zlib: "1.2.12" }, expectedFailure: "zlib runtime" },
  ];
}

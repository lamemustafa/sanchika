export function resolveGalleryReleaseState(release, promoted = process.env.SANCHIKA_RELEASE_PROMOTED) {
  if (promoted && promoted !== "true") {
    throw new Error("SANCHIKA_RELEASE_PROMOTED must be true when the stable release is being promoted");
  }
  if (!release?.previousVersion) {
    throw new Error("release.json must declare previousVersion for publication-aware gallery status");
  }
  const isPromoted = promoted === "true";
  const currentStable = isPromoted ? release.version : release.previousVersion;
  const next = isPromoted ? null : release.version;
  const nextAnnouncement = isPromoted
    ? "No next package release is currently announced."
    : `v${release.version} is the declared stable artifact candidate; it is not released until detached publication succeeds.`;
  return { currentStable, next, nextAnnouncement, isPromoted };
}

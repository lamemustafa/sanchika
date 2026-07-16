# Sanchika Craft Protocol 0.1.0

## Boundary

Sanchika provides contracts and a repeatable agent craft loop for producing
clear, distinctive, trustworthy regulated interfaces. It is not an AI runtime,
automated compliance judgment, source of customer evidence, or authority mark.

Keep the skill outside the package dependency graph. Consumers record the
Sanchika commit and canonical skill hash; they do not vendor competing copies.

## State machine

Phases are strictly ordered:

```text
shape -> explore -> review -> owner_gate -> build -> reconcile -> verify
```

Statuses are `active`, `awaiting_owner`, `complete`, and `stopped`.

- Use `active` while work can proceed.
- Use `awaiting_owner` only at `owner_gate`, with `ownerDecision: pending`.
- Resume an approved owner gate at `build` with `ownerDecision: approved`.
- Use `complete` only at `verify`, after a distinct owner production approval
  and verified evidence.
- Use `stopped` with an allowed `stopReason`; keep `nextAction` when resumption
  is possible.

Phase changes may advance one step. Rebriefing may return `review` or
`owner_gate` to `shape` only with `ownerDecision: rebrief`. Terminal states do
not resume except `capability_blocked`, which may resume at the same phase with
unchanged acceptance thresholds.

Saved `iterations` and `reviews` are append-only audit history: every prior
entry must remain an unchanged prefix of the next snapshot. Rebriefs also
preserve prior-round directions as an unchanged prefix. TrustBrief and
DesignBrief remain frozen outside an explicit rebrief transition. A
`capability_blocked` resume must also preserve the complete TrustBrief,
DesignBrief, and direction set; only capability state and new evidence may
advance. A capability-blocked stop records the concrete `nextAction` needed to
resume.

`reviewRound` starts at 1 and increments only when rebriefing to `shape`.
Directions, iterations, and reviews record their round. Owner-gate consensus is
calculated only from the current round, while prior rounds remain immutable
audit history.

## Evidence contracts

Every `CraftRunV01` embeds valid Sanchika `TrustBrief`, `DesignBrief`, and
`EvidenceLoop` objects for the same surface. Validate all three with the
existing `@sanchika/patterns` validators.

Every direction records a stable ID and design-brief ID, a territory and
artifact references, semantic-blind and identity-blind proxy results, and its
qualification state.

Every review summary records its isolated reviewer role, calibration result,
complete 0-4 rubric scores, vetoes, preference, per-direction comparison with
both controls, and revision assessments. `producer: false` is explicit;
producing contexts cannot review their own output.

Every direct child of `craft/runs/` is a lowercase kebab-case run directory and
must contain `state.json` whose `runId` matches that directory. Every
non-template run also includes `instruction-manifest.json` beside its state and
retains the exact skill, protocol, run template, and calibration metadata used
for that run under `instructions/`. The manifest hashes those immutable
run-local snapshots, so later canonical instruction updates do not rewrite
historical evidence.

Evidence labels are limited to:

```text
ai-visual-proxy
ai-recognition-proxy
ai-comprehension-proxy
owner-approved
browser-verified
not-user-validated
```

## Calibration

Calibrate each reviewer role against all five controls in
`assets/calibration/metadata.json`. A reviewer must detect every relevant seeded
failure. Allow one prompt correction and one full rerun. A second failure
disqualifies that reviewer role until it is replaced.

Every control declares `mediaType: image/webp` and the SHA-256 of its WebP
bytes. Both canonical and run-retained packs verify media magic, digest,
reviewer-role coverage, and the 300KB limit before their evidence can qualify a
direction.

Persist `calibration.detectedFailures`, `calibration.corrections`, and
`calibration.fullReruns` on every passed review. The owner gate requires four
distinct reviewer IDs, one for each visual role.

Visual review roles:

1. brand relevance, distinctiveness, and cliché resistance;
2. craft, typography, composition, and identity-family potential;
3. product truth, human trust, and compliance boundaries;
4. accessibility, responsiveness, motion, implementation, and performance.

Copy review roles:

1. practitioner comprehension;
2. developer comprehension;
3. trust claims and limitations;
4. natural, relatable voice.

## Revision rule

For each revision, record `failingCriterion`, `changeHypothesis`, `invariants`,
expected evidence in `artifactRefs`, and `result`.

Stopped and complete runs retain every referenced direction, revision, and
production artifact inside their committed `craft/runs/<run-id>/evidence/`
directory. Retained asset bytes must exist and match their recorded SHA-256.

Mark `improved` only when a matching revision assessment shows at least three
of four relevant reviewer preferences, a targeted rubric median increase of at
least one whole point, and no critical trust, accessibility, or performance
regression.

Two consecutive non-improving revisions on one brief and criterion require a
rebrief. If a second brief repeats two failures on that criterion, stop with
`no_adoptable_direction`.

## Direction gate

A direction qualifies only when at least three of four visual reviewers prefer
it to the current baseline and honest without-skill control; relevance,
distinctiveness, craft, and trust medians are at least 3; no trust or
accessibility veto remains; and both recognition proxies pass with at least two
of three correct matchers without relying only on color.

Non-qualifying work cannot advance by override. Present qualifying directions
anonymously. The owner may select one or reject all.

Approval records `selectedDirectionId`. The selected direction must be a
qualifying direction from the current brief and review round, and its reviewed
record cannot change while entering `build`. Rejection is valid only at
`owner_gate` after the normal direction and reviewer gates have passed.

## Production gate

Only the owner can approve production. Direction approval does not approve the
finished production result. A `verify/complete` run records a distinct
`productionApproval` with `decision: approved`, `approvedBy: owner`, and an ISO
timestamp. Verification must include repository
gates, the browser/accessibility matrix, three comparable cold-cache mobile
measurements, rollback evidence, and post-deploy smoke evidence. Local
measurements are laboratory evidence, not field Core Web Vitals or user
validation.

A `verify/complete` run records these under `productionEvidence`:

- `repositoryGates`, `browserAccessibilityMatrix`, `rollbackEvidence`, and
  `postDeploySmoke`, each with `status: passed` and a retained `artifact`;
- exactly three `mobileMeasurements`, each with a distinct `runId`, the same
  `profileId`, `coldCache: true`, and non-negative `lcpMs` and `cls` values.

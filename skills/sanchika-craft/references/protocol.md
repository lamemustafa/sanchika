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
- Use `complete` only at `verify`, after owner approval and verified evidence.
- Use `stopped` with an allowed `stopReason`; keep `nextAction` when resumption
  is possible.

Phase changes may advance one step. Rebriefing may return `review` or
`owner_gate` to `shape` only with `ownerDecision: rebrief`. Terminal states do
not resume except `capability_blocked`, which may resume at the same phase with
unchanged acceptance thresholds.

## Evidence contracts

Every `CraftRunV01` embeds valid Sanchika `TrustBrief`, `DesignBrief`, and
`EvidenceLoop` objects for the same surface. Validate all three with the
existing `@sanchika/patterns` validators.

Every direction records a stable ID and design-brief ID, a territory and
artifact references, semantic-blind and identity-blind proxy results, and its
qualification state.

Every review summary records its isolated reviewer role, calibration result,
0-4 rubric scores, vetoes, preference, and revision assessments. Producing
contexts cannot review their own output.

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

## Production gate

Only the owner can approve production. Verification must include repository
gates, the browser/accessibility matrix, three comparable cold-cache mobile
measurements, rollback evidence, and post-deploy smoke evidence. Local
measurements are laboratory evidence, not field Core Web Vitals or user
validation.

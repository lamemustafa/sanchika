---
name: sanchika-craft
description: Run Sanchika's evidence-gated craft lifecycle for regulated interfaces. Use when an agent must shape, explore, independently review, pause for owner selection, build, reconcile, and verify a public or product surface without turning Sanchika into an AI runtime or automated compliance authority.
---

# Sanchika Craft

Run the lifecycle in order:

```text
shape -> explore -> review -> owner gate -> build -> reconcile -> verify
```

Read [references/protocol.md](references/protocol.md) before starting or
resuming a run. Copy [assets/run-template.json](assets/run-template.json) to
`craft/runs/<run-id>/state.json`, replace every `template-*` value, and persist
after every owner gate or terminal state. Use a lowercase kebab-case run ID
that exactly matches the containing directory. Retain the skill, protocol, run
template, and calibration metadata used by the run under `instructions/`, and
hash those immutable snapshots in the adjacent `instruction-manifest.json`.

Use code-native composition first. Treat raster generation as optional,
removable, and forbidden until a code-native direction qualifies. Never use a
generated asset as product evidence, readable UI, authority, or customer proof.

For every creative revision, record the failing criterion, change hypothesis,
invariants, expected evidence in `artifactRefs`, and the measured result. Do not
mark a revision improved unless the review evidence meets the protocol bar.

Use isolated reviewers that did not produce the artifact. Label their output as
AI proxy evidence. Never describe it as user validation or human testing.

Before changing phase or status, run:

```bash
node skills/sanchika-craft/scripts/validate-run.mjs craft/runs/<run-id>/state.json
```

When resuming or advancing a saved run, also pass its prior snapshot:

```bash
node skills/sanchika-craft/scripts/validate-run.mjs \
  craft/runs/<run-id>/state.json \
  --previous output/creative/<run-id>/previous-state.json
```

Stop at `owner_gate` with `status: awaiting_owner`. Only the owner can approve a
direction or production, and those are separate persisted decisions. A
subscription, quota, browser, or reviewer-capability interruption must save
state with a concrete next action; it must not lower any acceptance threshold.

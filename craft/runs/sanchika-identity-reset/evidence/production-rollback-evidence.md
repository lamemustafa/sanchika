# S10 production rollback evidence

This is a verified rollback path, not a claim that a rollback was executed.

The following retained commits resolve locally and establish the reversible
sequence:

- Pre-S10 gallery baseline: `70f016aa0a2a455433652b7779c3ff5c310af138`.
- S10 identity production merge: `b21141278e1f27a41e2257482515e8a4e736a693`.
- S10 Pages-smoke alignment merge: `4af6a7f1df60423e87c5a21c65e52ab9d5d22e15`.

If a production rollback is required, create a new revert PR against
`master` for `b21141278e1f27a41e2257482515e8a4e736a693`; also revert
`4af6a7f1df60423e87c5a21c65e52ab9d5d22e15` if restoring the prior landing
copy requires its prior smoke contract. Run the normal repository gates and
allow Pages to redeploy from the merged revert. This is a source-backed
rollback; no package publication rollback or destructive history rewrite is
required.

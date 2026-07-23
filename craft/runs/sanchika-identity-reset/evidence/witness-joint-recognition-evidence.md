# Witness Joint recognition proxy — 2026-07-23

Two 1440px browser boards were rendered from the current built Witness Joint
markup and stylesheet. They preserve the real HTML geometry rather than using a
flattened or blurred surrogate:

- `witness-joint-semantic-blind.webp` (32,204 bytes): all visible copy is
  deterministic pseudocopy except the Sanchika wordmark.
- `witness-joint-identity-blind.webp` (32,216 bytes): all visible copy is
  deterministic pseudocopy and the wordmark is the eight-character pseudoword
  `VELORIAN`.

Three fresh, independent AI matchers compared each board with the retained
`witness-joint-desktop-revision.webp` reference. Every matcher recognised both
boards as Witness Joint from the asymmetric headline/grid split, thin-rule
matrix, annotation position, and inset proof-card structure. No matcher used
colour as its decisive cue: semantic-blind **3/3**, identity-blind **3/3**,
colour-only **false**.

This passes the recognition-proxy threshold only. It is AI proxy evidence, not
human validation, and does not establish keyboard focus or behavioural media
mode support.

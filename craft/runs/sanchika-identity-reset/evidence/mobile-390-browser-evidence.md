# 390px browser evidence — 2026-07-23

This record captures the current identity-lab revision at a clean **390 × 844**
viewport from the built static gallery served locally. The three retained PNGs
are viewport captures without browser chrome or desktop overlays:

- `living-collection-mobile-390-revision.webp` (30,340 bytes)
- `witness-joint-mobile-390-revision.webp` (30,738 bytes)
- `craft-language-mobile-390-revision.webp` (34,262 bytes)

## Measured live results

For each route, the live browser check recorded:

- `document.documentElement.scrollWidth === 390` and `window.innerWidth === 390`;
  no horizontal overflow was observed.
- Every native anchor and summary control had a computed block size of at least
  **44px**; no interactive target was below that threshold.
- A single `main` landmark was present.
- The proof heading was present in the in-stage composition as
  “The proof belongs in the same frame.”

The revision makes the proof a part of the identity stage, suppresses Direction
A's competing ring at narrow widths, and retains the Witness Joint in the
same reading order. These are browser observations, not a qualification result.

## Remaining verification boundary

The browser record confirms the 390px layout and target-size checks only. The
current source includes reduced-motion and forced-colors rules, but those modes
were not behaviourally emulated in this capture. The available keyboard probe
did not establish a reliable focus order, so keyboard focus remains open.

No direction is qualified, no owner selection has been made, and this evidence
does not replace calibrated isolated review or human validation.

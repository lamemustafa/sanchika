# S10 round-two Anek specimen

This evidence corrects the round-one prerequisite gap. Round one remains
historical audit evidence only: it used the system fallback and cannot qualify a
direction.

## Source and rights

- Upstream: `google/fonts` commit
  `ac1371ad5eccb06352daf399448b673a79c98024`,
  `ofl/anekdevanagari/AnekDevanagari[wdth,wght].ttf`.
- Licence: SIL Open Font License 1.1. The retained licence notice is
  `apps/gallery/public/fonts/OFL-AnekDevanagari.txt`.
- Delivered self-hosted asset:
  `apps/gallery/public/fonts/AnekDevanagari-Latin-Variable.woff2`.
- Asset origin:
  `https://fonts.gstatic.com/s/anekdevanagari/v17/jVyS7nP0CGrUsxB-QiRgw0NlLaVH8S3tUx_4QQ.woff2`.
- SHA-256:
  `3a555aa25f31b51a84c965a66b5fca3128d638dd9d0dd0112904dde7c7e30cf4`.
- Payload: 114,232 bytes. One self-hosted font file is within the plan limit of
  two files and 160 KB total.

## Controlled specimen

The delivered WOFF2 declares `font-weight: 100 800` and `font-stretch: 75%
125%`. All round-two directions use the same `Anek Devanagari Lab` font face
with `font-display: swap` and no synthetic styling. The lab displays Latin only;
the Latin subset is therefore the required script coverage and no unused
Devanagari payload is shipped.

The browser asset inventory observed the local stylesheet and
`/fonts/AnekDevanagari-Latin-Variable.woff2`; it did not use an external font
origin. At both 1440px and 390px, every direction reported the local Anek family,
one main landmark, the in-frame proof heading, no horizontal overflow, and a
44px minimum interactive target.

## Paired comparison boards

Each board pairs the 1440px and 390px captures from identical round-two markup
and CSS:

- `living-collection-r2-typeface-board.webp`
- `witness-joint-r2-typeface-board.webp`
- `craft-language-r2-typeface-board.webp`

These are code-native browser captures. Any later review is AI proxy evidence,
not human validation.

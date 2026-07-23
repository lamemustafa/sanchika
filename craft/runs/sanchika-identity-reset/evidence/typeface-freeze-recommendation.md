# S10 selected-direction typeface comparison

## Scope

This is the one bounded comparison required after selecting the Witness Joint
territory and before production implementation. It does not change the
approved direction, add a production asset, or authorize production release.

The review holds the Witness Joint R2 copy, hierarchy, visible source →
interpretation → human-review structure, and responsive composition constant.
Its owner decision is only which family may carry that approved direction.

## Candidates and sources

| Candidate | Source and licence | Latin / Devanagari coverage | Delivery and fit |
| --- | --- | --- | --- |
| Anek Devanagari | `google/fonts` `ac1371ad5eccb06352daf399448b673a79c98024`, `ofl/anekdevanagari`; SIL OFL 1.1 retained locally | R2 uses the verified Latin subset; upstream family is Devanagari-first | One local variable WOFF2, 114,232 bytes, weight 100–800 and width 75–125. It is the only candidate already rendered in the qualified R2 desktop, mobile, keyboard, forced-colors, and reduced-motion evidence. |
| Hind | Official `google/fonts` `ofl/hind/METADATA.pb`; SIL OFL 1.1; upstream `itfoundry/hind` commit `6caef5262dc5bee3e033207082a073a6a1d172d6` | Metadata declares `latin`, `latin-ext`, and `devanagari` | Five static source files (300/400/500/600/700) rather than one variable production specimen. It would require fresh payload, browser, and recognition validation before it could replace the qualified R2 evidence. |
| Noto Sans Devanagari | Official `google/fonts` `ofl/notosansdevanagari/METADATA.pb`; SIL OFL 1.1; upstream `notofonts/devanagari` commit `bb8d2566a1708ef2dcc6396ee2eb261a18967f76` | Metadata declares `latin`, `latin-ext`, and `devanagari` | One variable source with weight 100–900 and width 62.5–100, but the source TTF is 647,144 bytes. It would need a deliberately scoped subset plus the same fresh validation before use. |

All alternative source facts above were read from the official Google Fonts
repository on 2026-07-23. No alternative binary was copied into the repository,
loaded by the gallery, or included in a browser result.

## Decision evidence

The selected direction's authored character comes from the open interval,
explicit evidence grammar, and accountable human decision—not from a
decorative type treatment. Anek keeps that hierarchy direct while giving the
large title a distinctive but readable voice. It already has the controlled
browser evidence required for the selected direction; changing now would make
the existing R2 recognition and accessibility proof inapplicable.

Hind is a credible quieter operational alternative. Noto Sans Devanagari is a
credible broad-coverage alternative. Neither is a safer production choice than
the already self-hosted Anek specimen for this Latin-only public landing, and
neither earns a new font request or payload before a specific need exists.

## Recommendation requiring owner freeze

Freeze **Anek Devanagari** as the S10 gallery-owned identity font for the
Witness Joint production build, using the existing local Latin variable file
and its retained OFL notice. Keep package typography unchanged and keep the
gallery identity layer isolated as `--gallery-brand-*`.

If approved, no further font exploration is permitted during S10. If rejected,
the owner must name Hind or Noto Sans Devanagari; that choice reopens the
typeface evidence required before production implementation.

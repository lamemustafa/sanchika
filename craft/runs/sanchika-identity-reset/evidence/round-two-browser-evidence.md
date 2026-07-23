# S10 round-two browser evidence

## Build and served artifact

`SANCHIKA_CRAFT_LAB=true node_modules/.bin/astro build` completed in
`apps/gallery` and rendered all 64 static pages, including the three craft-lab
routes. The package-manager launcher did not yield a usable run in this local
environment, so that is recorded as an environment gap rather than a package
verification pass. The successful static artifact was served locally for the
checks below.

## Observed browser facts

At both 1440 x 900 and 390 x 844, each of `living-collection-r2`,
`witness-joint-r2`, and `craft-language-r2` reported:

- `"Anek Devanagari Lab", system-ui, sans-serif` as the body font family;
- one `main` landmark and the proof heading `The proof belongs in the same
  frame.`;
- zero horizontal overflow; and
- a 44px minimum interactive target.

The browser network inventory also observed the self-hosted
`/fonts/AnekDevanagari-Latin-Variable.woff2` asset alongside the local
stylesheet. This is direct runtime evidence that the rebriefed font file was
requested from the gallery artifact.

## Keyboard and preference limitations

The unique `Skip to proof` control received a visible focus outline when
focused. The available browser-control keyboard action did not advance focus
past that control, so complete keyboard progression was not established.
Forced-colors and reduced-motion emulation were not exposed by the available
browser control. The source includes those media-query paths, but their runtime
behaviour remains unverified. These limits are intentionally not treated as an
accessibility pass or as human validation.

## Capture boundary

The paired R2 boards are browser screenshots, not user research. They support
layout, loaded-font, overflow, target-size, and landmark observations only;
they do not resolve the owner gate or substitute for user validation.

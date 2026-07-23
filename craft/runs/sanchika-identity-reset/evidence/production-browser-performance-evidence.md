# S10 production browser and performance evidence

## Scope

Local static production build, normal (craft-lab disabled), 61 HTML routes.
Chrome Headless 150.0.0.0; `http://127.0.0.1:4173/`; 390 x 844 viewport.
This is controlled local laboratory evidence, not field Core Web Vitals or human validation.

## Cold-cache mobile measurements

Each of the three runs used the same browser, route, viewport, cache-disabled
context, `Network.clearBrowserCache`, 150 ms latency, 204800 B/s download,
102400 B/s upload, 4x CPU throttle, and a three-second post-load window.

| Run | LCP | CLS | Horizontal overflow | Local Anek available |
| --- | ---: | ---: | --- | --- |
| 1 | 1168 ms | 0 | no (390 / 390) | yes |
| 2 | 1148 ms | 0 | no (390 / 390) | yes |
| 3 | 1148 ms | 0 | no (390 / 390) | yes |
| median | 1148 ms | 0 | n/a | n/a |

The median LCP is within the 2500 ms budget and all CLS readings are within
the 0.05 budget. The earlier `font-display: swap` measurement produced CLS
0.19965049512611163; the production identity face now uses `font-display:
optional`, followed by the three runs above.

## Behaviour and accessibility checks

- A JavaScript-disabled 390 px browser context retained the page title, exact
  promise, AX-031 proof text, skip link, primary navigation, and no horizontal
  overflow. The page is settled server-rendered HTML; the optional replay
  enhancement is not required for content.
- The accessible tree exposed a banner, main landmark, labelled primary
  navigation, labelled landing actions, headings, search, and contentinfo.
- A sequential keyboard check reached the native primary-navigation summary
  with a visible solid outline. At 200% page scale, visual viewport width was
  195 px, document overflow remained false, and the complete hero stayed in
  its 390 px layout width.
- Reduced-motion and forced-colors checks were run in the preceding R2
  browser evidence; replay reports settled proof when motion is reduced.

## Artifact budgets and origin boundary

`check-gallery.mjs` on this build reports the production CSS at 16,617 gzip
bytes (budget: 70 KB). Landing JavaScript totals 1,775 gzip bytes: local search
1,057, replay 416, and shortcut 302 (budget: 15 KB). The gallery artifact
check passed the normal route, asset graph, and local-origin policy; no
craft-lab HTML or navigation is emitted in this production build.

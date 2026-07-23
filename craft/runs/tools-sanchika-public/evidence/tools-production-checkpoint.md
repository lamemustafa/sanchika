# Tools S11 production checkpoint

**Captured:** 2026-07-24T00:48:39+05:30
**Status:** deployed and partially verified; the craft production-completion gate remains open.

## Approved source and deployment

- Owner authorization was applied to the GitHub `production` environment gate.
- The deployed Tools source is `726ec6e7ddf9fda1c38f221be6c950fafc330876` (`feat: refine Tools Sanchika proof route`).
- The published immutable image is `ghcr.io/lamemustafa/complyeaze-tools@sha256:ceccfcf2df95b02a8df80d5f244666bcc4d063081aa377d428f67ab26b70ea87`.
- The image publish run passed: [30035356063](https://github.com/lamemustafa/complyeaze-tools/actions/runs/30035356063).
- The digest-pinned production deploy passed: [30036814269](https://github.com/lamemustafa/complyeaze-tools/actions/runs/30036814269). Its apply, rollout, and service-smoke job steps all passed.

## Public-edge and browser evidence

- `https://tools.complyeaze.com/sanchika/` returned HTTP 200 with the expected Sanchika proof route title and primary heading.
- `https://tools.complyeaze.com/-/health` returned `ok` after deployment.
- Browser review confirmed one main landmark, one H1, named outbound links, and the initial keyboard focus landing on the accessible `ComplyEaze Tools home` link.
- Captures at 320x844, 390x844, 768x960, and 1440x900 show the browser-local/no-account/no-upload boundary in reading order without visible horizontal overflow.
- These are browser-verified deployment observations, not human usability validation.

## Rollback target

The immediately preceding successful production deployment is source `41d66511be77b377f42a05fe61d08d82e425d5c8` with immutable image `sha256:425e07f6397f01d128584a2b9c1c85cdf96d2be97afc4cc2b54073bbef643eee`, recorded by [deploy run 29512360936](https://github.com/lamemustafa/complyeaze-tools/actions/runs/29512360936). The existing digest-pinned Deploy Production workflow can redeploy that exact image if rollback is required; rollback was not exercised because the new deployment is healthy.

## Open verification items

1. Cloudflare JavaScript Detection attempted a same-origin `cdn-cgi/challenge-platform` connection which the page CSP correctly blocks with `connect-src 'none'`. The application did not make the request and the page remained functional. Do not relax the CSP without a deliberate owner security decision; alternatively assess disabling the conflicting Cloudflare edge feature.
2. The required three comparable cold-cache 390px mobile performance measurements are not retained. The available environment lacks the Chrome DevTools MCP required by the performance protocol, so no substitute measurement was recorded.
3. The remaining production browser accessibility matrix (reduced motion, forced colors, 200% zoom, and long-content checks) is still required before the craft run can be completed.

# S10 round-two behavioural accessibility evidence

## Runtime and scope

A real headless Chrome session was run against the locally served rebuilt
gallery artifact at 390 x 844 for all three R2 routes: Living Collection,
Witness Joint, and Craft Language. This is browser-verified laboratory evidence;
it is not user research or a production accessibility conformance claim.

## Keyboard traversal

Each route exposes 12 keyboard-actionable controls. A sequential Tab run reached
each one exactly once with no hidden focus target or trap:

1. `Skip to proof`
2. Sanchika wordmark
3. `Real contract proof`
4. `Inspect real proof`
5. `Read the boundary`
6. `Open source before deciding`
7. `Inspect request-evidence contract`
8. Primary-source disclosure
9. Portal-context disclosure
10. Working-note disclosure
11. `Open the source checkpoint`
12. `Inspect the audit-trail contract`

The skip link received `:focus-visible`, and all authored links received the
gallery's solid 2px focus outline. Native disclosures retained their browser
focus outline. The recorded boxes were at least 44px in their actionable
dimension; the one wrapped checkpoint link measured 72px high.

## Media behaviour

With `prefers-reduced-motion: reduce` emulated, each route reported a matching
media query and computed `scroll-behavior: auto` on the document element.

With `forced-colors: active` emulated, each route reported a matching media
query; the identity joint retained `forced-color-adjust: auto` and rendered a
system-resolved white background. Horizontal overflow remained zero in the
forced-colors viewport.

These direct checks resolve the previously recorded capability limitation for
keyboard progression, reduced motion, and forced colors. They do not replace
manual assistive-technology testing or human validation.

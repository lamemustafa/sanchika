# 433px browser evidence — 2026-07-21

The owner supplied these captures from Chrome responsive mode at **433 × 768**:

- Direction A: `living-collection-mobile-433-*.png`
- Direction B: `witness-joint-mobile-433-*.png`
- Direction C: `craft-language-mobile-433-*.png`

They show the live local routes, including the rendered Sanchika Review Desk
contract, reflowing through a narrow viewport. Browser chrome, DevTools, and an
unrelated desktop overlay are visible in the files. The PNG pixel dimensions are
the desktop screenshots, not the responsive viewport dimensions.

## Observed results

- Direction B and Direction C keep a single vertical reading order from hero to
  composition to proof. The real contract remains visible and its review queue,
  decision fields, checkpoint, source evidence, and audit excerpt all reflow.
- Direction A keeps its proof readable, but the lime ring visibly crosses and
  competes with `source` and `accountable decision` in the mobile composition.
  It does not satisfy the current direction's own legibility criterion.
- Direction C's embedded Review Desk foreground is legible in the new capture;
  the earlier contrast finding has been repaired in rendered output.

## Limits

This is supporting mobile evidence only. It is not the plan's required clean
390 × 844 capture, does not establish keyboard focus order, forced-colors,
reduced motion, zoom, or measured hit targets, and must not qualify a direction
or replace an owner decision.

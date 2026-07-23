# S11 Tools direction review — round 1

Evidence label: `ai-visual-proxy`, `not-user-validated`. This is an isolated
review of code-native exploration boards, not human validation or production
evidence.

## Calibration

All four reviewers passed their role-specific calibration. They detected the
canonical seeded failures relevant to their roles: generic purple/glass AI
claims; off-brief serif-poster treatment; fake government authority and
automated-compliance claims; and the mobile control's low contrast, undersized
targets, color-only state, and identifier overflow. Motion-only status was
documented but cannot be independently observed in a still capture.

## Result

| Direction | Baseline/control comparison | Median rubric (R/D/C/T) | Decision |
| --- | --- | --- | --- |
| Workbench strip | 3/4 baseline, 4/4 control | 4/4/4/4 | Disqualified: the plausible ZIP filename conflicts with the Tools no-committed-filename boundary. |
| Field guide | 4/4 baseline, 4/4 control | 4/3/4/4 | Qualifying candidate after both recognition proxies pass. |
| Proof index | 4/4 baseline, 4/4 control | 4/3/4/4 | Not advanced: no recognition proxy retained in this round. |

The Field Guide is a readable public boundary surface: source, browser-local
draft, and export are explicit; it avoids making saved-workflow, authority, or
automated-compliance claims. Its implementation must only claim source,
supported input, and review-date fields where the relevant tool metadata exists.

## Recognition proxies

Three independent matchers mapped both retained blinded proxies to Direction B
using the Source/Draft/Export reading structure, two-column guide geometry,
typography, and boundary callout. None used color alone.

| Matcher | Semantic blind | Identity blind | Color only |
| --- | --- | --- | --- |
| semantic-matcher-1 | B | B | false |
| semantic-matcher-2 | B | B | false |
| semantic-matcher-3 | B | B | false |

The owner gate is the next required action. No Tools implementation or public
deployment is implied by this review.

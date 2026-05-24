# ADR-0006: Pin–constraint conflicts block Randomise rather than auto-resolving

## Status
Accepted

## Context
When a **Pinned Slot** contains a perk that an active **Build Constraint** would exclude (e.g. the perk's category is excluded, or the perk is on the **Perk Blacklist**), two resolution strategies were considered:

1. **Pin silently wins** — the pinned perk is always included; the constraint is overridden without user action. Simpler to implement; the Randomise button stays enabled.
2. **Conflict blocks Randomise** — the Randomise button is disabled and an explicit warning is shown until the user resolves the conflict by either removing the constraint or unpinning the slot.

## Decision
Conflicts block Randomise. The user must explicitly resolve the conflict before generating a build. A warning is displayed in the Constraints Panel identifying the conflict.

## Consequences
- The user is never surprised by a silent override — what they see in the constraints panel is exactly what will be applied.
- The Randomise button being disabled is a consistent signal: it always means "your current configuration is invalid," whether due to a pin conflict, an impossible pool, or a build-size/pin-count mismatch.
- The user bears a small extra step when a conflict exists, but this is intentional: the feature prioritises explicit user control over convenience.
- Implementation must track which pinned perks conflict with active constraints and surface this as a derived state, not a side effect of generation.

# ADR-0005: Partial builds (1–4 perks) are permitted

## Status
Accepted

## Context
The original domain model defined a Build as "exactly 4 perks selected for play." The `builds` table schema and the `validate-build` Edge Function both permit null slots — there was no technical enforcement of the 4-perk constraint, only a domain convention.

When designing the Saved Builds UI, two positions were considered:

1. **Enforce 4 perks at the UI layer** — disable the Save button until all slots are filled. Upholds the original domain definition.
2. **Permit 1–4 perks** — enable Save with at least one perk; warn when slots are unfilled but do not block.

## Decision
Allow partial builds (1–4 perks). The Save button is enabled with at least one perk. The Save modal displays a warning when any slot is empty but does not prevent saving.

## Consequences
- Users running challenges or limited-perk modes (e.g. a one-perk challenge run) can save their loadout without being forced to pad it with unwanted perks.
- The domain glossary has been updated: a Build is now "1–4 perks selected for play."
- All code that reads saved builds must treat null slots as valid — no assumption that `perks[i]` is non-null.
- The existing `validate-build` Edge Function already accepts null slots; no server-side changes are required.
- The original "exactly 4" convention is abandoned. This is intentional: we cannot know the user's intent, and restricting to 4 would silently break valid use cases.

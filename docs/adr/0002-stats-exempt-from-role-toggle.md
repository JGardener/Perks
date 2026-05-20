# ADR-0002: Stats tab is exempt from the role toggle

## Status
Accepted

## Context
With role state lifted to `PerkList` (see ADR-0001), the Survivor/Killer toggle sits above all tab content. The Stats tab shows grade distribution and top-rated perks — information that exists for both Survivor and Killer perks.

The question was whether Stats should respond to the role toggle (showing one role's stats at a time) or always show both roles simultaneously.

## Decision
Stats is exempt from the role toggle. It always shows both Survivor and Killer stats stacked vertically. The role toggle is hidden when the Stats tab is active.

## Consequences
- The Stats tab functions as a full comparative overview — Survivor and Killer distributions are visible side by side without switching.
- Hiding the toggle when Stats is active avoids implying it has an effect it doesn't have.
- If Stats ever needs role filtering (e.g. the perk library grows large enough that the page becomes unwieldy), this decision will need revisiting.

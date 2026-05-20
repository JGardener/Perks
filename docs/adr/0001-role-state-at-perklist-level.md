# ADR-0001: Role state lives at PerkList level

## Status
Accepted

## Context
Both the Perks tab (`PerkSection`) and the Build tab (`BuildMaker`) need to know the active Role (Survivor or Killer). Initially each component owned its own role toggle independently — `BuildMaker` had its own Survivor/Killer toggle, and `PerkSection` had a sub-tab bar inside the Perks tab panel.

This meant the same concept (which role the user is focused on) lived in two different places with two different visual treatments, and switching tabs reset the user's role context.

## Decision
Lift role state to `PerkList`, the common parent of both tabs. Render a single Survivor/Killer toggle between the main tab bar and the tab content. The toggle is hidden when the Stats tab is active (see ADR-0002).

## Consequences
- Role selection persists when switching between the Perks and Build tabs — the user stays in their chosen role.
- The Perks sub-tab bar and the BuildMaker role toggle are both removed; there is one toggle, one visual treatment.
- `PerkSection` and `BuildMaker` receive role as a prop rather than owning it, which simplifies their internal state.
- If a third tab ever needs role awareness, it gets it for free. If a tab needs to be role-agnostic, it must be explicitly exempted (as Stats is).

# ADR-0007: Build constraints persisted to localStorage scoped by role

## Status
Accepted

## Context
The **Constraints Panel** state (perk blacklist, category/character filters, build size) could be treated as ephemeral (reset on page reload) or persisted. Two options were considered:

1. **Ephemeral** — constraints reset on reload. Zero persistence complexity; always starts clean.
2. **Persisted to localStorage, scoped by Role** — constraints survive page reloads and are independent per Role. Slightly more implementation surface; no backend required.

## Decision
Persist to localStorage, keyed by Role. Survivor and Killer constraints are stored independently.

## Consequences
- Users who invest time in a constraint set (e.g. a blacklist of perks they dislike) do not need to rebuild it each session.
- No backend changes required — constraints are personal preference, not shareable or user-account-bound.
- Constraints must be serialisable to JSON; no runtime objects in constraint state.
- A "Reset constraints" control (with confirmation) is required to give users a clear escape hatch from stale persisted state.
- If the perk pool changes (new chapter released), blacklisted perk names that no longer exist in the pool are silently ignored on load.

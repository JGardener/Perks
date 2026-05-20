# ADR-0004: JSONB column for build perks instead of a junction table

## Status
Accepted

## Context
When designing the `builds` table for Saved Builds, two options existed for storing the 4 perks in a build:

1. A `build_perks` junction table with `build_id`, `perk_name`, and `slot_index` columns.
2. A `perks jsonb` column on the `builds` table storing an array of 4 perk name strings.

## Decision
Store build perks as a JSONB array on the `builds` table.

## Consequences
- Build perks are always read as a unit — the 4 perks are never queried independently, filtered, or aggregated. A junction table would add a join with no benefit.
- The set is fixed-size (exactly 4) and fixed-cardinality. The main justification for a separate table — the ability to grow the relationship — does not apply.
- Perk names are the stable identifier from the external DBD API. There is no local `perks` table to foreign-key against, so a junction table would not enforce referential integrity anyway.
- Choosing JSONB here is a deliberate denormalization, not an oversight. The trade-off: simpler schema and faster reads at the cost of no DB-level constraint on perk count or validity — enforced instead by the build validation Edge Function.

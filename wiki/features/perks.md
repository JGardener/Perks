# Feature: Perks

**Summary**: How the perk list works — data loading, the category system, rating perks A–F, and the sort/filter controls.

**Sources**: `src/hooks/usePerks.ts`, `src/hooks/useCharacters.ts`, `src/hooks/useRatings.ts`, `src/services/dbdApi.ts`, `src/components/PerkSection/PerkSection.tsx`, `src/components/PerkCard/PerkCard.tsx`, `src/components/PerkModal/PerkModal.tsx`, `src/components/CategoryFilter/CategoryFilter.tsx`, `src/components/RatingFilter/RatingFilter.tsx`, `src/utils/perkUtils.ts`, `src/utils/categoryColors.ts`

**Last updated**: 2026-06-05

---

## Data Loading

`getAllPerks()` fetches `GET /api/perks` (proxied to `dbd.tricky.lol`), returning a `Record<string, Perk>`. `usePerks` converts this to a flat `Perk[]` via `Object.values`.

`getCharacters()` fetches `GET /api/characters`, returning a `Record<string, Character>`. `useCharacters` transforms this into `Record<number, string>` (numeric ID → name) for fast lookup in sort and display.

Both hooks use `useAsyncData` and expose a `retry()` for error recovery.

`PerkList` splits the full perk array into `survivorPerks` and `killerPerks` and passes the relevant subset to `PerkSection` based on the active role tab.

---

## Perk Display

`PerkCard` renders each perk as a horizontal card:

- **Octagonal icon**: clipped to an octagon CSS polygon. Border colour from `getCategoryColor(perk.categories)`, applied as `--category-color`. Falls back to ember amber when categories is null/empty.
- **Description**: rendered via `dangerouslySetInnerHTML` using `resolveDescription` which substitutes `{Tunable.*}` placeholders with numeric values and wraps `{Keyword.*}` in `<span class="keyword">`.
- **Grade buttons**: A–F. Stop propagation so clicking a grade doesn't open the modal. Clicking a grade that is already selected deselects it (sets `null`).
- **Click**: opens `PerkModal` with the full perk detail.

Image path: `getPerkImageUrl(perk.image)` strips the path and serves from `/perks/{filename}.png`. Falls back to `/perk-placeholder.svg` on 404.

---

## Rating System

Ratings are `Grade` values: `A | B | C | D | E | F`.

`useRatings` owns rating state:

- Authenticated: reads from and writes to the `ratings` Supabase table. Writes are optimistic with rollback.
- Unauthenticated: no ratings (the Supabase-only path; the old localStorage fallback was removed).

Passing `null` as grade deletes the rating.

---

## Categories

14 categories exist as a `PerkCategory` union. Each has a distinct colour in `CATEGORY_COLORS`. The `CategoryFilter` component renders a button row where each button is styled in its category colour.

Available categories are derived per-role from the current perk pool, so survivor and killer sections never show each other's categories.

Filter state is a `Set<PerkCategory>`. A perk passes the category filter if it has at least one category in the active set (OR logic), or if the set is empty (no filter).

---

## Filters and Sort

Filters and sort are managed locally in `PerkSection`.

**Category filter**: toggle individual categories. Multi-select. Clear button when active.

**Rating filter**: toggle individual grades (A–F) and/or "Unrated". Multi-select. Composes with category filter — both must pass.

**Sort**:

| Field | Behaviour |
|-------|-----------|
| Name | Alphabetical by `perk.name` |
| Character | Alphabetical by character name (`characterMap[perk.character]`); base perks (`character: null`) sort to end |
| Grade | By `GRADE_ORDER`; unrated perks sort to end |

Direction can be toggled asc/desc for any field.

---

## Related pages

- [[data-model]]
- [[hooks]]
- [[components]]
- [[styles]]
- [[features/build-maker]]

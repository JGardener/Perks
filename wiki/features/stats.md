# Feature: Stats

**Summary**: How the Stats tab works — personal grade distribution, top-rated perks, and the community distribution section gated behind authentication.

**Sources**: `src/components/StatsView/StatsView.tsx`, `src/components/StatsView/GradeChart.tsx`, `src/components/StatsView/GradePillStrip.tsx`, `src/components/StatsView/TopPerks.tsx`, `src/hooks/useCommunityGrades.ts`, `src/utils/gradeColors.ts`, `src/utils/communityPerks.ts`

**Last updated**: 2026-06-05

---

## Overview

The Stats tab is rendered by `StatsView`. It receives:

- `perks: Perk[]` — full perk list (all roles)
- `ratings: Record<string, Grade>` — the current user's ratings
- `communityGrades: CommunityGrade[]` — aggregated community ratings (empty for anon users)

If `ratings` is empty, an empty-state prompt is shown directing the user to the Perks tab.

---

## Personal Stats

For each role (Survivor, Killer), `buildRoleStat` computes:

- **Total perks**: all perks for the role.
- **Rated count**: perks the user has rated.
- **Distribution**: for each grade A–F, the count and percentage of rated perks.
- **Top perks**: all A-rated perks, sorted alphabetically.

### `GradeChart`

SVG horizontal bar chart. Bars are normalised so the tallest grade count fills the available width — this makes the relative distribution visually obvious even when the absolute counts are small.

Each bar is filled with `GRADE_COLORS[grade]`. Accessibility: `role="img"` with a `<title>` on the SVG; individual bars have `aria-label`.

### `TopPerks`

Scrollable horizontal row of octagonal perk icons. Shows all A-rated perks (personal) or community top picks. Perk name below each icon.

---

## Community Stats

The community section appears below the personal section for each role.

**Auth gate**: `useCommunityGrades` returns an empty array for unauthenticated users because the `perk_community_grades` view is restricted to the `authenticated` role.

- **Authenticated + data available**: renders `GradePillStrip` (community distribution) and a `TopPerks` row of community top picks (most commonly A-rated perks across all users).
- **Authenticated + no data**: renders nothing for the community section.
- **Unauthenticated**: renders a ghosted inline pill strip (`aria-hidden="true"`) with a "Sign in to unlock →" button.

### `GradePillStrip`

Row of pills, one per grade. Each pill shows:

- Grade letter (coloured by `GRADE_COLORS[grade]`)
- Mini bar (width proportional to percentage share)
- Percentage label

Pill border uses the grade colour at 33% opacity.

### Community Top Picks

Computed by `getCommunityTopPerks` (in `src/utils/communityPerks.ts`): finds perks where the plurality grade in `communityGrades` is A, filtered to the current role.

---

## Data Flow

```
StatsView
  ├── ratings (from useRatings via PerkList)
  ├── communityGrades (from useCommunityGrades via PerkList)
  └── perks (from usePerks via PerkList)
        │
        ├── buildRoleStat() → personal distribution + top perks
        └── buildCommunityDist() → community distribution per role
```

All computation is memoised with `useMemo`.

---

## Related pages

- [[hooks]]
- [[components]]
- [[data-model]]
- [[features/auth]]
- [[styles]]

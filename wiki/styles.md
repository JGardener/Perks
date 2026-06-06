# Styles

**Summary**: CSS custom properties, global base styles, the two fonts, SCSS module conventions, and the single responsive breakpoint.

**Sources**: `src/styles/variables.scss`, `src/styles/global.scss`, `src/utils/categoryColors.ts`, `src/utils/gradeColors.ts`

**Last updated**: 2026-06-05

---

## CSS Custom Properties

Defined in `src/styles/variables.scss` on `:root`. All components consume these tokens rather than hardcoded values.

### Palette

| Token | Value | Meaning |
|-------|-------|---------|
| `--color-void` | `#0a0a0a` | Page background — near-black |
| `--color-ash` | `#111111` | Card backgrounds |
| `--color-ember` | `#e8973a` | Primary accent — DBD's amber |
| `--color-ember-dim` | `#6b4318` | Subtle borders and empty slot indicators |
| `--color-blood` | `#8b1a1a` | Danger / destructive actions |
| `--color-parchment` | `#d4c5a9` | Primary text |
| `--color-parchment-dim` | `#a8957e` | Secondary text (lightened from original for readability) |

### Semantic aliases

| Token | Maps to |
|-------|---------|
| `--page-background` | `--color-void` |
| `--card-background` | `--color-ash` |
| `--card-border` | `--color-ember-dim` |
| `--primary-text-color` | `--color-parchment` |
| `--secondary-text-color` | `--color-parchment-dim` |
| `--accent-color` | `--color-ember` |

### Glow effects

```
--glow-ember:       0 0 10px rgba(232,151,58,0.35), 0 0 30px rgba(232,151,58,0.1)
--glow-ember-hover: 0 0 18px rgba(232,151,58,0.6),  0 0 50px rgba(232,151,58,0.2)
```

Used on interactive elements and active states throughout the UI.

---

## Fonts

Both fonts are loaded from Google Fonts.

| Token | Font | Use |
|-------|------|-----|
| `--font-heading` | Cinzel (serif) | Headings, labels, canvas exports |
| `--font-label` | Oswald (sans-serif) | Body text, buttons, picker items |

Body `font-family` is set to `var(--font-label)` in `global.scss`.

---

## Base Styles (`global.scss`)

- **Root font size**: `106.25%` (17 px). All sizing uses `rem` — this scales everything up ~6% for improved readability.
- **Box model**: `box-sizing: border-box` on `*`, `*::before`, `*::after`.
- **Background**: `var(--page-background)` plus a fixed atmospheric radial gradient (dark fog from top and bottom).
- **`.keyword`**: Ember-colored italic text for in-game keyword spans rendered by `resolveDescription`.
- **`kbd`**: Styled inline key badges for input references in perk descriptions.
- **Scrollbars**: Thin ember-colored scrollbars via `scrollbar-width: thin` (Firefox) and `::-webkit-scrollbar` rules (Chromium).

---

## Grade Colours (`gradeColors.ts`)

```ts
GRADE_COLORS: Record<Grade, string> = {
  A: '#4ade80',  // green
  B: '#60a5fa',  // blue
  C: '#e8973a',  // amber
  D: '#fb923c',  // orange
  E: '#f87171',  // light red
  F: '#8b1a1a',  // blood red
}

GRADE_ORDER: Record<Grade, number> = { A:0, B:1, C:2, D:3, E:4, F:5 }
```

Used by `GradeChart`, `GradePillStrip`, `RatingFilter`, and both canvas export functions.

---

## Category Colours (`categoryColors.ts`)

Each `PerkCategory` maps to a distinct hex colour in `CATEGORY_COLORS`. The colour is applied to the octagonal perk icon border via `--category-color` CSS custom property. `getCategoryColor(categories)` returns the colour of the first category in the array, or `undefined` if `categories` is null or empty.

Notable values:

| Category | Color | Rationale |
|----------|-------|-----------|
| `chasing` | `#e05a20` | Hot orange-red — pursuit |
| `concealment` | `#4a5ab5` | Indigo — shadows |
| `safeguard` | `#2a7a3a` | Green — protection |
| `cruelty` | `#8b1a2a` | Dark red — brutality |
| `strategy` | `#6a3a9a` | Purple — planning |

---

## SCSS Modules

All component styles use CSS Modules (`.module.scss`). Class names are locally scoped. BEM-inspired naming convention: `block__element--modifier`.

No global class names except those in `global.scss` (`.keyword`, `kbd`).

---

## Responsive Breakpoint

A single breakpoint at `max-width: 640px` is applied consistently across all component SCSS modules. Adjustments at this breakpoint:

- Header auth controls stack below the title.
- Perk grid drops to a single column.
- Side padding tightens.
- Tab buttons fill full width.
- Card icon and grade buttons scale down.

All components are tested down to 360 px viewport width.

---

## Related pages

- [[components]]
- [[features/perks]]
- [[features/build-maker]]

# Components

**Summary**: Catalogue of every UI component — its file, props, layout responsibilities, and accessibility approach.

**Sources**: `src/components/*/`, `src/App.tsx`

**Last updated**: 2026-06-05

---

## App Shell

### `App`

`src/App.tsx` — root component. Renders the page header and provides `AuthModalContext`. Manages auth modal open/close state. The header contains the title, subtitle, and sign-in/out controls.

---

## Tab Container

### `PerkList`

`src/components/PerkList/PerkList.tsx`

The top-level orchestrator. Owns the main tab state (`perks` | `build` | `stats`) and role sub-state (`survivor` | `killer`). Instantiates all top-level hooks (`usePerks`, `useCharacters`, `useRatings`, `useBuilds`, `useCommunityGrades`) and passes data down as props.

- Tab bar uses full ARIA tab pattern: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` / `id` pairs, `hidden` on inactive panels.
- Role toggle rendered for Perks and Build tabs; hidden for Stats.
- Wraps each tab panel in `<ErrorBoundary>`.
- On load error, renders a retry prompt with `role="alert"`.

---

## Perk List Tab

### `PerkSection`

`src/components/PerkSection/PerkSection.tsx`

Perk grid with sort and filter controls. Derives available categories from the current role's perk pool so each role shows only its own categories.

Props: `role`, `perks`, `characterMap`, `ratings`, `onRate`

- Renders `SortBar`, `CategoryFilter`, `RatingFilter`, then the perk grid.
- Category and rating filters compose: both run before sorting.
- Sort fields: name / character / grade. Direction: asc / desc.

### `PerkCard`

`src/components/PerkCard/PerkCard.tsx`

Horizontal card (octagonal icon, description, A–F grade buttons). Clicking the card opens `PerkModal`; grade button clicks stop propagation.

- Octagon border colour set via `--category-color` CSS custom property from `getCategoryColor(perk.categories)`.
- Description rendered via `dangerouslySetInnerHTML`. `resolveDescription` produces the HTML, then sanitizes it with `DOMPurify` (allowlist: `span`, `kbd` tags; `class` attr only) before injection.
- Image falls back to `perk-placeholder.svg` on error.

### `PerkModal`

`src/components/PerkModal/PerkModal.tsx`

Full-detail dialog. Larger octagonal icon, untruncated description, grade buttons.

- Focus trap (Tab/Shift+Tab cycle within modal).
- Escape key and click-outside close.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.

### `SortBar`

`src/components/SortBar/SortBar.tsx`

Sort field selector + direction toggle. Full ARIA toolbar pattern: `role="toolbar"`, `role="group"`, `aria-pressed` on buttons.

### `CategoryFilter`

`src/components/CategoryFilter/CategoryFilter.tsx`

Row of category toggle buttons. Each button is styled in its category colour; active state = solid fill.

- `available` prop is derived per-role — only categories present in the current role's perks appear.
- Acts as a visual legend for category colours.
- Shows a Clear button when any filter is active.

### `RatingFilter`

`src/components/RatingFilter/RatingFilter.tsx`

Row of A–F + Unrated toggle buttons. Multi-select. Active state is a `Set<Grade | "unrated">`.

- Each grade uses the corresponding `GRADE_COLORS` colour.
- Composes with category filter: both filters must pass for a perk to show.
- Shows a Clear button when any filter is active.

---

## Build Tab

### `BuildMaker`

`src/components/BuildMaker/BuildMaker.tsx`

4-slot build composer. Owns slot state, search state, and the FLIP animation ghost (`FlyingPerk`).

Props: `perks`, `role`, `characterMap`, `hasRatings`, `onExportTierList`, `userId`, `onOpenAuthModal`, `onSave`, `builds`, `onDelete`

Key behaviours:
- **FLIP animation**: clicking a perk in the picker spawns `<FlyingPerk>`, a fixed-position ghost that animates from the picker item's position to the target slot via Web Animations API. Respects `prefers-reduced-motion` (duration = 0).
- **URL sync**: on mount, reads `?role=&p0–p3=` and hydrates slots. A `urlReady` ref prevents URL writes before hydration. After mount, `replaceState` keeps the URL in sync with slot changes.
- **Role change**: clears slots and search when role changes from the parent.
- **Pin button**: each slot has a Pin/Pinned toggle. Removing a perk from a pinned slot auto-unpins it.
- **Save build**: opens `SaveBuildModal` if authenticated; otherwise opens auth modal.
- **Banned perk indicator**: picker items with a ⊘ overlay when on the blacklist; dimmed when build is full.

Renders: `ConstraintsDrawer`, `ExportToolbar`, `SaveBuildModal`, `SavedBuilds`.

### `FlyingPerk` (internal)

Fixed-position clone of a picker item that animates to a build slot. Not exported.

### `ConstraintsDrawer`

`src/components/ConstraintsDrawer/ConstraintsDrawer.tsx`

Slide-in panel from the right. Receives `state`, `actions`, and `derived` directly from `useConstraints`.

Controls:
- **Build size**: 1–4 pills. Pills below `pinnedCount` are disabled.
- **Banned perks**: chips showing blacklisted perk names; each has a per-chip × remove button.
- **Category filters**: `+` / `−` buttons per category. A dim hint below the heading reads `"+ = only selected · − = skip selected"`. When any `+` is active, an amber `"Only: …"` summary appears live. `+` is a **whitelist** — selecting one category restricts the pool to that category only.
- **Character filters**: same `+` / `−` pattern with the same hint and live summary as category filters.
- **Reset**: appears when `activeConstraintCount > 0`.

Toggle button shows a badge with `activeConstraintCount`. Clicking the overlay closes the drawer.

### `ExportToolbar`

`src/components/BuildMaker/ExportToolbar.tsx`

Three export buttons: Share URL (copies `window.location.href`), Copy Text (plain-text build list), Download Image (triggers `exportBuildImage`). Buttons show a 2-second confirmation state after clipboard writes. Also exposes an optional tier-list export button.

### `SaveBuildModal`

`src/components/SaveBuildModal/SaveBuildModal.tsx`

Modal for naming and saving the active build. Warns if fewer than 4 perks are selected. Save button disabled until name is non-empty. Escape to close.

### `SavedBuilds`

`src/components/SavedBuilds/SavedBuilds.tsx`

"Your Builds" section rendered below the build picker. Filtered to the current role.

- Anon users: sign-in prompt.
- Authenticated with no saved builds: empty state message.
- Otherwise: `SavedBuildCard` list.

`SavedBuildCard` shows build name, 4-icon strip, Load and Delete buttons. Load prompts "Replace build in progress?" if the current build has perks.

### `DeleteBuildModal`

`src/components/DeleteBuildModal/DeleteBuildModal.tsx`

Confirmation dialog before deleting a saved build. Shows build name. Cancel + Confirm actions. Escape to close.

---

## Stats Tab

### `StatsView`

`src/components/StatsView/StatsView.tsx`

Stats root. Computes per-role grade distribution and top perks from the current ratings. Renders a section for each role.

- Empty state if `ratings` is empty.
- Authenticated users with community data see `GradePillStrip` and community top picks.
- Anon users see a ghosted inline pill strip (`aria-hidden="true"`) with a "Sign in to unlock →" button.

### `GradeChart`

`src/components/StatsView/GradeChart.tsx`

SVG horizontal bar chart. Bars normalised to the tallest grade count. Each bar filled with `GRADE_COLORS[grade]`.

Accessibility: `role="img"` + `<title>` on the SVG; `aria-label` on each bar.

### `GradePillStrip`

`src/components/StatsView/GradePillStrip.tsx`

Horizontal row of grade pills showing community distribution. Each pill: grade letter + mini bar (width proportional to % share) + percentage. Border uses grade colour at 33% opacity.

### `TopPerks`

`src/components/StatsView/TopPerks.tsx`

Scrollable row of octagonal perk icons for A-rated perks, with name labels. Used for both personal top perks and community top picks.

---

## Auth

### `AuthModal`

`src/components/AuthModal/AuthModal.tsx`

Sign in / create account modal. Two modes: `signin` | `signup`. Sign-up shows a "check your email" success state.

- Google OAuth button (`signInWithGoogle`).
- Email + password form.
- Focus trap, Escape key, `autoComplete` attributes, `role="alert"` on errors, `role="status"` on success.

---

## Related pages

- [[styles]]
- [[hooks]]
- [[features/perks]]
- [[features/build-maker]]
- [[features/stats]]
- [[features/auth]]
- [[features/saved-builds]]

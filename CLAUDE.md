# The Bloodweb — Dead by Daylight

A React + TypeScript + Vite web app where users can rate Dead by Daylight perks and craft builds.

## Project Context

- **Data source:** `dbd.tricky.lol` REST API (free, no auth required)
- **Docs:** https://dbd.tricky.lol/apidocs/

## Teaching Approach

This is a learning project. The goal is to learn how to best utilise Claude — prompting, skills, and agents — to maximise output quality and velocity on any project.

- **Claude writes the code.** Write full implementations unless told otherwise.
- After producing output, briefly note how the prompt could have been written to get a better or faster result.
- Point out when a skill, agent, or different prompting pattern would have been a better fit for the task.
- Keep things approachable.

## Code Style

- TypeScript strict mode
- Functional components only
- Prefer explicit types over `any`

## Project Structure

```
src/
  services/     # API communication layer
  types/        # TypeScript type definitions
  hooks/        # Custom React hooks
  components/   # UI components
  styles/       # Global styles and variables
  utils/        # Utility functions
scripts/        # One-time dev utilities (not part of the app bundle)
supabase/
  functions/    # Edge Functions (Deno)
  config.toml   # Edge Function settings (verify_jwt per function)
docs/
  adr/          # Architecture Decision Records
  superpowers/
    plans/      # Implementation plans
```

## Current State (as of 2026-05-23)

Core data pipeline, theming, perk rating, build maker, auth, Supabase backend, filter by rating, mobile responsiveness, stats view, export/share, saved builds backend, and community grade aggregation are all done.

### Data & API

- `src/services/dbdApi.ts` — `getAllPerks()` (returns `Record<string, Perk>`), `getCharacters()`. Proxies through Vite via `/api`.
- `src/services/supabase.ts` — Supabase client initialised from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- `src/types/dbd.ts` — `Perk`, `Character`, `Grade` (A–F), `PerkCategory` (14-value union), `Profile`, `Build`, `CommunityGrade`.

### Supabase Schema

- **`public.ratings`** — `id`, `user_id` (FK→auth.users), `perk_name`, `grade`, `updated_at`. RLS: owner manages own rows.
- **`public.profiles`** — `id` (PK/FK→auth.users), `display_name`, `created_at`. Auto-created on sign-up via `on_auth_user_created` trigger (SECURITY DEFINER; populates `display_name` from `raw_user_meta_data`). RLS: owner SELECT/INSERT/UPDATE.
- **`public.builds`** — `id`, `user_id`, `name`, `role` (CHECK: survivor/killer), `perks` (JSONB array ≤4), `is_public` (boolean, default false), `created_at`, `updated_at`. Indexes on `user_id` and partial `(created_at DESC) WHERE is_public`. CHECK constraints on name length (1–100) and perks structure. RLS: owner manages own; anyone reads public.
- **`public.perk_community_grades`** (view) — aggregates `perk_name`, `grade`, `COUNT(*)` across all users' ratings. `security_invoker=off` bypasses per-user RLS. `authenticated` role: SELECT only. `anon`: no access.

### Edge Functions

- `supabase/functions/validate-build/` — validates `{ role, perks }` structure server-side. `verify_jwt=true` (config.toml). Pure logic in `validate.ts` (10 Deno unit tests); HTTP handler in `index.ts` with CORS + OPTIONS preflight.

### Hooks

- `src/hooks/useAsyncData.ts` — generic `useAsyncData<T>(fetcher, initial)` hook with loading/error state and cancellation on unmount. Used by `usePerks` and `useCharacters`.
- `src/hooks/usePerks.ts` — returns `{ perks, loading, error }` (array of all perks).
- `src/hooks/useCharacters.ts` — returns `{ characterMap, loading, error }` (numeric ID → name).
- `src/hooks/useAuth.ts` — subscribes to Supabase auth state; exposes `user`, `loading`, `signIn`, `signUp`, `signOut`.
- `src/hooks/useRatings.ts` — A–F grade ratings. Authenticated users read/write to Supabase (`ratings` table, RLS by `user_id`). Unauthenticated users fall back to `localStorage`. First login auto-migrates local ratings to Supabase. Writes are optimistic.
- `src/hooks/useBuilds.ts` — saved builds CRUD. Accepts `userId`. `saveBuild(name, role, perks, isPublic?)` validates via `validate-build` edge function then inserts; optimistic prepend. `deleteBuild(id)` guards on both `id` and `user_id`. Clears state on sign-out.
- `src/hooks/useCommunityGrades.ts` — fetches `perk_community_grades` view for authenticated users. Returns `{ grades: CommunityGrade[], loading, error }`. Returns empty array for anon (view is auth-gated). Clears loading/error on sign-out.
- `src/utils/perkUtils.ts` — `getPerkImageUrl(imagePath)` → `/perks/{filename}.png`.
- `src/utils/categoryColors.ts` — `CATEGORY_COLORS` (Record mapping each `PerkCategory` slug to a hex color) and `getCategoryColor(categories)` helper. Colors applied to the octagonal perk icon border.
- `src/utils/gradeColors.ts` — `GRADE_COLORS` (Record<Grade, hex>) and `GRADE_ORDER` (Record<Grade, number>) constants. Used by export canvas and stats chart.
- `src/utils/buildShare.ts` — `encodeBuild(role, slots)` → URL query string; `decodeBuild(search, allPerks)` → `{ role, slots }`. Encodes the active build into `?role=&p0=&p1=&p2=&p3=` params for URL sharing.
- `src/utils/exportCanvas.ts` — `exportBuildImage(slots, role)` renders a 640×220 PNG of the active build and triggers download; `exportTierListImage(perks, ratings, role)` renders a full tier-list PNG grouped by grade. Both use `document.fonts.ready` to ensure Cinzel/Oswald load before drawing.

### Components

- `src/components/PerkCard/PerkCard.tsx` — horizontal flex layout (octagonal icon, description, A–F grade buttons). Octagon border color reflects the perk's first category via `--category-color` CSS custom property (falls back to ember amber). Clicking the card opens `PerkModal`; grade buttons stop propagation. Uses `dangerouslySetInnerHTML` for descriptions. `onError` fallback to `perk-placeholder.svg`.
- `src/components/PerkModal/PerkModal.tsx` — full-detail dialog opened by clicking a perk card. Larger octagonal icon, untruncated description, grade buttons. Focus trap, Escape/click-outside to close, `role="dialog"`, `aria-modal`, `aria-labelledby`. Category color applied to the octagon border.
- `src/components/PerkSection/PerkSection.tsx` — perk grid with sort controls (name / character / grade, asc/desc), category filter, and rating filter. Derives available categories from the current role's perks so survivor and killer sections show different filter buttons. Category and rating filters are independent and compose — both run before sorting.
- `src/components/CategoryFilter/CategoryFilter.tsx` — row of category toggle buttons rendered below the sort bar. Each button is styled in its category color; active = solid fill. Doubles as a visual legend. `available` prop is derived per-role so only relevant categories appear. Shows a Clear button when any filter is active.
- `src/components/SortBar/SortBar.tsx` — sort field (name / character / grade) + direction toggle. Full ARIA toolbar pattern (`role="toolbar"`, `role="group"`, `aria-pressed`).
- `src/components/PerkList/PerkList.tsx` — top-level tab bar (Perks / Build / Stats) with `<main>` landmark and full ARIA tab pattern. Perks tab has Survivor / Killer sub-tabs.
- `src/components/BuildMaker/BuildMaker.tsx` — 4-slot build composer. Role toggle (clears build on switch), octagonal slot display, keyword search (name + character + HTML-stripped description), dense perk picker grid. Clicking a perk triggers a FLIP animation (ghost flies to the target slot via Web Animations API); clicking again removes it. Build summary below slots shows each perk's full description. Respects `prefers-reduced-motion`. Integrates `ExportToolbar` for share URL, copy text, and image download. Reads `?role=&p0–p3=` on mount to restore a shared build. A `urlReady` ref gates the URL-sync effect so it never fires before hydration completes (prevents `?role=survivor&p0=...` being written on every fresh page load).
- `src/components/BuildMaker/ExportToolbar.tsx` — three export buttons (Share URL, Copy Text, Download Image). Buttons show a 2-second "Copied!" / confirmation state after clipboard writes.
- `src/components/AuthModal/AuthModal.tsx` — sign in / create account modal. Focus trap, Escape key handling, `aria-labelledby`, `role="alert"` on errors, `role="status"` on success, `autoComplete` attributes.
- `src/components/RatingFilter/RatingFilter.tsx` — row of A–F + Unrated toggle buttons rendered below the category filter. Each grade has a distinct tier-list color (green → blue → amber → orange → light red → blood red). `active` is a `Set<Grade | "unrated">`; multi-select, composable with the category filter. Shows a Clear button when any filter is active.
- `src/components/StatsView/StatsView.tsx` — Stats tab root. Shows an empty state if no perks are rated; otherwise renders a `GradeChart` + `TopPerks` section for each role. Computes distribution and A-grade perk lists with `useMemo`.
- `src/components/StatsView/GradeChart.tsx` — SVG horizontal bar chart. Bars are normalised to the tallest grade count; each bar is filled with `GRADE_COLORS[grade]`. Accessible via `role="img"` + `<title>` + `aria-label` on each bar.
- `src/components/StatsView/TopPerks.tsx` — scrollable row of octagonal perk icons for all A-rated perks, with name labels below.

### Styles & Theme

- `src/styles/variables.scss` — DBD-themed CSS custom properties: amber (`--color-ember`), parchment text (`--color-parchment-dim` lightened to `#a8957e` for readability), ember glow tokens, Cinzel + Oswald fonts.
- `src/styles/global.scss` — base reset, body font/colour, atmospheric background gradient. Root font-size set to `106.25%` (17px) for improved readability; all sizing uses `rem`.
- `src/App.tsx` — page header ("The Bloodweb" / "Dead by Daylight") with sign in/out controls.
- **Responsive:** single `max-width: 640px` breakpoint across all component SCSS modules. Header auth stacks below title; perk grid drops to single column; side padding tightens; tab buttons fill width; card icon/grade buttons scale down. All components tested to 360px viewport width.

### Image Scripts (run once from project root, in order)

1. `node scripts/downloadPerkImages.js` — ~178 images from `newbstar/dbd-assets`
2. `node scripts/downloadMissingPerkImages.js` — ~18 images from DBD Fandom wiki
3. `node scripts/downloadFromDanteRepo.js` — ~43 images from `DanteASC4/dbd-assets` (GitHub API, 60 req/hr limit)
4. `node scripts/downloadFromRoleRepos.js` — ~34 images from role-specific repos (no rate limit)

Coverage: ~273 of 309 icons (~88%). Remaining ~36 are late-2024 chapters not yet in community repos — fall back to placeholder automatically.

## Known Issues

- **~36 perk icons missing** — most recent chapters (late 2024+) not yet available in any community asset repo. Placeholder shown automatically; will resolve as repos catch up.

## Next Steps

- **Saved builds UI** *(next priority)* — surface `useBuilds` and `useCommunityGrades` in the frontend (Build tab: save/load, Stats tab: community distribution).
- **Random build generator** — a function that allows users to create a build from 4 randomly chosen perks.

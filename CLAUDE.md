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
  context/      # React context providers (AppData, AuthModal, Toast)
  pages/        # Routed pages (Landing, Perks, Build, Community)
  components/   # UI components
  styles/       # Tokens, mixins, motion keyframes, global styles
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

## Current State (as of 2026-06-11)

Core data pipeline, perk rating, build maker, auth, Supabase backend, filters, export/share, saved builds, community grade aggregation, and the constraints randomiser are all done. The 2026-06 **Bloodweb redesign** replaced the amber "Grimoire" theme and tab UI wholesale: arterial-red/bone token system (`--bw-*` in variables.scss, documented in DESIGN.md), react-router routes (`/` landing hub, `/perks`, `/build`, `/community` — see ADR-0008), a landing page with four entry cards, a randomiser hero leading /build, perks-page search + zero-result empty state, per-perk community consensus grades in PerkModal, a community tier board replacing the Stats tab, global `:focus-visible` + reduced-motion kill-switch, 44px coarse-pointer touch targets, and ambient motion (BloodwebBackdrop fog/web, breathing CTAs, randomise flicker reveal).

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

- `supabase/functions/validate-build/` — validates `{ role, perks }` structure server-side. `verify_jwt=true` (config.toml). Authoritative rules live in `supabase/functions/_shared/buildRules.ts` (`validateBuild` — runtime-neutral, no imports); `validate.ts` re-exports them (10 Deno unit tests). HTTP handler in `index.ts` with CORS + OPTIONS preflight.
- `supabase/functions/_shared/buildRules.ts` — canonical Build validation rules shared across the client/edge seam (`.ts`-extension import works in both Deno and the Vite client via `allowImportingTsExtensions`). Imported by `useBuilds` for optimistic Save gating and by the edge function as the authoritative check. Must keep permitting partial builds per ADR-0005.

### Hooks

- `src/hooks/useAsyncData.ts` — generic `useAsyncData<T>(fetcher, initial)` hook with loading/error state and cancellation on unmount. Used by `usePerks` and `useCharacters`.
- `src/hooks/usePerks.ts` — returns `{ perks, loading, error }` (array of all perks).
- `src/hooks/useCharacters.ts` — returns `{ characterMap, loading, error }` (numeric ID → name).
- `src/hooks/useAuth.ts` — subscribes to Supabase auth state; exposes `user`, `loading`, `signIn`, `signUp`, `signOut`.
- `src/hooks/useRatings.ts` — A–F grade ratings. Authenticated users read/write to Supabase (`ratings` table, RLS by `user_id`). Unauthenticated users fall back to `localStorage`. First login auto-migrates local ratings to Supabase. Writes are optimistic.
- `src/hooks/useBuilds.ts` — saved builds CRUD. Accepts `userId`. `saveBuild(name, role, perks, isPublic?)` pre-checks locally via the shared `validateBuild` rule (skips the round-trip on invalid input), then validates via the `validate-build` edge function and inserts; optimistic prepend. `deleteBuild(id)` guards on both `id` and `user_id`. Clears state on sign-out.
- `src/hooks/useCommunityGrades.ts` — fetches `perk_community_grades` view for authenticated users. Returns `{ grades: CommunityGrade[], loading, error }`. Returns empty array for anon (view is auth-gated). Clears loading/error on sign-out.
- `src/hooks/useConstraints.ts` — randomiser constraints engine. Signature: `useConstraints(perks, slots, setSlots, characterMap, role)` → `[ConstraintsState, ConstraintsActions, ConstraintsDerived]`. Manages pinned slots, blacklist, build size (1–4), category filters, and character filters. Computes eligible pool, conflict errors, and `canRandomise`. `randomise()` shuffles the eligible pool, preserves pins, fills up to `buildSize`. Persists all constraints to `localStorage` under `constraints_survivor` / `constraints_killer` (role-scoped); stale blacklist names are silently dropped on load. See ADR-0006 and ADR-0007.
- `src/hooks/useRoleParam.ts` — `[role, setRole]` backed by the `?role=` search param (survivor default, `replace: true`). Used on /perks and /community; /build keeps role as page state because BuildMaker is the single URL writer there (ADR-0008).
- `src/hooks/usePageTitle.ts` — sets `document.title` per routed page (WCAG 2.4.2).
- `src/context/AppDataContext.tsx` — `AppDataProvider` + `useAppData()`. Owns usePerks/useCharacters/useAuth/useRatings/useBuilds/useCommunityGrades once at the root and memoises `survivorPerks`/`killerPerks`/`consensusMap`. Pages read from it; navigation never refetches.
- `src/utils/perkUtils.ts` — `getPerkImageUrl(imagePath)` → `/perks/{filename}.png`; `resolveDescription(description, tunables)` substitutes `{Tunable.*}` / `{Keyword.*}` / `{Input.*}` placeholders and sanitises via DOMPurify (allows only `span`/`kbd` + `class`). Unit-tested (`perkUtils.test.ts`).
- `src/utils/categoryColors.ts` — `CATEGORY_COLORS` (Record mapping each `PerkCategory` slug to a hex color) and `getCategoryColor(categories)` helper. Applied to octagon borders and filter pills; every value is contrast-tuned for the Bloodweb ground (≥3:1 as border, ≥4.5:1 under near-black active-pill text).
- `src/utils/gradeColors.ts` — `GRADE_COLORS` (Record<Grade, hex>, contrast-tuned; C is gold `#d9b13b`, F is `#d75550`) and `GRADE_ORDER` (Record<Grade, number>) constants. Used by export canvas, charts, tier board, and consensus badges.
- `src/utils/perkSearch.ts` — `perkMatchesQuery` / `filterPerks`: shared keyword matcher (name + character + HTML-stripped resolved description) used by both the BuildMaker picker and the Perks page search.
- `src/utils/communityConsensus.ts` — `buildConsensusMap(communityGrades)` → `Map<perkName, { grade, votes }>` via vote-weighted mean of grade ranks; exact ties round toward the better grade. Memoised in AppDataContext; unit-tested.
- `src/utils/buildShare.ts` — `encodeBuild(role, slots)` → URL query string; `decodeBuild(search, allPerks)` → `{ role, slots }`. Encodes the active build into `?role=&p0=&p1=&p2=&p3=` params for URL sharing. Slot reconstruction delegates to `buildToSlots`.
- `src/utils/buildToSlots.ts` — `buildToSlots(names, perks)` → `(Perk | null)[]` (always `BUILD_SLOT_COUNT` slots; missing/unknown names become `null`). Single home for the name→Perk slot mapping shared by URL decode, loading a saved build, and the saved-build icon strip. Unit-tested.
- `src/utils/statsUtils.ts` — `buildRoleStat(role, label, perks, ratings)` and `buildCommunityDist(communityGrades, perks, role)` pure stat builders (grade distribution, percentages, top-A perks, community vote aggregation), plus the `GRADES` order constant. Consumed by `CommunityPage`; unit-tested.
- `src/utils/exportCanvas.ts` — `exportBuildImage(slots, role)` renders a 640×220 PNG of the active build and triggers download; `exportTierListImage(perks, ratings, role)` renders a full tier-list PNG grouped by grade. Both use `document.fonts.ready` to ensure Cinzel/Oswald load before drawing. Canvas can't read CSS custom properties, so its colour constants mirror the Bloodweb tokens — keep in sync with variables.scss.

### Routing & Pages (ADR-0008)

- `src/App.tsx` — router root: `BrowserRouter` → `AppDataProvider` → `AuthModalContext` → routes. `/` = LandingPage (outside the shell); `AppShell` layout route wraps `/perks`, `/build`, `/community`; `*` redirects to `/`. `vercel.json` has the SPA fallback rewrite for production deep links.
- `src/pages/LandingPage/` — hero hub: display wordmark over `BloodwebBackdrop`, four corner-cut entry cards (Randomise a Build → /build with breathing glow; Browse Perks → /perks with live perk count; Community Tiers → /community; My Builds → /build#saved with saved count or sign-in nudge). Also owns the **legacy share-link redirect**: `/?role=…&p0=…` → `/build` with params intact.
- `src/pages/PerksPage/` — loading/error states + `RoleToggle` + `PerkSection`. Role via `useRoleParam`.
- `src/pages/BuildPage/` — wires `BuildMaker` from `useAppData()`; role is **page state** seeded from the URL (single-URL-writer rule); scrolls to `#saved` on hash; owns `handleExportTierList`.
- `src/pages/CommunityPage/` — community-first restructure of the old Stats tab: heading + `RoleToggle` → `CommunityTierBoard` → `GradePillStrip` + community `TopPerks` → secondary "Your ratings" section (`GradeChart` + `TopPerks`, works anon via localStorage). Anon sees a blurred ghost board with one sign-in nudge. Clicking a tier-board perk opens `PerkModal`.

### Components

- `src/components/AppShell/AppShell.tsx` — layout route for all section pages: skip link, sticky slim header (wordmark → `/`, NavLinks Perks/Build/Community that carry the current `?role=`, auth control), and `<main id="main" tabIndex={-1}>` that receives focus on route change.
- `src/components/RoleToggle/RoleToggle.tsx` — Survivor/Killer tablist extracted from the old PerkList; props `{ role, onChange }`.
- `src/components/BloodwebBackdrop/BloodwebBackdrop.tsx` — decorative ambient layer (`aria-hidden`): octagonal SVG web with staggered pulsing nodes + two slow-drifting blurred fog layers. Transform/opacity only; `variant="dim"` used on the /build hero.
- `src/components/PerkCard/PerkCard.tsx` — horizontal flex layout (octagonal icon, clamped description, "Full details" link-button opening the modal, A–F grade buttons revealed on hover/focus-within). Octagon border color reflects the perk's first category via `--category-color` (falls back to accent red). Clicking the card opens `PerkModal`; grade buttons stop propagation. `onError` fallback to `perk-placeholder.svg`.
- `src/components/PerkModal/PerkModal.tsx` — full-detail dialog opened by clicking a perk card or tier-board icon. Larger octagonal icon, untruncated description, **community consensus row** (grade badge + vote count for authed users; sign-in nudge for anon; via `useAppData().consensusMap`), grade buttons. Focus trap, Escape/click-outside to close, `role="dialog"`, `aria-modal`, `aria-labelledby`.
- `src/components/PerkSection/PerkSection.tsx` — perk browser: **keyword search input + "X / Y rated" counter**, sort controls (name / character / grade, asc/desc), collapsible category + rating filters, staggered-entrance grid, and a **zero-result empty state** with a clear-everything action. Search/category/rating filters compose before sorting.
- `src/components/CommunityTierBoard/CommunityTierBoard.tsx` — six grade bands (GRADE_COLORS letter + left edge bar) of consensus-graded perk octagons sorted by votes desc; each icon is a button opening PerkModal with an aria-label carrying grade + vote count.
- `src/components/CategoryFilter/CategoryFilter.tsx` — row of category toggle buttons rendered below the sort bar. Each button is styled in its category color; active = solid fill. Doubles as a visual legend. `available` prop is derived per-role so only relevant categories appear. Shows a Clear button when any filter is active.
- `src/components/SortBar/SortBar.tsx` — sort field (name / character / grade) + direction toggle. Full ARIA toolbar pattern (`role="toolbar"`, `role="group"`, `aria-pressed`).
- `src/components/BuildMaker/BuildMaker.tsx` — 4-slot build composer, led by `RandomiserHero` at the top. Octagonal slots with Pin buttons; removing a perk from a pinned slot auto-unpins it. Picker grid with shared keyword search (`perkSearch.ts`). Clicking a perk triggers a FLIP animation (WAAPI, reduced-motion-guarded); clicking again removes it. Randomise staggers a `flicker-in` reveal across slots and announces the result via `aria-live`. Merged actions row (Save/Clear + ExportToolbar). URL sync via `setSearchParams({replace:true})` — the **single URL writer on /build** (`urlReady` ref gates it until hydration; `setSearchParams` read through a ref because its identity is unstable in router v7). Build summary shows full descriptions (mobile stacks picker above summary). `SavedBuilds` renders in a `#saved` anchor div.
- `src/components/BuildMaker/RandomiserHero.tsx` — top-of-page band: dim `BloodwebBackdrop`, breathing Randomise CTA, `role="status"` pool/conflict line, and the `ConstraintsDrawer` trigger.
- `src/components/ConstraintsDrawer/ConstraintsDrawer.tsx` — slide-in drawer (triggered from the randomiser hero) for configuring randomiser constraints. `role="dialog"`, Escape closes, focus moves to the close button on open and back to the toggle on close. Build size picker (1–4 pills, disabled below pinned count), banned perks chip list, Reset button + count badge. Category/character sections use a **sentence-radio + checkbox** pattern: three full-sentence radios per section ("Pick from all X" / "Only use selected X" / "Avoid selected X") gate a checkbox-chip grid (disabled until a mode is chosen; only = bone ticks, avoid = red ticks with strikethrough), with a status line spelling out the live selection and a `role="status"` eligible-pool count at the top of the panel. Mode is derived from filter state when any filter is active (storage-loaded state displays honestly); mode switches convert or clear the section's filters via the existing toggle actions; Reset remounts the sections to snap radios back to "Pick from all".
- `src/components/BuildMaker/ExportToolbar.tsx` — three export buttons (Share URL, Copy Text, Download Image). Buttons show a 2-second "Copied!" / confirmation state after clipboard writes.
- `src/components/SaveBuildModal/SaveBuildModal.tsx` — modal for naming and saving the active build. Warns if fewer than 4 perks are selected. Escape to close, disabled Save button until name is non-empty. `role="dialog"`, `aria-modal`, `aria-labelledby`.
- `src/components/DeleteBuildModal/DeleteBuildModal.tsx` — confirmation dialog for deleting a saved build. Shows build name, Cancel + Confirm actions, Escape to close.
- `src/components/SavedBuilds/SavedBuilds.tsx` — "Your Builds" section rendered below the build picker. Shows a sign-in prompt for anon users; empty state for authenticated users with no saved builds; otherwise a card list filtered to the current role. Each `SavedBuildCard` shows the build name, a 4-icon strip, Load and Delete buttons. Load prompts for confirmation ("Replace build in progress?") if the current build has perks. Delete opens `DeleteBuildModal`.
- `src/components/AuthModal/AuthModal.tsx` — sign in / create account modal. Focus trap, Escape key handling, `aria-labelledby`, `role="alert"` on errors, `role="status"` on success, `autoComplete` attributes.
- `src/components/RatingFilter/RatingFilter.tsx` — row of A–F + Unrated toggle buttons rendered below the category filter. Each grade has a distinct tier-list color (green → blue → gold → orange → light red → red). `active` is a `Set<Grade | "unrated">`; multi-select, composable with the category filter. Shows a Clear button when any filter is active.
- `src/components/StatsView/` — `StatsView.tsx` was dissolved into `CommunityPage`; the folder keeps the surviving chart components (all styled by `StatsView.module.scss`):
- `src/components/StatsView/GradeChart.tsx` — SVG horizontal bar chart. Bars are normalised to the tallest grade count; each bar is filled with `GRADE_COLORS[grade]`. Accessible via `role="img"` + `<title>` + `aria-label` on each bar.
- `src/components/StatsView/GradePillStrip.tsx` — horizontal row of grade pills showing community distribution. Each pill: grade letter + mini bar (width proportional to % share) + percentage. Bar and letter colored by `GRADE_COLORS[grade]`. Pill border uses the grade color at 33% opacity.
- `src/components/StatsView/TopPerks.tsx` — scrollable row of octagonal perk icons for all A-rated perks, with name labels below.

### Styles & Theme (see DESIGN.md for the full system)

- `src/styles/variables.scss` — the **Bloodweb token system**: `--bw-*` palette (clotted black / dried blood / arterial red `#c92f2f` / bright vein `#e25555` for small red text / bone / ash), semantic aliases, spacing scale (`--space-1..8`), type scale (`--text-xs..display`), z-index scale (`--z-*`), motion tokens (`--motion-*`, `--ease-out`), sharp radii (`--radius-0/1`), red glow tokens, focus-ring token. **No legacy `--color-*` aliases remain** — use `--bw-*` only.
- `src/styles/_mixins.scss` — `cut-corners($size)`, `cut-panel($cut)` (bordered corner-cut panel via stacked clipped pseudo-layers, because clip-path clips borders/shadows), `touch-target` (24px min, 44px under `pointer: coarse`), `panel`.
- `src/styles/motion.scss` — ambient/entrance keyframes (`fog-drift`, `breath-glow`, `node-pulse`, `flicker-in`, `rise-in`); imported once by global.scss.
- `src/styles/global.scss` — base reset, body font/colour, red-black atmospheric gradients, **global `:focus-visible` ring**, **global `prefers-reduced-motion` kill-switch** (CSS only — WAAPI calls carry their own `matchMedia` guards). Root font-size `106.25%` (17px).
- **Responsive:** single `max-width: 640px` breakpoint across component SCSS modules (BuildMaker also breaks at 900px). All components tested to 360px viewport width.

### Image Scripts (run once from project root, in order)

1. `node scripts/downloadPerkImages.js` — ~178 images from `newbstar/dbd-assets`
2. `node scripts/downloadMissingPerkImages.js` — ~18 images from DBD Fandom wiki
3. `node scripts/downloadFromDanteRepo.js` — ~43 images from `DanteASC4/dbd-assets` (GitHub API, 60 req/hr limit)
4. `node scripts/downloadFromRoleRepos.js` — ~34 images from role-specific repos (no rate limit)

Coverage: ~273 of 309 icons (~88%). Remaining ~36 are late-2024 chapters not yet in community repos — fall back to placeholder automatically.

## Known Issues

- **~36 perk icons missing** — most recent chapters (late 2024+) not yet available in any community asset repo. Placeholder shown automatically; will resolve as repos catch up.

## ADRs

- `docs/adr/0006-pin-conflict-blocks-randomise.md` — pin + constraint conflicts block Randomise; no silent override.
- `docs/adr/0007-constraints-persisted-to-localstorage.md` — constraints scoped by role (`constraints_survivor` / `constraints_killer`).
- `docs/adr/0008-landing-hub-and-routing.md` — landing hub IA, react-router routes, AppDataProvider, single-URL-writer rule on /build, legacy share-link redirect, vercel SPA fallback.

## Next Steps

- No outstanding items.

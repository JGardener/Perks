# ADR-0008: Landing hub, client routing, and the single-URL-writer rule

Date: 2026-06-11
Status: Accepted

## Context

The app was a single route with three state-tabs (Perks / Build / Stats). First-time visitors had no orientation, the randomiser was buried inside the Build tab, deep links and the back button didn't work, and share URLs squatted on the root path's query string. A ground-up UI redesign ("Bloodweb", see DESIGN.md) needed an information architecture where the four core intents — randomise a build, browse perks, see community opinion, inspect a perk — are each one obvious click from arrival.

## Decision

1. **react-router-dom (declarative mode)** with four routes: `/` (landing hub, outside the shell), and `/perks`, `/build`, `/community` inside an `AppShell` layout route (slim sticky nav, skip link, focus-to-main on navigation). Unknown paths redirect to `/`.
2. **Landing hub at `/`**: hero wordmark + four entry cards (Randomise a Build → `/build`, Browse Perks → `/perks`, Community Tiers → `/community`, My Builds → `/build#saved`). The hub renders its own minimal auth control; the persistent nav appears only on section routes.
3. **`AppDataProvider`** (src/context/AppDataContext.tsx) owns all data hooks once at the root — perks, characters, auth, ratings, builds, community grades, and the memoised community consensus map. Pages read via `useAppData()`; navigation never refetches.
4. **Single URL writer on /build.** BuildMaker's sync effect (`setSearchParams(..., { replace: true })`) is the only code allowed to write `?role=&p0..p3` on `/build`. The page's RoleToggle mutates page state only; role reaches the URL through `encodeBuild`. `setSearchParams` has an unstable identity in router v7, so the effect reads it through a ref and keeps `[role, slots]` deps.
5. **Legacy share links** (`/?role=…&p0=…`) are redirected by the landing page to `/build` with params intact. New share links target `/build` directly.
6. **vercel.json SPA fallback**: every non-`/api/` path rewrites to `/index.html` so deep links work in production (vite preview already does this locally).
7. **Role param convention**: `?role=killer` (survivor is the default and omitted). `useRoleParam()` reads/writes it on `/perks` and `/community`; AppShell nav links carry the current role across sections.

## Consequences

- Back/forward and refresh work on every surface; sections are individually shareable.
- The Stats tab is gone: `/community` leads with the community tier board and demotes personal stats to a secondary section (supersedes the both-roles-stacked StatsView layout).
- Tests mount routed components inside `MemoryRouter`; BuildMaker has a regression test asserting hydrate-then-write URL sync through the router.
- Any future feature adding query params to /build must funnel them through BuildMaker's writer or accept being overwritten.

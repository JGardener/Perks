# The Bloodweb — Dead by Daylight

A React + TypeScript + Vite web app for rating Dead by Daylight perks A–F and crafting builds.

## Features

- **Perk rating** — grade every survivor and killer perk from A to F
- **Build maker** — pick four perks, animate them into slots, share via URL or export as PNG
- **Stats view** — grade distribution charts and top-A-rated perks per role
- **Community grades** — see how other signed-in users have rated each perk (auth-gated)
- **Randomise Build** — generate a random build from a configurable pool: pin specific slots, blacklist perks, filter by category or character, and set build size 1–4. Constraints persist across sessions.
- **Saved builds** — save and reload named builds (requires sign-in)
- **Export** — download the active build or your full tier list as a PNG image
- Ratings persist to Supabase for signed-in users; falls back to `localStorage` for anonymous use. First sign-in auto-migrates local ratings.

## Getting started

```bash
npm install
```

Create a `.env.local` at the project root with your Supabase credentials:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Then start the dev server:

```bash
npm start
```

The app is at `http://localhost:5173`. The DBD API proxy runs through Vite at `/api` — no additional setup required.

## Perk images

Images live in `public/perks/` and are not committed to the repo. Run the download scripts below to populate them before starting the app. Each script is safe to re-run — it skips files already present.

### Download scripts (run in order from the project root)

**1. Base images (~178 perks, pre-2021)**
```bash
node scripts/downloadPerkImages.js
```
Source: `newbstar/dbd-assets` on GitHub.

**2. Wiki images (~18 additional perks)**
```bash
node scripts/downloadMissingPerkImages.js
```
Source: DBD Fandom wiki via the MediaWiki API.

**3. Chapter repo images (~43 additional perks)**
```bash
node scripts/downloadFromDanteRepo.js
```
Source: `DanteASC4/dbd-assets` on GitHub. Uses the GitHub Contents API (60 unauthenticated requests/hour — if you hit a 403, wait an hour and retry).

**4. Role-specific repo images (~34 additional perks)**
```bash
node scripts/downloadFromRoleRepos.js
```
Sources: `Naethii/survivorperks` and `DanteASC4/dbd-assets-simple`. Uses `raw.githubusercontent.com` directly — no rate limits.

### Coverage

Running all four scripts in order yields approximately **273 of 309** perk icons (~88%). The remaining ~36 are the most recent chapters (late 2024+) not yet in any community asset repo — these fall back to the placeholder icon automatically. Re-running the scripts later will pick up newly available images as community repos catch up.

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript strict mode |
| Build | Vite 8, SCSS Modules |
| Backend | Supabase (auth, Postgres, Edge Functions, RLS) |
| Error monitoring | Sentry (`@sentry/react`) |
| Testing | Vitest + @testing-library/react + jsdom |
| Fonts / theme | Cinzel + Oswald, DBD ember-amber palette |

## Data source

Perk and character data: [`dbd.tricky.lol`](https://dbd.tricky.lol/apidocs/) — free, no auth required.

## Known issues

- **~36 perk icons missing** — most recent chapters (late 2024+) not yet available in any community asset repo. Placeholder shown automatically; will resolve as repos catch up.
- **Constraints Panel not yet built** — the Randomise button and pin slots are wired up, but the full constraints UI (blacklist, category/character filters, build size picker) is behind issues #17–#20.

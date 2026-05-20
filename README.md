# The Bloodweb — Dead by Daylight

A React + TypeScript + Vite web app for rating Dead by Daylight perks A–F and crafting builds.

## Getting started

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

The dev server starts at `http://localhost:5173`. The API key is injected server-side by the Vite proxy and never reaches the browser bundle.

## Perk images

Images live in `public/perks/` and are not committed to the repo. Run the download scripts below to populate them before starting the app. Each script is safe to re-run — it skips files that are already present.

### Download scripts (run in order)

All scripts are run from the project root.

**1. Base images (~178 perks, pre-2021)**
```bash
node scripts/downloadPerkImages.js
```
Source: `newbstar/dbd-assets` on GitHub. Covers the original launch perks and early DLC.

**2. Wiki images (~18 additional perks)**
```bash
node scripts/downloadMissingPerkImages.js
```
Source: DBD Fandom wiki (`deadbydaylight.fandom.com`) via the MediaWiki API. Fetches the full `IconPerks_*` catalogue and downloads any that are still missing locally.

**3. Chapter repo images (~43 additional perks)**
```bash
node scripts/downloadFromDanteRepo.js
```
Source: `DanteASC4/dbd-assets` on GitHub. Crawls all chapter subfolders via the GitHub Contents API. Uses the same `iconPerks_*` naming convention as the DBD API. Note: requires the GitHub API (60 unauthenticated requests/hour) — if you hit a 403, wait an hour and retry.

**4. Role-specific repo images (~34 additional perks)**
```bash
node scripts/downloadFromRoleRepos.js
```
Sources: `Naethii/survivorperks` (survivors, updated Oct 2025) and `DanteASC4/dbd-assets-simple` (killers, updated Apr 2025). Uses `raw.githubusercontent.com` directly — no API rate limits. Converts filenames to PascalCase to match these repos' naming convention, then saves under the original expected filename.

### Coverage

Running all four scripts in order yields approximately **273 of 309** perk icons (~88%). The remaining ~36 are the most recent chapters (late 2024+) not yet available in any community asset repository. These fall back to the placeholder icon automatically.

As community repos catch up with new chapters, re-running the scripts in order will pick up newly available images.

## Tech stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 8** with dev proxy for `dbd.tricky.lol` and `api.anthropic.com`
- **SCSS Modules** — DBD-themed design (ember amber, parchment, Cinzel + Oswald fonts)
- **Anthropic SDK** (`claude-opus-4-6`) — four AI agents, all streaming

## AI agents

Accessible in the app once `ANTHROPIC_API_KEY` is set:

| Agent | Where | What it does |
|---|---|---|
| **Perk Explainer** | Each perk card | Plain-English explanation of any perk, on demand |
| **Build Suggester** | Section toolbar | Recommends a 4-perk build based on your ratings |
| **What to Try Next** | Section toolbar | Recommends unrated perks based on your A/B favourites |
| **Playstyle Analysis** | Section toolbar | Reads your full tier list and describes your playstyle |

Build Suggester and Playstyle Analysis use adaptive thinking (`thinking: { type: 'adaptive' }`).

## Data source

Perk and character data: [`dbd.tricky.lol`](https://dbd.tricky.lol/apidocs/) — free, no auth required.

## Ratings persistence

Ratings are stored in `localStorage`. A backend with auth and cross-device sync is planned for a later stage.

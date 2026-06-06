# Feature: Build Maker

**Summary**: How the build composer works — slot management, the FLIP animation, keyword search, the randomiser, the constraints drawer, URL sharing, and export.

**Sources**: `src/components/BuildMaker/BuildMaker.tsx`, `src/components/ConstraintsDrawer/ConstraintsDrawer.tsx`, `src/components/BuildMaker/ExportToolbar.tsx`, `src/hooks/useConstraints.ts`, `src/utils/buildShare.ts`, `src/utils/exportCanvas.ts`, `docs/adr/0006-pin-conflict-blocks-randomise.md`, `docs/adr/0007-constraints-persisted-to-localstorage.md`

**Last updated**: 2026-06-05

---

## Slots

The build is 4 `(Perk | null)` slots. Slot state lives in `BuildMaker`. An empty slot shows a `+` placeholder. A filled slot shows the perk's octagonal icon.

Clicking a filled slot removes the perk. If the slot was pinned, the pin is also cleared.

---

## Adding Perks — FLIP Animation

Clicking a perk in the picker grid triggers a FLIP (First-Last-Invert-Play) animation:

1. The picker item's octagon (`[data-octa]`) and the target slot element have their bounding rects captured.
2. A `<FlyingPerk>` component is rendered at fixed position over the picker item.
3. Web Animations API animates the ghost from the picker item's rect to the target slot's rect (400 ms, `cubic-bezier(0.22, 1, 0.36, 1)`).
4. On `onfinish`, the real perk is written into slots and the ghost is removed. The slot plays a spring-scale bounce animation.

`prefers-reduced-motion` sets animation duration to 0 (instant placement, no visual motion).

While a flight is in progress, further picker clicks are ignored. The in-flight perk is treated as if it is already in the build.

---

## Keyword Search

The picker grid is filterable by a text search input. The search runs against:

- `perk.name`
- `characterMap[perk.character]` (character name)
- `resolveDescription(perk.description, perk.tunables)` with HTML tags stripped

All comparisons are case-insensitive. The filter is computed via `useMemo`.

---

## Randomiser

The "Randomise Build" hero button calls `useConstraints.randomise()`. The button label shows either the eligible perk count (`"42 perks eligible"`) or the constraint error string as a warning.

The button is disabled when `constraintDerived.canRandomise` is false (conflict exists or eligible pool is too small).

See [[hooks]] for the full randomise algorithm, and [[decisions]] for the conflict-blocking rationale.

---

## Constraints Drawer

Rendered beside the Randomise button. A toggle button slides in a right-anchored panel. Badge shows `activeConstraintCount`.

Controls inside the drawer:

| Control | What it does |
|---------|-------------|
| Build size pills (1–4) | How many perks to fill; pills below pinned count are disabled |
| Banned perks chips | Shows blacklisted perk names; each has a × remove button |
| Category filters | `+` **whitelist** selected categories (all others excluded) · `−` skip selected |
| Character filters | `+` **whitelist** selected characters (all others excluded) · `−` skip selected |
| Reset | Clears all constraints; appears when `activeConstraintCount > 0` |

> **Include = whitelist, not additive.** Clicking `+` on one character restricts the pool to perks from that character only. Adding a second `+` expands the whitelist. A dim hint under each section header and a live "Only: …" summary make this visible before the user randomises.

Clicking the overlay closes the drawer. Constraints persist across page reloads scoped by role. See [ADR-0007](../../docs/adr/0007-constraints-persisted-to-localstorage.md).

---

## Pin Slots

Each slot has a Pin / Pinned toggle button. Pinned slots are preserved by `randomise()` — their perks are not replaced.

- Disabled when the slot is empty.
- Removing a perk from a pinned slot auto-unpins it.
- Pinned count factors into the build size pill minimum: pills below `pinnedCount` are disabled in the drawer.

---

## URL Sharing

`encodeBuild(role, slots)` produces a query string: `?role=survivor&p0=Dead%20Hard&p1=&p2=&p3=`. Empty slots are encoded as empty strings.

On mount, `decodeBuild(window.location.search, allPerks)` parses this and hydrates the slot state. A `urlReady` ref prevents the sync effect from overwriting the incoming URL before hydration completes.

After mount, slot changes are written back with `window.history.replaceState`.

---

## Export

`ExportToolbar` provides three export actions:

| Action | Implementation |
|--------|---------------|
| Share URL | Copies `window.location.href` to clipboard |
| Copy Text | Copies a plain-text `[Role Build]\n1. Perk\n2. Perk…` list |
| Download Image | Calls `exportBuildImage(slots, role)` → 640×220 PNG |

An optional tier-list export button appears when `hasRatings` is true, calling `exportTierListImage`. Both canvas functions wait for `document.fonts.ready` before drawing to ensure Cinzel/Oswald are loaded.

---

## Save Build

The "Save Build" button opens `SaveBuildModal`. If the user is not authenticated, it opens the auth modal instead.

`SaveBuildModal` collects a name (required, 1–100 chars). On submit, `useBuilds.saveBuild` validates via the `validate-build` edge function then inserts into Supabase. See [[features/saved-builds]].

---

## Related pages

- [[hooks]]
- [[components]]
- [[features/saved-builds]]
- [[decisions]]
- [[edge-functions]]

# Decisions

**Summary**: Informal design decisions and trade-offs not formally captured in ADRs — the "why" behind choices that would otherwise look arbitrary in the code.

**Sources**: `docs/adr/0006-pin-conflict-blocks-randomise.md`, `docs/adr/0007-constraints-persisted-to-localstorage.md`, `src/hooks/useConstraints.ts`, `src/hooks/useRatings.ts`, `src/components/BuildMaker/BuildMaker.tsx`

**Last updated**: 2026-06-05

---

## Constraint conflicts block Randomise (ADR-0006)

When a pinned slot contains a perk that an active constraint would exclude, Randomise is disabled and a specific error is shown. The alternative — silently letting pins override constraints — was rejected because it hides the conflict from the user.

The Randomise button being disabled always means "your configuration is invalid". This consistent signal is more valuable than the convenience of auto-resolving conflicts.

See [ADR-0006](../docs/adr/0006-pin-conflict-blocks-randomise.md).

---

## Constraints persisted to localStorage, scoped by role (ADR-0007)

Randomiser constraints (blacklist, build size, category/character filters) survive page reloads. Survivor and Killer constraints are stored independently under `constraints_survivor` and `constraints_killer`.

No backend required — constraints are personal preference, not shareable or user-account-bound. Stale blacklist names (perks removed in a later chapter) are silently dropped on load.

See [ADR-0007](../docs/adr/0007-constraints-persisted-to-localstorage.md).

---

## Ratings are optimistic, not locally cached

`useRatings` does not use `localStorage` as a persistence layer. Ratings are always loaded from Supabase on sign-in. Writes are optimistic (local state updates immediately, rolls back on error) but there is no offline fallback.

This was a deliberate simplification: the old codebase had a localStorage migration path for unauthenticated users. That path was removed when Supabase auth became the only supported flow.

---

## `useRatings` manages its own auth subscription

Rather than accepting `userId` as a prop, `useRatings` subscribes to `onAuthStateChange` internally. This keeps the hook self-contained but means it maintains a second auth subscription alongside `useAuth`. The trade-off was accepted to avoid prop-drilling userId through `PerkSection` → `PerkCard`.

---

## `urlReady` ref gates URL sync in BuildMaker

`BuildMaker` reads `?role=&p0–p3=` on mount to hydrate slots from a shared link, then writes slot changes back to the URL. Without a guard, the write effect would fire before the read effect and overwrite the incoming URL with empty slots.

The `urlReady` ref is set `true` inside the hydration effect, gating the sync effect so the URL is never overwritten before hydration completes.

---

## Category filter uses first category only for colour

`getCategoryColor(categories)` uses only `categories[0]` for the octagon border colour. Perks can have multiple categories, but using all of them would require a gradient or multi-border treatment. The first category was chosen as a reasonable representative and the simplest implementation.

---

## Description HTML rendered with `dangerouslySetInnerHTML`

Perk descriptions from the API contain `{Keyword.*}` and `{Tunable.*}` placeholders. `resolveDescription` in `perkUtils.ts` replaces these with `<span class="keyword">` and `<kbd>` tags respectively, then passes the result through `DOMPurify.sanitize()` with a strict allowlist (`ALLOWED_TAGS: ['span', 'kbd']`, `ALLOWED_ATTR: ['class']`) before the string is injected with `dangerouslySetInnerHTML`.

The data source is the dbd.tricky.lol API — a read-only third-party source. DOMPurify provides defence-in-depth against any unexpected markup in the API response.

---

## Related pages

- [[hooks]]
- [[features/build-maker]]
- [[features/perks]]

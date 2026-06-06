# Architecture

**Summary**: Overview of the tech stack, how data flows through the app, how the Vite proxy works, and how Supabase and Sentry are wired in.

**Sources**: `vite.config.ts`, `src/App.tsx`, `src/services/dbdApi.ts`, `src/services/supabase.ts`, `src/context/AuthModalContext.tsx`, `src/context/ToastContext.tsx`

**Last updated**: 2026-06-05

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18, functional components only |
| Language | TypeScript (strict mode) |
| Build tool | Vite |
| Styling | SCSS modules + global SCSS |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Error monitoring | Sentry (via `@sentry/react` + `@sentry/vite-plugin`) |
| External data | `dbd.tricky.lol` REST API (free, no auth) |

## Data Flow

```
Browser
  │
  ├── /api/*         → Vite proxy → https://dbd.tricky.lol  (perk/character data)
  ├── /dbdassets/*   → Vite proxy → https://dbd.tricky.lol/dbdassets/
  │
  ├── supabase.auth  → Supabase Auth  (sign-in, session)
  ├── supabase.from  → Supabase Postgres  (ratings, builds, profiles)
  └── supabase.functions.invoke  → Edge Functions  (validate-build)
```

## Vite Proxy

Defined in `vite.config.ts`. Two proxy rules route requests so the browser never calls the external API directly:

- `/api` → `https://dbd.tricky.lol` — used by `getAllPerks()` and `getCharacters()`.
- `/dbdassets` → `https://dbd.tricky.lol/dbdassets/` — asset path alias (not currently used in app code; available for future use).

`changeOrigin: true` rewrites the `Host` header on both. This avoids CORS issues in development and keeps the external API URL out of client bundles.

## Supabase Client

`src/services/supabase.ts` exports a single `supabase` client instance, initialised from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars. All hooks import this singleton directly.

## App Shell

`src/App.tsx` is the root component. It:

1. Subscribes to auth state via `useAuth`.
2. Manages the `AuthModal` open/close state.
3. Provides `AuthModalContext` so any descendant can imperatively open the auth modal with an optional reason string.
4. Renders the page header (title + sign-in/out controls) and `<PerkList>` (the tab container).

## Context Providers

| Context | File | Purpose |
|---------|------|---------|
| `AuthModalContext` | `src/context/AuthModalContext.tsx` | Exposes `openAuthModal(reason?)` to any component without prop-drilling |
| `ToastContext` | `src/context/ToastContext.tsx` | Global toast notification queue; `showToast(message, type?)` auto-dismisses after 4 s |

## Sentry

Integrated via `@sentry/react` in hooks and `@sentry/vite-plugin` in the build. Source maps are uploaded but hidden from the browser (`sourcemap: "hidden"`). User identity is set on sign-in and cleared on sign-out inside `useAuth`.

## Related pages

- [[data-model]]
- [[hooks]]
- [[features/auth]]
- [[edge-functions]]

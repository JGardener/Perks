# Feature: Auth

**Summary**: How authentication works — sign-in/up flows, Google OAuth, session management, and the automatic profile creation trigger.

**Sources**: `src/hooks/useAuth.ts`, `src/components/AuthModal/AuthModal.tsx`, `src/context/AuthModalContext.tsx`, `src/App.tsx`, `CLAUDE.md` (schema section)

**Last updated**: 2026-06-05

---

## Overview

Authentication is handled entirely by Supabase Auth. The app supports two sign-in methods:

1. **Email + password** — sign in or create an account.
2. **Google OAuth** — `signInWithOAuth` with `redirectTo: window.location.origin`.

Session state is reactive: `useAuth` subscribes to `onAuthStateChange` and the entire app updates when the user signs in or out.

---

## `useAuth`

See [[hooks]] for the full signature. Key points:

- On mount, calls `supabase.auth.getSession()` to restore an existing session.
- Sets `loading: true` until the session check resolves — consumers should gate authenticated-only UI on `!loading`.
- Signs in with Google redirects the browser; the return URL is `window.location.origin`.

---

## `AuthModal`

Opens imperatively via `openAuthModal(reason?)` from `useAuthModal`. The optional `reason` string (e.g. "Sign in to save builds") is displayed above the form.

**Modes**: `signin` | `signup`. Switching mode clears error state.

**Sign-up flow**: on success, shows a "check your email to confirm" message. The user must confirm their email before they can sign in.

**Sign-in flow**: on success, `onClose()` is called immediately (modal closes; `useAuth` reacts to the new session).

**Accessibility**: focus trap (Tab/Shift+Tab cycle within the modal), Escape to close, `autoComplete` on form fields, `role="alert"` on errors, `role="status"` on the sign-up success message.

---

## Profile Creation

A `SECURITY DEFINER` Postgres trigger (`on_auth_user_created`) fires on every new row in `auth.users`. It inserts a matching row into `public.profiles` with `display_name` populated from `raw_user_meta_data`.

This runs automatically — no client-side profile creation is required.

---

## Auth-Gated Features

| Feature | Behaviour for anon users |
|---------|--------------------------|
| Perk ratings | Not available (no localStorage fallback) |
| Community grades | Empty array returned; ghosted UI shown |
| Saved builds | Sign-in prompt shown |
| Stats view | Personal stats work if any ratings exist; community section locked behind sign-in nudge |

---

## Opening the Auth Modal

Any component can open the modal without prop-drilling by using `useAuthModal`:

```ts
const { openAuthModal } = useAuthModal();
openAuthModal('Sign in to save builds');
```

`AuthModalContext.Provider` is mounted in `App.tsx`. Throws if used outside the provider.

---

## Related pages

- [[hooks]]
- [[components]]
- [[features/saved-builds]]
- [[features/stats]]

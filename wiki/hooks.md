# Hooks

**Summary**: All custom React hooks in `src/hooks/` — their signatures, return shapes, side-effects, and key behaviours.

**Sources**: `src/hooks/useAsyncData.ts`, `src/hooks/usePerks.ts`, `src/hooks/useCharacters.ts`, `src/hooks/useAuth.ts`, `src/hooks/useRatings.ts`, `src/hooks/useBuilds.ts`, `src/hooks/useCommunityGrades.ts`, `src/hooks/useConstraints.ts`, `src/hooks/useToast.ts`, `src/context/ToastContext.tsx`, `src/context/AuthModalContext.tsx`

**Last updated**: 2026-06-05

---

## `useAsyncData<T>`

Generic data-fetching primitive. All API-backed hooks build on this.

```ts
useAsyncData<T>(fetcher: () => Promise<T>, initial: T)
  → { data: T, loading: boolean, error: string, retry: () => void }
```

- Runs `fetcher` on mount. Sets `loading: true` until settled.
- Cancels in-flight requests on unmount via a `cancelled` flag — prevents stale state updates.
- `retry()` increments an internal `attempt` counter, re-triggering the effect.

---

## `usePerks`

```ts
usePerks() → { perks: Perk[], loading: boolean, error: string, retry: () => void }
```

Calls `getAllPerks()`, converts the `Record<string, Perk>` response to an array via `Object.values`. Built on `useAsyncData`.

---

## `useCharacters`

```ts
useCharacters() → { characterMap: Record<number, string>, loading: boolean, error: string, retry: () => void }
```

Calls `getCharacters()`, transforms the result to a numeric-ID-to-name map. Built on `useAsyncData`.

---

## `useAuth`

```ts
useAuth() → {
  user: User | null,
  loading: boolean,
  signIn: (email, password) => Promise<...>,
  signUp: (email, password) => Promise<...>,
  signOut: () => Promise<...>,
  signInWithGoogle: () => Promise<...>,
}
```

- Subscribes to `supabase.auth.onAuthStateChange` on mount; unsubscribes on unmount.
- Sets `loading: true` until the initial session check resolves.
- Sets `Sentry.setUser` on sign-in; clears it on sign-out.
- `signInWithGoogle` uses OAuth with `redirectTo: window.location.origin`.

---

## `useRatings`

```ts
useRatings() → { ratings: Record<string, Grade>, setRating: (perkName, grade | null) => void }
```

- Tracks auth state independently via `onAuthStateChange`. Does not accept `userId` as a prop — it self-manages.
- On sign-in: loads all rows from `ratings` table for the current user.
- On sign-out: clears local ratings state.
- `setRating` is **optimistic**: updates local state immediately, then upserts/deletes in Supabase. Rolls back on error and shows a toast.
- Passing `grade: null` deletes the rating.

---

## `useBuilds`

```ts
useBuilds(userId: string | null) → {
  builds: Build[],
  loading: boolean,
  error: string | null,
  saveBuild: (name, role, perks, isPublic?) => Promise<Build | null>,
  deleteBuild: (id) => Promise<void>,
}
```

- Fetches all builds for `userId` ordered by `created_at DESC`. Clears state when `userId` is null.
- `saveBuild` calls the `validate-build` edge function before inserting. Returns `null` and sets `error` if validation fails.
- `saveBuild` is **optimistic**: prepends the new build to local state on success.
- `deleteBuild` guards on both `id` and `user_id` in the Supabase query.
- Uses `useToast` for error feedback.

---

## `useCommunityGrades`

```ts
useCommunityGrades(userId: string | null) → {
  grades: CommunityGrade[],
  loading: boolean,
  error: string | null,
}
```

- Fetches from the `perk_community_grades` view via the `get_perk_community_grades` RPC.
- Returns an empty array when `userId` is null (view is auth-gated; anon users get no data).
- Clears state on sign-out.
- On fetch error, shows an info toast rather than a hard error.

---

## `useConstraints`

The randomiser constraints engine. The largest and most complex hook in the project.

```ts
useConstraints(
  perks: Perk[],
  slots: (Perk | null)[],
  setSlots: (s: (Perk | null)[]) => void,
  characterMap: Record<number, string>,
  role: 'survivor' | 'killer',
) → [ConstraintsState, ConstraintsActions, ConstraintsDerived]
```

### State

```ts
interface ConstraintsState {
  pinnedSlots: Set<number>;
  blacklist: Set<string>;
  buildSize: number;             // 1–4; how many perks to fill
  categoryFilters: Record<string, FilterState>;
  characterFilters: Record<string, FilterState>;
}
```

`FilterState = 'include' | 'exclude' | 'neutral'`. Toggling cycles `neutral → include → exclude → neutral`.

### Actions

```ts
interface ConstraintsActions {
  togglePin: (idx) => void;
  toggleBlacklist: (name) => void;
  setBuildSize: (n) => void;
  toggleCategory: (cat, value?) => void;
  toggleCharacter: (key, value?) => void;
  resetConstraints: () => void;
  randomise: () => void;
}
```

`toggleCategory` and `toggleCharacter` accept an optional `value` to force a specific state (used by the drawer's +/− buttons); without it, they cycle.

`togglePin` is a no-op if the slot is empty.

### Derived

```ts
interface ConstraintsDerived {
  eligibleCount: number;          // perks remaining after all filters, minus pinned
  activeConstraintCount: number;  // badge count for the drawer toggle
  constraintError: string | null; // first conflict found, or pool-too-small message
  canRandomise: boolean;
  availableCategories: string[];
  availableCharacterKeys: string[]; // ['base', '1', '2', ...]
  getCharacterLabel: (key) => string;
  pinnedCount: number;
}
```

### Persistence

Constraints are persisted to `localStorage` keyed by role: `constraints_survivor` / `constraints_killer`. Loaded on mount (after role changes). Stale blacklist names (perks that no longer exist) are silently dropped on load.

### Randomise logic

1. Shuffle `eligiblePool` (blacklist + category + character filters applied; pinned perk names excluded from pool).
2. Copy pinned perks into `newSlots`.
3. Fill empty slots up to `buildSize` from the shuffled pool.

See [[decisions]] for the conflict-blocking behaviour and persistence rationale. Also [ADR-0006](../docs/adr/0006-pin-conflict-blocks-randomise.md) and [ADR-0007](../docs/adr/0007-constraints-persisted-to-localstorage.md).

---

## `useToast`

Re-exported from `src/context/ToastContext.tsx`.

```ts
useToast() → { showToast: (message: string, type?: 'error' | 'info') => void }
```

Adds a toast to the global queue. Auto-dismisses after 4 s. Must be used within `<ToastProvider>`.

---

## `useAuthModal`

Re-exported from `src/context/AuthModalContext.tsx`.

```ts
useAuthModal() → { openAuthModal: (reason?: string) => void }
```

Imperatively opens the `AuthModal`. The optional `reason` string is displayed inside the modal to explain why sign-in is required. Must be used within `<AuthModalContext.Provider>`.

---

## Related pages

- [[architecture]]
- [[data-model]]
- [[features/build-maker]]
- [[features/auth]]
- [[features/saved-builds]]

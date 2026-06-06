# Data Model

**Summary**: All TypeScript types, Supabase database tables, and the community grades view — the complete shape of every data entity in the app.

**Sources**: `src/types/dbd.ts`, `CLAUDE.md` (schema section)

**Last updated**: 2026-06-05

---

## TypeScript Types

All shared types live in `src/types/dbd.ts`.

### `Perk`

```ts
interface Perk {
  name: string;
  description: string;        // HTML string with {Tunable.*} and {Keyword.*} placeholders
  character: number | null;   // null = "base" perk (not tied to a character)
  role: 'survivor' | 'killer';
  image: string;              // relative path — pass to getPerkImageUrl() to get a usable URL
  categories: PerkCategory[] | null;
  tunables: Record<string, number[]> | null;  // numeric values substituted into description
}
```

### `PerkCategory`

A 14-value string union:

```ts
type PerkCategory =
  | 'adaptation' | 'chasing' | 'concealment' | 'cruelty'
  | 'enhancement' | 'hinderance' | 'navigation' | 'obstruction'
  | 'perception' | 'safeguard' | 'strategy' | 'support'
  | 'trickery' | 'tracking';
```

Each value maps to a distinct hex colour in `CATEGORY_COLORS`. See [[styles]].

### `Character`

```ts
interface Character {
  id: string;
  name: string;
  role: string;
}
```

Returned by `getCharacters()`. Hooks transform this into a `Record<number, string>` (numeric ID → name) for fast lookup.

### `Grade`

```ts
type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
```

A–F rating scale. `A` is highest. Each grade maps to a distinct colour in `GRADE_COLORS`. See [[styles]].

### `Profile`

```ts
interface Profile {
  id: string;          // same as auth.users.id
  display_name: string | null;
  created_at: string;
}
```

Auto-created on sign-up via a `SECURITY DEFINER` trigger on `auth.users`.

### `Build`

```ts
interface Build {
  id: string;
  user_id: string;
  name: string;
  role: 'survivor' | 'killer';
  perks: (string | null)[];   // array of perk names; nulls = empty slots
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

### `CommunityGrade`

```ts
interface CommunityGrade {
  perk_name: string;
  grade: Grade;
  count: number;
}
```

Each row represents how many users rated a specific perk at a specific grade. Returned by the `perk_community_grades` Supabase view via `get_perk_community_grades` RPC.

---

## Supabase Schema

### `public.ratings`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `perk_name` | text | |
| `grade` | text | CHECK: A–F |
| `updated_at` | timestamptz | |

RLS: users can only read/write their own rows. Upsert on `(user_id, perk_name)`.

### `public.profiles`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK/FK → auth.users | |
| `display_name` | text \| null | Populated from `raw_user_meta_data` on sign-up |
| `created_at` | timestamptz | |

Created automatically by `on_auth_user_created` trigger. RLS: owner can SELECT/INSERT/UPDATE.

### `public.builds`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `name` | text | CHECK: 1–100 chars |
| `role` | text | CHECK: `survivor` \| `killer` |
| `perks` | jsonb | Array of perk name strings or nulls, ≤4 items |
| `is_public` | boolean | default false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Indexes: `user_id`; partial `(created_at DESC) WHERE is_public`. RLS: owner manages own rows; anyone reads public rows.

### `public.perk_community_grades` (view)

Aggregates `perk_name`, `grade`, and `COUNT(*)` across all users' ratings. `security_invoker=off` bypasses per-user RLS so the view sees all rows. `authenticated` role: SELECT. `anon`: no access. Exposed to the client via the `get_perk_community_grades` RPC.

---

## Related pages

- [[architecture]]
- [[hooks]]
- [[features/auth]]
- [[features/saved-builds]]

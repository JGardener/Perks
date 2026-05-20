# Backend Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `profiles` table, `builds` table, `perk_community_grades` aggregate view, explicit RLS on all three, and a `validate-build` Edge Function — with matching TypeScript types and React hooks to consume them.

**Architecture:** Three Supabase migrations land the DB objects (each applied via `mcp__supabase__apply_migration`), then TypeScript types are added to the existing type file, a Deno Edge Function handles server-side build validation, and two new React hooks expose builds CRUD and community grade data to the frontend.

**Tech Stack:** PostgreSQL 17 (Supabase), Deno (Edge Functions), React + TypeScript (hooks)

**Supabase project ID:** `dlbzjnwiciiminbtibpn`

---

## File Map

| Action   | Path                                                          | Responsibility                          |
|----------|---------------------------------------------------------------|-----------------------------------------|
| Modify   | `src/types/dbd.ts`                                            | Add `Profile`, `Build`, `CommunityGrade` types |
| Create   | `supabase/functions/validate-build/validate.ts`              | Pure validation logic (testable)        |
| Create   | `supabase/functions/validate-build/validate.test.ts`         | Deno unit tests for validation logic    |
| Create   | `supabase/functions/validate-build/index.ts`                 | HTTP handler — imports validate.ts      |
| Create   | `src/hooks/useBuilds.ts`                                     | List / save / delete saved builds       |
| Create   | `src/hooks/useCommunityGrades.ts`                            | Read aggregate rating distribution      |

Migrations are applied directly via MCP; no migration files are committed to disk (the remote project tracks them in `supabase_migrations.schema_migrations`).

---

## Task 1: profiles table

**Files:**
- Applied via MCP (no file written to disk)

- [ ] **Step 1: Verify the table does not exist yet**

Run `mcp__supabase__execute_sql` with project_id `dlbzjnwiciiminbtibpn`:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'profiles';
```
Expected: 0 rows.

- [ ] **Step 2: Apply the migration**

Run `mcp__supabase__apply_migration` with:
- `project_id`: `dlbzjnwiciiminbtibpn`
- `name`: `create_profiles`
- `query`:

```sql
-- Profiles mirror auth.users; auto-created on sign-up.
CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger function: inserts a profile row when a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 3: Verify the table, policies, and trigger exist**

Run `mcp__supabase__execute_sql`:
```sql
-- table + RLS flag
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'profiles';

-- policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- trigger
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```
Expected: `relrowsecurity = true`, two policy rows (`Users can view own profile`, `Users can update own profile`), trigger row present.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(db): add profiles table with auto-create trigger and RLS"
```

---

## Task 2: builds table

**Files:**
- Applied via MCP

- [ ] **Step 1: Verify the table does not exist**

Run `mcp__supabase__execute_sql`:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'builds';
```
Expected: 0 rows.

- [ ] **Step 2: Apply the migration**

Run `mcp__supabase__apply_migration` with:
- `project_id`: `dlbzjnwiciiminbtibpn`
- `name`: `create_builds`
- `query`:

```sql
-- Saved builds. perks is a JSON array of up to 4 perk-name strings (null for empty slots).
CREATE TABLE public.builds (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT        NOT NULL,
  role       TEXT        NOT NULL CHECK (role IN ('survivor', 'killer')),
  perks      JSONB       NOT NULL DEFAULT '[]',
  public     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

-- Owner can INSERT, UPDATE, DELETE, SELECT their own builds.
CREATE POLICY "Users can manage own builds"
  ON public.builds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anyone (including anon) can SELECT builds marked public.
CREATE POLICY "Anyone can view public builds"
  ON public.builds FOR SELECT
  USING (public = TRUE);
```

- [ ] **Step 3: Verify**

Run `mcp__supabase__execute_sql`:
```sql
-- columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'builds'
ORDER BY ordinal_position;

-- policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'builds';
```
Expected: 7 columns (`id`, `user_id`, `name`, `role`, `perks`, `public`, `created_at`), two policies (`Users can manage own builds`, `Anyone can view public builds`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(db): add builds table with RLS policies"
```

---

## Task 3: perk_community_grades view

The view aggregates the existing `ratings` table across ALL users. `security_invoker = off` (PG 15+ syntax) makes the view run as its owner — the Supabase `postgres` role — which bypasses the `ratings` RLS. Access is restricted to the `authenticated` role via GRANT.

**Files:**
- Applied via MCP

- [ ] **Step 1: Verify the view does not exist**

Run `mcp__supabase__execute_sql`:
```sql
SELECT viewname
FROM pg_views
WHERE schemaname = 'public' AND viewname = 'perk_community_grades';
```
Expected: 0 rows.

- [ ] **Step 2: Apply the migration**

Run `mcp__supabase__apply_migration` with:
- `project_id`: `dlbzjnwiciiminbtibpn`
- `name`: `create_community_grades_view`
- `query`:

```sql
-- Aggregates all users' ratings. security_invoker=off bypasses per-user RLS
-- so the view sees every row in ratings, not just the caller's.
CREATE VIEW public.perk_community_grades
WITH (security_invoker = off)
AS
SELECT
  perk_name,
  grade,
  COUNT(*)::int AS count
FROM public.ratings
GROUP BY perk_name, grade;

-- Anon callers cannot see aggregate data; authenticated users can.
REVOKE SELECT ON public.perk_community_grades FROM anon;
GRANT  SELECT ON public.perk_community_grades TO authenticated;
```

- [ ] **Step 3: Verify**

Run `mcp__supabase__execute_sql`:
```sql
-- view exists
SELECT viewname FROM pg_views
WHERE schemaname = 'public' AND viewname = 'perk_community_grades';

-- grants: authenticated has SELECT, anon does not
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'perk_community_grades';
```
Expected: view row present; `authenticated` has `SELECT`; `anon` is absent.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(db): add perk_community_grades view, auth-gated via GRANT"
```

---

## Task 4: TypeScript types

**Files:**
- Modify: `src/types/dbd.ts`

- [ ] **Step 1: Add types to the end of `src/types/dbd.ts`**

Append to the file (after the existing `Grade` type):

```typescript
export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Build {
  id: string;
  user_id: string;
  name: string;
  role: 'survivor' | 'killer';
  perks: (string | null)[];
  public: boolean;
  created_at: string;
}

export interface CommunityGrade {
  perk_name: string;
  grade: Grade;
  count: number;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/dbd.ts
git commit -m "feat(types): add Profile, Build, CommunityGrade types"
```

---

## Task 5: validate-build Edge Function

The function validates build structure server-side before it is written to the `builds` table. Pure logic lives in `validate.ts` so it can be unit-tested without running an HTTP server.

**Files:**
- Create: `supabase/functions/validate-build/validate.ts`
- Create: `supabase/functions/validate-build/validate.test.ts`
- Create: `supabase/functions/validate-build/index.ts`

- [ ] **Step 1: Write the failing tests first**

Create `supabase/functions/validate-build/validate.test.ts`:

```typescript
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateBuild } from "./validate.ts";

Deno.test("valid survivor build with nulls passes", () => {
  const result = validateBuild({ role: "survivor", perks: ["Adrenaline", "Dead Hard", null, null] });
  assertEquals(result, { valid: true, errors: [] });
});

Deno.test("valid killer build with four perks passes", () => {
  const result = validateBuild({ role: "killer", perks: ["Tinkerer", "Pop Goes the Weasel", "Bamboozle", "Hex: No One Escapes Death"] });
  assertEquals(result, { valid: true, errors: [] });
});

Deno.test("empty perks array is valid", () => {
  const result = validateBuild({ role: "killer", perks: [] });
  assertEquals(result, { valid: true, errors: [] });
});

Deno.test("invalid role fails", () => {
  const result = validateBuild({ role: "healer", perks: [] });
  assertEquals(result.valid, false);
  assertEquals(result.errors, ["role must be one of: survivor, killer"]);
});

Deno.test("missing role fails", () => {
  const result = validateBuild({ perks: ["Adrenaline"] });
  assertEquals(result.valid, false);
  assertEquals(result.errors, ["role must be one of: survivor, killer"]);
});

Deno.test("perks with 5 items fails", () => {
  const result = validateBuild({ role: "survivor", perks: ["A", "B", "C", "D", "E"] });
  assertEquals(result.valid, false);
  assertEquals(result.errors, ["perks must have at most 4 items"]);
});

Deno.test("empty string perk fails", () => {
  const result = validateBuild({ role: "survivor", perks: [""] });
  assertEquals(result.valid, false);
  assertEquals(result.errors, ["perks[0] must be a non-empty string or null"]);
});

Deno.test("non-array perks fails", () => {
  const result = validateBuild({ role: "killer", perks: "Tinkerer" });
  assertEquals(result.valid, false);
  assertEquals(result.errors, ["perks must be an array"]);
});

Deno.test("non-object body fails", () => {
  const result = validateBuild("invalid");
  assertEquals(result.valid, false);
  assertEquals(result.errors, ["body must be an object"]);
});
```

- [ ] **Step 2: Run tests — expect failures (validate.ts does not exist)**

```bash
deno test supabase/functions/validate-build/validate.test.ts
```
Expected: error — module `./validate.ts` not found.

- [ ] **Step 3: Create `supabase/functions/validate-build/validate.ts`**

```typescript
export interface ValidateResult {
  valid: boolean;
  errors: string[];
}

const VALID_ROLES = ["survivor", "killer"] as const;
type Role = (typeof VALID_ROLES)[number];

export function validateBuild(body: unknown): ValidateResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { valid: false, errors: ["body must be an object"] };
  }

  const errors: string[] = [];
  const { role, perks } = body as Record<string, unknown>;

  if (!VALID_ROLES.includes(role as Role)) {
    errors.push(`role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  if (!Array.isArray(perks)) {
    errors.push("perks must be an array");
  } else {
    if (perks.length > 4) {
      errors.push("perks must have at most 4 items");
    }
    for (let i = 0; i < perks.length; i++) {
      const p = perks[i];
      if (p !== null && (typeof p !== "string" || p.trim() === "")) {
        errors.push(`perks[${i}] must be a non-empty string or null`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
deno test supabase/functions/validate-build/validate.test.ts
```
Expected: `9 passed | 0 failed`.

- [ ] **Step 5: Create `supabase/functions/validate-build/index.ts`**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { validateBuild } from "./validate.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ valid: false, errors: ["Invalid JSON"] }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const result = validateBuild(body);
  return new Response(JSON.stringify(result), {
    status: result.valid ? 200 : 400,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
```

- [ ] **Step 6: Deploy the Edge Function**

Run `mcp__supabase__deploy_edge_function` with:
- `project_id`: `dlbzjnwiciiminbtibpn`
- `name`: `validate-build`
- `entrypoint_path`: `index.ts`
- `verify_jwt`: `true`
- `files`: both `index.ts` and `validate.ts` contents as uploaded files

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/validate-build/
git commit -m "feat(edge): add validate-build edge function with unit tests"
```

---

## Task 6: useBuilds hook

Fetches the current user's saved builds, saves a new build (calling the edge function to validate first), and deletes a build. Accepts `userId` as a parameter — callers get it from `useAuth`.

**Files:**
- Create: `src/hooks/useBuilds.ts`

- [ ] **Step 1: Create `src/hooks/useBuilds.ts`**

```typescript
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { Build } from "../types/dbd";

export const useBuilds = (userId: string | null) => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBuilds([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("builds")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
        } else {
          setBuilds((data ?? []) as Build[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveBuild = useCallback(
    async (
      name: string,
      role: "survivor" | "killer",
      perks: (string | null)[],
      isPublic = false,
    ): Promise<Build | null> => {
      if (!userId) return null;

      const { data: validateData, error: validateError } =
        await supabase.functions.invoke("validate-build", {
          body: { role, perks },
        });

      if (validateError || !(validateData as { valid: boolean })?.valid) {
        const messages = (validateData as { errors?: string[] })?.errors ?? [];
        setError(messages.join(", ") || "Invalid build");
        return null;
      }

      const { data, error: insertError } = await supabase
        .from("builds")
        .insert({ user_id: userId, name, role, perks, public: isPublic })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      const build = data as Build;
      setBuilds((prev) => [build, ...prev]);
      return build;
    },
    [userId],
  );

  const deleteBuild = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) return;

      const { error: deleteError } = await supabase
        .from("builds")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setBuilds((prev) => prev.filter((b) => b.id !== id));
    },
    [userId],
  );

  return { builds, loading, error, saveBuild, deleteBuild };
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Start the dev server (`npm run dev`), sign in with a test account, open the browser console and run:

```javascript
// In the app, expose supabase from window for testing (temporary):
// window.__sb = supabase (add this line to src/services/supabase.ts temporarily)
// Then:
const { data } = await window.__sb.from('builds').select('*');
console.log(data); // should be [] for a new account
```

Expected: empty array, no error.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useBuilds.ts
git commit -m "feat(hooks): add useBuilds hook for build CRUD"
```

---

## Task 7: useCommunityGrades hook

Fetches the `perk_community_grades` view when a user is authenticated. Returns an empty array when called without a `userId` (anonymous callers cannot query the view per the GRANT).

**Files:**
- Create: `src/hooks/useCommunityGrades.ts`

- [ ] **Step 1: Create `src/hooks/useCommunityGrades.ts`**

```typescript
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { CommunityGrade } from "../types/dbd";

export const useCommunityGrades = (userId: string | null) => {
  const [grades, setGrades] = useState<CommunityGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setGrades([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("perk_community_grades")
      .select("*")
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
        } else {
          setGrades((data ?? []) as CommunityGrade[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { grades, loading, error };
};
```

- [ ] **Step 2: Export from components index**

`src/components/index.ts` exports components; hooks are imported directly. No index update needed — callers import via `../hooks/useCommunityGrades`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Manual smoke test**

While signed in, open the browser console:

```javascript
const { data } = await window.__sb.from('perk_community_grades').select('*');
console.log(data); // array of { perk_name, grade, count } rows (may be sparse if few ratings exist)
```

Then sign out and repeat — expected: `{}` error response with permission denied (anon cannot SELECT the view).

- [ ] **Step 5: Remove temporary debug line from supabase.ts if it was added in Task 6**

Revert any `window.__sb = supabase` line added during smoke testing.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useCommunityGrades.ts
git commit -m "feat(hooks): add useCommunityGrades hook for auth-gated aggregate view"
```

---

## Self-Review Checklist

| Spec requirement | Covered by |
|---|---|
| `profiles` table with auto-create trigger on sign-up | Task 1 |
| `builds` table (id, user_id, name, role, perks jsonb, public boolean, created_at) | Task 2 |
| `perk_community_grades` view aggregating ratings, auth-gated | Task 3 |
| Explicit RLS on all three new tables/view | Tasks 1, 2, 3 |
| Edge Function to validate builds server-side | Task 5 |
| TypeScript types for new DB objects | Task 4 |
| React hooks to consume builds and community grades | Tasks 6, 7 |

No placeholders found. Type names (`Build`, `Profile`, `CommunityGrade`, `ValidateResult`) are consistent across all tasks.

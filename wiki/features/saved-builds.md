# Feature: Saved Builds

**Summary**: How builds are saved, loaded, deleted, and shared — the full lifecycle from the Save button through Supabase and back to the UI.

**Sources**: `src/hooks/useBuilds.ts`, `src/components/SavedBuilds/SavedBuilds.tsx`, `src/components/SaveBuildModal/SaveBuildModal.tsx`, `src/components/DeleteBuildModal/DeleteBuildModal.tsx`, `src/utils/buildShare.ts`, `supabase/functions/validate-build/`

**Last updated**: 2026-06-05

---

## Save Flow

1. User clicks "Save Build" in `BuildMaker`.
2. If unauthenticated, the auth modal opens. If authenticated, `SaveBuildModal` opens.
3. User enters a name (required, non-empty). Modal warns if fewer than 4 perks are selected.
4. On submit, `useBuilds.saveBuild(name, role, perks, isPublic)` is called.
5. `saveBuild` invokes the `validate-build` Edge Function. If validation fails, `error` is set on the hook and the build is not saved.
6. On validation success, the build is inserted into `public.builds`.
7. The new build is **optimistically prepended** to local state immediately on insert success.

---

## Load Flow

`SavedBuilds` renders `SavedBuildCard` rows filtered to the current role.

- If the current build has perks, clicking "Load" shows a "Replace build in progress?" inline confirmation.
- If the current build is empty, Load applies immediately.
- On confirm, `BuildMaker.handleLoadBuild` maps stored perk names back to `Perk` objects via the full perk list and sets the slot state.

---

## Delete Flow

Clicking "Delete" opens `DeleteBuildModal` (confirmation with the build name). On confirm, `useBuilds.deleteBuild(id)` deletes the row from Supabase, guarding on both `id` and `user_id`. The build is removed from local state on success.

---

## URL Sharing

Builds can be shared as URLs. This is separate from the Supabase-persisted saved builds — it's a stateless URL encoding.

`encodeBuild(role, slots)` → `?role=survivor&p0=Dead%20Hard&p1=&p2=&p3=`

`decodeBuild(search, allPerks)` → `{ role, slots }` or `null` if no `role` param.

Built into `BuildMaker`; works for unauthenticated users.

---

## `useBuilds` Behaviour

- Fetches all builds for `userId` on mount, ordered by `created_at DESC`.
- Clears all state when `userId` is null (sign-out).
- `saveBuild` returns the saved `Build` object on success, or `null` on validation/insert failure.
- Error feedback is surfaced via `useToast`.

---

## Supabase Schema

The `public.builds` table stores all saved builds. Key constraints:

- `name`: 1–100 characters.
- `perks`: JSONB array, ≤4 items. Each item is a perk name string or null.
- `role`: CHECK `'survivor' | 'killer'`.
- `is_public`: default false. Public builds can be read by anyone (RLS allows anonymous SELECT on public rows).

See [[data-model]] for the full column list.

---

## Server-Side Validation

Before any insert, `validate-build` is called with `{ role, perks }`. This ensures the database never receives malformed data even if client-side validation is bypassed.

See [[edge-functions]] for the full validation rules.

---

## Related pages

- [[hooks]]
- [[components]]
- [[data-model]]
- [[edge-functions]]
- [[features/auth]]
- [[features/build-maker]]

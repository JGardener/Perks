# Edge Functions

**Summary**: The `validate-build` Supabase Edge Function — what it validates, the request/response shape, and how it is called from the client.

**Sources**: `supabase/functions/validate-build/index.ts`, `supabase/functions/validate-build/validate.ts`, `supabase/config.toml`

**Last updated**: 2026-06-05

---

## `validate-build`

A Deno-based Edge Function that validates a build payload before it is persisted to the `builds` table. Called by `useBuilds.saveBuild`.

### Configuration

In `supabase/config.toml`:

```toml
[functions.validate-build]
verify_jwt = true
```

`verify_jwt = true` means the function requires a valid Supabase JWT. Unauthenticated requests return 401 before the function body runs.

### Request

`POST` with JSON body:

```json
{
  "role": "survivor" | "killer",
  "perks": [(string | null), ...]
}
```

- `role` must be exactly `"survivor"` or `"killer"`.
- `perks` must be an array of at most 4 items.
- Each item must be a non-empty string or `null`.

OPTIONS requests are handled for CORS preflight.

### Response

```json
{ "valid": true, "errors": [] }
```

or

```json
{ "valid": false, "errors": ["role must be one of: survivor, killer", ...] }
```

- `200` when `valid: true`.
- `400` when `valid: false` or the JSON body is malformed.
- `405` for non-POST, non-OPTIONS methods.

### Validation logic (`validate.ts`)

Pure function `validateBuild(body: unknown): ValidateResult`. Isolated from the HTTP handler so it can be unit tested independently. Deno unit tests (10 cases) live alongside the handler.

Checks, in order:
1. Body must be a non-null, non-array object.
2. `role` must be `"survivor"` or `"killer"`.
3. `perks` must be an array.
4. `perks.length` must be ≤ 4.
5. Each element must be a non-empty string or `null`.

All errors are collected before returning — the response contains every failure, not just the first.

### Client-side call

In `useBuilds.saveBuild`:

```ts
const { data, error } = await supabase.functions.invoke('validate-build', {
  body: { role, perks },
});
if (error || !data?.valid) {
  setError(data?.errors?.join(', ') || 'Invalid build');
  return null;
}
```

Validation failure is surfaced as an error string on the hook state.

---

## Related pages

- [[features/saved-builds]]
- [[hooks]]
- [[data-model]]

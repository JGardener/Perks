// Client-side coverage of the shared Build validation rules. The same rules
// have Deno tests in supabase/functions/validate-build/validate.test.ts; this
// proves the rule resolves and behaves identically across the Vite seam, which
// is what useBuilds relies on for its optimistic Save gate.
import { describe, expect, it } from "vitest";
import { validateBuild } from "../../supabase/functions/_shared/buildRules.ts";

describe("validateBuild (client seam)", () => {
  it("accepts a partial build (nulls, <4 perks) per ADR-0005", () => {
    expect(validateBuild({ role: "survivor", perks: ["Adrenaline", null] })).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects an invalid role", () => {
    const result = validateBuild({ role: "healer", perks: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("role must be one of: survivor, killer");
  });

  it("rejects more than 4 perks", () => {
    const result = validateBuild({ role: "killer", perks: ["a", "b", "c", "d", "e"] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("perks must have at most 4 items");
  });

  it("rejects an empty-string perk", () => {
    const result = validateBuild({ role: "survivor", perks: ["  "] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("perks[0] must be a non-empty string or null");
  });
});

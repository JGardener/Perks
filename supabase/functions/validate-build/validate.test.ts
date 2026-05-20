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
  assertEquals(result.errors, ["body must be an object"] );
});

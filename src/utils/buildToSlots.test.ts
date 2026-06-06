import { describe, expect, it } from "vitest";
import type { Perk } from "../types/dbd";
import { BUILD_SLOT_COUNT, buildToSlots } from "./buildToSlots";

const perk = (name: string): Perk => ({ name }) as Perk;
const perks = [perk("Adrenaline"), perk("Dead Hard"), perk("Sprint Burst")];

describe("buildToSlots", () => {
  it("maps known names to perks, preserving slot positions", () => {
    const slots = buildToSlots(["Dead Hard", null, "Adrenaline", null], perks);
    expect(slots.map((s) => s?.name ?? null)).toEqual([
      "Dead Hard",
      null,
      "Adrenaline",
      null,
    ]);
  });

  it(`always returns exactly ${BUILD_SLOT_COUNT} slots`, () => {
    expect(buildToSlots([], perks)).toHaveLength(BUILD_SLOT_COUNT);
    expect(buildToSlots(["Adrenaline"], perks)).toHaveLength(BUILD_SLOT_COUNT);
  });

  it("yields null for unknown, empty, or undefined names", () => {
    const slots = buildToSlots(["Ghost Perk", "", undefined, "Sprint Burst"], perks);
    expect(slots.map((s) => s?.name ?? null)).toEqual([
      null,
      null,
      null,
      "Sprint Burst",
    ]);
  });

  it("ignores names beyond the slot count", () => {
    const slots = buildToSlots(["a", "b", "c", "d", "e"], perks);
    expect(slots).toHaveLength(BUILD_SLOT_COUNT);
  });
});

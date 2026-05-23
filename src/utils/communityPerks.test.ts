import { describe, expect, it } from "vitest";
import type { CommunityGrade, Perk } from "../types/dbd";
import { getCommunityTopPerks } from "./communityPerks";

const makePerk = (name: string, role: "survivor" | "killer" = "survivor"): Perk => ({
  name,
  description: "",
  character: null,
  role,
  image: "",
  categories: null,
  tunables: null,
});

const makeGrade = (perk_name: string, grade: "A" | "B" | "C", count: number): CommunityGrade => ({
  perk_name,
  grade,
  count,
});

const IRON_WILL = makePerk("Iron Will");
const DEAD_HARD = makePerk("Dead Hard");
const CORRUPT = makePerk("Corrupt Intervention", "killer");

describe("getCommunityTopPerks", () => {
  it("silently omits a perk that appears in grades but not in perks", () => {
    const grades: CommunityGrade[] = [makeGrade("Unknown Perk", "A", 10)];
    expect(() => getCommunityTopPerks(grades, [IRON_WILL], "survivor")).not.toThrow();
    expect(getCommunityTopPerks(grades, [IRON_WILL], "survivor")).toEqual([]);
  });

  it("returns empty array when grades is empty", () => {
    expect(getCommunityTopPerks([], [IRON_WILL], "survivor")).toEqual([]);
  });

  it("excludes perks for the wrong role", () => {
    const grades: CommunityGrade[] = [
      makeGrade("Iron Will", "A", 5),
      makeGrade("Corrupt Intervention", "A", 8),
    ];
    const result = getCommunityTopPerks(grades, [IRON_WILL, CORRUPT], "survivor");
    expect(result.map((p) => p.name)).toEqual(["Iron Will"]);
  });

  it("excludes perks with zero A-vote count", () => {
    const grades: CommunityGrade[] = [
      makeGrade("Iron Will", "A", 0),
      makeGrade("Dead Hard", "A", 3),
    ];
    const result = getCommunityTopPerks(grades, [IRON_WILL, DEAD_HARD], "survivor");
    expect(result.map((p) => p.name)).toEqual(["Dead Hard"]);
  });

  it("returns survivor perks sorted by A-vote count descending", () => {
    const grades: CommunityGrade[] = [
      makeGrade("Iron Will", "A", 5),
      makeGrade("Dead Hard", "A", 12),
    ];
    const result = getCommunityTopPerks(grades, [IRON_WILL, DEAD_HARD], "survivor");
    expect(result.map((p) => p.name)).toEqual(["Dead Hard", "Iron Will"]);
  });
});

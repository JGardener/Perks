import { describe, expect, it } from "vitest";
import type { CommunityGrade, Grade, Perk } from "../types/dbd";
import { GRADES, buildCommunityDist, buildRoleStat } from "./statsUtils";

const perk = (name: string, role: "survivor" | "killer"): Perk =>
  ({ name, role }) as Perk;

const perks: Perk[] = [
  perk("Adrenaline", "survivor"),
  perk("Sprint Burst", "survivor"),
  perk("Dead Hard", "survivor"),
  perk("Tinkerer", "killer"),
  perk("Pop", "killer"),
];

describe("GRADES", () => {
  it("is A→F in tier order", () => {
    expect(GRADES).toEqual(["A", "B", "C", "D", "E", "F"]);
  });
});

describe("buildRoleStat", () => {
  it("counts only the role's perks and derives totals", () => {
    const ratings: Record<string, Grade> = { Adrenaline: "A", "Sprint Burst": "B" };
    const stat = buildRoleStat("survivor", "Survivor", perks, ratings);
    expect(stat.totalPerks).toBe(3);
    expect(stat.ratedCount).toBe(2);
  });

  it("computes distribution counts and percentages over rated perks", () => {
    const ratings: Record<string, Grade> = {
      Adrenaline: "A",
      "Sprint Burst": "A",
      "Dead Hard": "B",
    };
    const stat = buildRoleStat("survivor", "Survivor", perks, ratings);
    const a = stat.distribution.find((d) => d.grade === "A")!;
    const b = stat.distribution.find((d) => d.grade === "B")!;
    expect(a).toMatchObject({ count: 2, pct: 67 });
    expect(b).toMatchObject({ count: 1, pct: 33 });
  });

  it("yields 0% (no division by zero) when nothing is rated", () => {
    const stat = buildRoleStat("killer", "Killer", perks, {});
    expect(stat.ratedCount).toBe(0);
    expect(stat.distribution.every((d) => d.pct === 0 && d.count === 0)).toBe(true);
  });

  it("collects A-rated perks sorted by name", () => {
    const ratings: Record<string, Grade> = {
      "Sprint Burst": "A",
      Adrenaline: "A",
      "Dead Hard": "C",
    };
    const stat = buildRoleStat("survivor", "Survivor", perks, ratings);
    expect(stat.topPerks.map((p) => p.name)).toEqual(["Adrenaline", "Sprint Burst"]);
  });

  it("ignores ratings for perks of the other role", () => {
    const ratings: Record<string, Grade> = { Tinkerer: "A" };
    const stat = buildRoleStat("survivor", "Survivor", perks, ratings);
    expect(stat.ratedCount).toBe(0);
  });
});

describe("buildCommunityDist", () => {
  const community: CommunityGrade[] = [
    { perk_name: "Adrenaline", grade: "A", count: 3 },
    { perk_name: "Sprint Burst", grade: "B", count: 1 },
    { perk_name: "Tinkerer", grade: "A", count: 10 }, // killer — must be excluded
  ];

  it("aggregates only the role's perks, weighted by vote count", () => {
    const dist = buildCommunityDist(community, perks, "survivor");
    const a = dist.find((d) => d.grade === "A")!;
    const b = dist.find((d) => d.grade === "B")!;
    expect(a).toMatchObject({ count: 3, pct: 75 });
    expect(b).toMatchObject({ count: 1, pct: 25 });
  });

  it("returns all-zero shares when no votes match the role", () => {
    const dist = buildCommunityDist([], perks, "killer");
    expect(dist.every((d) => d.count === 0 && d.pct === 0)).toBe(true);
  });
});

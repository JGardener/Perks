import { describe, expect, it } from "vitest";
import type { CommunityGrade } from "../types/dbd";
import { buildConsensusMap } from "./communityConsensus";

const row = (perk_name: string, grade: CommunityGrade["grade"], count: number): CommunityGrade => ({
  perk_name,
  grade,
  count,
});

describe("buildConsensusMap", () => {
  it("returns an empty map for no input", () => {
    expect(buildConsensusMap([]).size).toBe(0);
  });

  it("returns the single grade when only one grade has votes", () => {
    const map = buildConsensusMap([row("Adrenaline", "B", 7)]);
    expect(map.get("Adrenaline")).toEqual({ grade: "B", votes: 7 });
  });

  it("computes the vote-weighted mean across grades", () => {
    // 3×A (0) + 1×F (5) → mean 5/4 = 1.25 → rounds to B (1)
    const map = buildConsensusMap([row("Dead Hard", "A", 3), row("Dead Hard", "F", 1)]);
    expect(map.get("Dead Hard")).toEqual({ grade: "B", votes: 4 });
  });

  it("rounds an exact tie toward the better grade", () => {
    // 1×A (0) + 1×B (1) → mean 0.5 → A, not B
    const map = buildConsensusMap([row("Sprint Burst", "A", 1), row("Sprint Burst", "B", 1)]);
    expect(map.get("Sprint Burst")!.grade).toBe("A");
  });

  it("tracks perks independently and sums total votes", () => {
    const map = buildConsensusMap([
      row("Lithe", "C", 2),
      row("Lithe", "D", 2),
      row("Botany Knowledge", "A", 10),
    ]);
    expect(map.get("Lithe")).toEqual({ grade: "C", votes: 4 });
    expect(map.get("Botany Knowledge")).toEqual({ grade: "A", votes: 10 });
  });

  it("ignores rows with zero or negative counts", () => {
    const map = buildConsensusMap([row("Bond", "A", 0)]);
    expect(map.has("Bond")).toBe(false);
  });
});

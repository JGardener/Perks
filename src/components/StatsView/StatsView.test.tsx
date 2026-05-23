import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CommunityGrade, Grade, Perk } from "../../types/dbd";
import { StatsView } from "./StatsView";

const makePerk = (name: string, role: "survivor" | "killer" = "survivor"): Perk => ({
  name,
  description: "",
  character: null,
  role,
  image: "",
  categories: null,
  tunables: null,
});

const makeGrade = (perk_name: string, count: number): CommunityGrade => ({
  perk_name,
  grade: "A",
  count,
});

const IRON_WILL = makePerk("Iron Will", "survivor");
const DEAD_HARD = makePerk("Dead Hard", "survivor");
const CORRUPT = makePerk("Corrupt Intervention", "killer");

const ratings: Record<string, Grade> = { "Iron Will": "A" };

describe("StatsView — community top picks", () => {
  it("does not render Community's Top Picks when no perk has any A-votes", () => {
    render(
      <StatsView
        perks={[IRON_WILL]}
        ratings={ratings}
        communityGrades={[{ perk_name: "Iron Will", grade: "B", count: 10 }]}
      />
    );

    expect(screen.queryByText(/community's top picks/i)).toBeNull();
  });

  it("does not render Community's Top Picks when communityGrades is empty", () => {
    render(
      <StatsView
        perks={[IRON_WILL]}
        ratings={ratings}
        communityGrades={[]}
      />
    );

    expect(screen.queryByText(/community's top picks/i)).toBeNull();
  });

  it("renders Community's Top Picks section when communityGrades has A-votes", () => {
    render(
      <StatsView
        perks={[IRON_WILL, DEAD_HARD, CORRUPT]}
        ratings={ratings}
        communityGrades={[makeGrade("Iron Will", 10), makeGrade("Corrupt Intervention", 5)]}
      />
    );

    expect(screen.queryAllByText(/community's top picks/i).length).toBeGreaterThan(0);
  });
});

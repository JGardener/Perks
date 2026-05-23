import type { CommunityGrade, Perk } from "../types/dbd";

export function getCommunityTopPerks(
  grades: CommunityGrade[],
  perks: Perk[],
  role: "survivor" | "killer",
): Perk[] {
  const aVotes = new Map<string, number>();
  for (const g of grades) {
    if (g.grade === "A" && g.count > 0) {
      aVotes.set(g.perk_name, (aVotes.get(g.perk_name) ?? 0) + g.count);
    }
  }

  const perkMap = new Map(perks.map((p) => [p.name, p]));

  return Array.from(aVotes.entries())
    .map(([name, count]) => ({ perk: perkMap.get(name), count }))
    .filter((e): e is { perk: Perk; count: number } => e.perk !== undefined && e.perk.role === role)
    .sort((a, b) => b.count - a.count)
    .map((e) => e.perk);
}

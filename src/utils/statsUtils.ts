import type { CommunityGrade, Grade, Perk } from "../types/dbd";
import { GRADE_ORDER } from "./gradeColors";

/** Grades A→F in tier order, derived from {@link GRADE_ORDER}. */
export const GRADES: Grade[] = (Object.entries(GRADE_ORDER) as [Grade, number][])
  .sort(([, a], [, b]) => a - b)
  .map(([g]) => g);

export interface GradeShare {
  grade: Grade;
  count: number;
  pct: number;
}

export interface RoleStat {
  role: "survivor" | "killer";
  label: string;
  totalPerks: number;
  ratedCount: number;
  distribution: GradeShare[];
  topPerks: Perk[];
}

/** A user's own grade distribution for one role: counts, percentages, and the A-rated perks. */
export function buildRoleStat(
  role: "survivor" | "killer",
  label: string,
  perks: Perk[],
  ratings: Record<string, Grade>,
): RoleStat {
  const rolePerks = perks.filter((p) => p.role === role);
  const totalPerks = rolePerks.length;
  const ratedPerks = rolePerks.filter((p) => ratings[p.name] !== undefined);
  const ratedCount = ratedPerks.length;

  const counts: Record<Grade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  for (const perk of ratedPerks) {
    counts[ratings[perk.name]]++;
  }

  const distribution = GRADES.map((grade) => ({
    grade,
    count: counts[grade],
    pct: ratedCount > 0 ? Math.round((counts[grade] / ratedCount) * 100) : 0,
  }));

  const topPerks = rolePerks
    .filter((p) => ratings[p.name] === "A")
    .sort((a, b) => a.name.localeCompare(b.name));

  return { role, label, totalPerks, ratedCount, distribution, topPerks };
}

/** Aggregate community grade distribution for one role, weighted by vote count. */
export function buildCommunityDist(
  communityGrades: CommunityGrade[],
  perks: Perk[],
  role: "survivor" | "killer",
): GradeShare[] {
  const roleNames = new Set(perks.filter((p) => p.role === role).map((p) => p.name));
  const counts: Record<Grade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  let totalVotes = 0;
  for (const cg of communityGrades) {
    if (roleNames.has(cg.perk_name)) {
      counts[cg.grade] += cg.count;
      totalVotes += cg.count;
    }
  }
  return GRADES.map((grade) => ({
    grade,
    count: counts[grade],
    pct: totalVotes > 0 ? Math.round((counts[grade] / totalVotes) * 100) : 0,
  }));
}

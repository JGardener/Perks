import type { CommunityGrade, Grade } from "../types/dbd";
import { GRADE_ORDER } from "./gradeColors";

export interface ConsensusGrade {
  grade: Grade;
  votes: number;
}

const ORDER_TO_GRADE: Grade[] = ["A", "B", "C", "D", "E", "F"];

// Collapses the community view rows (perk_name, grade, count) into one
// representative grade per perk: the vote-weighted mean of grade ranks,
// rounded to the nearest grade. Exact halfway rounds toward the BETTER
// grade — a perk sitting between tiers gets the benefit of the doubt.
export function buildConsensusMap(grades: CommunityGrade[]): Map<string, ConsensusGrade> {
  const acc = new Map<string, { sum: number; votes: number }>();

  for (const row of grades) {
    const rank = GRADE_ORDER[row.grade];
    if (rank === undefined || row.count <= 0) continue;
    const entry = acc.get(row.perk_name) ?? { sum: 0, votes: 0 };
    entry.sum += rank * row.count;
    entry.votes += row.count;
    acc.set(row.perk_name, entry);
  }

  const out = new Map<string, ConsensusGrade>();
  for (const [name, { sum, votes }] of acc) {
    const mean = sum / votes;
    const rank = Math.ceil(mean - 0.5);
    out.set(name, { grade: ORDER_TO_GRADE[rank], votes });
  }
  return out;
}

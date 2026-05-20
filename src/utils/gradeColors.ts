import type { Grade } from "../types/dbd";

export const GRADE_COLORS: Record<Grade, string> = {
  A: "#4ade80",
  B: "#60a5fa",
  C: "#e8973a",
  D: "#fb923c",
  E: "#f87171",
  F: "#8b1a1a",
};

export const GRADE_ORDER: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

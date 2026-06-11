import type { Grade } from "../types/dbd";

// Contrast-checked against --bw-bg (#0b0608) and --bw-surface (#15090c):
// every value holds ≥3:1 as a UI colour and ≥4.5:1 where used as text.
export const GRADE_COLORS: Record<Grade, string> = {
  A: "#4ade80",
  B: "#60a5fa",
  C: "#d9b13b", // de-ambered gold — "average", distinct from the red accent
  D: "#fb923c",
  E: "#f87171",
  F: "#d75550", // old #8b1a1a was ~2:1 on the new ground — fails WCAG
};

export const GRADE_ORDER: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

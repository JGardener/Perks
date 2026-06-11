import type { PerkCategory } from "../types/dbd";

// Hues are semantically motivated; values are tuned so each holds
// ≥3:1 against --bw-surface (#15090c) as a border/UI colour AND
// ≥4.5:1 under near-black text when used as an active pill fill.
export const CATEGORY_COLORS: Record<PerkCategory, string> = {
  adaptation: "#d4a017", // amber      — flexible, resourceful
  chasing: "#e05a20", // orange-red — hot pursuit
  concealment: "#6b7dd6", // indigo     — hiding in the shadows
  cruelty: "#d4566b", // blood rose — brutal, bloody
  enhancement: "#e8c030", // gold       — power-up, buff
  hinderance: "#d2691e", // burnt orange — impeding progress
  navigation: "#2a9d8f", // teal       — moving through the map
  obstruction: "#bd7048", // rust brown — blocking, barricading
  perception: "#4a8ed4", // blue       — sight, sound, information
  safeguard: "#3da554", // green      — protection, healing
  strategy: "#9a6cd0", // purple     — planning, tactics
  support: "#c8a020", // warm gold  — helping teammates
  trickery: "#bb5fcf", // violet     — deception, mind games
  tracking: "#c87020", // amber      — hunting, finding
};

export function getCategoryColor(
  categories: PerkCategory[] | null,
): string | undefined {
  if (categories)
    return categories?.length > 0 ? CATEGORY_COLORS[categories[0]] : undefined;
}

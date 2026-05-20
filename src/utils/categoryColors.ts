import type { PerkCategory } from "../types/dbd";

export const CATEGORY_COLORS: Record<PerkCategory, string> = {
  adaptation: "#d4a017", // amber      — flexible, resourceful
  chasing: "#e05a20", // orange-red — hot pursuit
  concealment: "#4a5ab5", // indigo     — hiding in the shadows
  cruelty: "#8b1a2a", // dark red   — brutal, bloody
  enhancement: "#e8c030", // gold       — power-up, buff
  hinderance: "#c85a18", // burnt orange — impeding progress
  navigation: "#2a9d8f", // teal       — moving through the map
  obstruction: "#8b4a2a", // rust brown — blocking, barricading
  perception: "#2a6eb5", // blue       — sight, sound, information
  safeguard: "#2a7a3a", // green      — protection, healing
  strategy: "#6a3a9a", // purple     — planning, tactics
  support: "#c8a020", // warm gold  — helping teammates
  trickery: "#8a2a9a", // violet     — deception, mind games
  tracking: "#c87020", // amber      — hunting, finding
};

export function getCategoryColor(
  categories: PerkCategory[] | null,
): string | undefined {
  if (categories)
    return categories?.length > 0 ? CATEGORY_COLORS[categories[0]] : undefined;
}

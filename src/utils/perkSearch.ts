import type { Perk } from "../types/dbd";
import { resolveDescription } from "./perkUtils";

// Shared perk keyword matcher: name, character name, and the resolved
// description with HTML stripped. Used by the BuildMaker picker and the
// Perks page search so both behave identically.
export function perkMatchesQuery(
  perk: Perk,
  query: string,
  characterMap: Record<number, string>,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (perk.name.toLowerCase().includes(q)) return true;
  const character = perk.character !== null ? (characterMap[perk.character] ?? "") : "";
  if (character.toLowerCase().includes(q)) return true;
  const description = resolveDescription(perk.description, perk.tunables)
    .replace(/<[^>]*>/g, " ")
    .toLowerCase();
  return description.includes(q);
}

export function filterPerks(
  perks: Perk[],
  query: string,
  characterMap: Record<number, string>,
): Perk[] {
  if (!query.trim()) return perks;
  return perks.filter((p) => perkMatchesQuery(p, query, characterMap));
}

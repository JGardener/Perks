import type { Character, Perk } from "../types/dbd";

const BASE_URL = "/api";

export async function getAllPerks(): Promise<Record<string, Perk>> {
  const res = await fetch(`${BASE_URL}/perks`);
  if (!res.ok) throw new Error(`getAllPerks failed: ${res.status}`);
  return res.json();
}

export async function getCharacters(): Promise<Record<string, Character>> {
  const res = await fetch(`${BASE_URL}/characters`);
  if (!res.ok) throw new Error(`getCharacters failed: ${res.status}`);
  return res.json();
}

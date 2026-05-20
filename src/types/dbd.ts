export type PerkCategory =
  | 'adaptation'
  | 'chasing'
  | 'concealment'
  | 'cruelty'
  | 'enhancement'
  | 'hinderance'
  | 'navigation'
  | 'obstruction'
  | 'perception'
  | 'safeguard'
  | 'strategy'
  | 'support'
  | 'trickery'
  | 'tracking';

export interface Perk {
  name: string;
  description: string;
  character: number | null;
  role: 'survivor' | 'killer';
  image: string;
  categories: PerkCategory[] | null;
  tunables: Record<string, number[]> | null;
}

export interface Character {
  id: string;
  name: string;
  role: string;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

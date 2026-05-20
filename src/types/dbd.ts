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

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Build {
  id: string;
  user_id: string;
  name: string;
  role: 'survivor' | 'killer';
  perks: (string | null)[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityGrade {
  perk_name: string;
  grade: Grade;
  count: number;
}

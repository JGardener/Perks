import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { Build, CommunityGrade, Grade, Perk } from "../types/dbd";
import { useAuth } from "../hooks/useAuth";
import { useBuilds } from "../hooks/useBuilds";
import { useCharacters } from "../hooks/useCharacters";
import { useCommunityGrades } from "../hooks/useCommunityGrades";
import { usePerks } from "../hooks/usePerks";
import { useRatings } from "../hooks/useRatings";

interface AppDataValue {
  perks: Perk[];
  survivorPerks: Perk[];
  killerPerks: Perk[];
  characterMap: Record<number, string>;
  dataLoading: boolean;
  dataError: string | null;
  retryAll: () => void;
  ratings: Record<string, Grade>;
  setRating: (perkName: string, grade: Grade | null) => void;
  builds: Build[];
  saveBuild: (name: string, role: "survivor" | "killer", perks: (string | null)[], isPublic?: boolean) => Promise<void>;
  deleteBuild: (id: string) => Promise<void>;
  communityGrades: CommunityGrade[];
  user: User | null;
  authLoading: boolean;
  signOut: () => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

// Single fetch point for app-wide data: perks/characters load once and
// every page reads them from here instead of refetching per navigation.
export function AppDataProvider({ children }: { children: ReactNode }) {
  const { perks, loading: perksLoading, error: perksError, retry: retryPerks } = usePerks();
  const { characterMap, loading: charsLoading, error: charsError, retry: retryChars } = useCharacters();
  const { user, loading: authLoading, signOut } = useAuth();
  const { ratings, setRating } = useRatings();
  const { builds, saveBuild, deleteBuild } = useBuilds(user?.id ?? null);
  const { grades: communityGrades } = useCommunityGrades(user?.id ?? null);

  const survivorPerks = useMemo(() => perks.filter((p) => p.role === "survivor"), [perks]);
  const killerPerks = useMemo(() => perks.filter((p) => p.role === "killer"), [perks]);

  const value: AppDataValue = {
    perks,
    survivorPerks,
    killerPerks,
    characterMap,
    dataLoading: perksLoading || charsLoading,
    dataError: perksError || charsError,
    retryAll: () => {
      retryPerks();
      retryChars();
    },
    ratings,
    setRating,
    builds,
    saveBuild: async (name, role, perkNames, isPublic) => {
      await saveBuild(name, role, perkNames, isPublic ?? false);
    },
    deleteBuild,
    communityGrades,
    user,
    authLoading,
    signOut,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

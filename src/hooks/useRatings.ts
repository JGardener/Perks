import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { Grade } from "../types/dbd";

const STORAGE_KEY = "perk-ratings";

function loadFromStorage(): Record<string, Grade> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export const useRatings = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, Grade>>({});

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load ratings whenever auth state changes
  useEffect(() => {
    if (!userId) {
      setRatings(loadFromStorage());
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("perk_name, grade")
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to load ratings:", error.message);
        return;
      }

      const remote: Record<string, Grade> = {};
      for (const row of data ?? []) {
        remote[row.perk_name] = row.grade as Grade;
      }

      // Migrate localStorage ratings if the account has none yet
      const local = loadFromStorage();
      if (Object.keys(remote).length === 0 && Object.keys(local).length > 0) {
        const rows = Object.entries(local).map(([perk_name, grade]) => ({
          user_id: userId,
          perk_name,
          grade,
        }));
        await supabase.from("ratings").upsert(rows);
        localStorage.removeItem(STORAGE_KEY);
        setRatings(local);
      } else {
        setRatings(remote);
      }
    };

    load();
  }, [userId]);

  const setRating = (perkName: string, grade: Grade | null) => {
    // Optimistic UI update
    setRatings((prev) => {
      const next = { ...prev };
      if (grade === null) delete next[perkName];
      else next[perkName] = grade;
      if (!userId) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    if (!userId) return;

    if (grade === null) {
      supabase
        .from("ratings")
        .delete()
        .eq("user_id", userId)
        .eq("perk_name", perkName)
        .then(({ error }) => {
          if (error) console.error("Failed to delete rating:", error.message);
        });
    } else {
      supabase
        .from("ratings")
        .upsert({ user_id: userId, perk_name: perkName, grade })
        .then(({ error }) => {
          if (error) console.error("Failed to save rating:", error.message);
        });
    }
  };

  return { ratings, setRating };
};

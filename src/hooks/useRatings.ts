import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { Grade } from "../types/dbd";
import { useToast } from "./useToast";

export const useRatings = () => {
  const { showToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, Grade>>({});

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

  useEffect(() => {
    if (!userId) {
      setRatings({});
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
      setRatings(remote);
    };

    load();
  }, [userId]);

  const setRating = (perkName: string, grade: Grade | null) => {
    if (!userId) return;

    const previous = ratings;

    setRatings((current) => {
      const next = { ...current };
      if (grade === null) delete next[perkName];
      else next[perkName] = grade;
      return next;
    });

    const handleError = () => {
      setRatings(previous);
      showToast("Failed to save rating");
    };

    if (grade === null) {
      supabase
        .from("ratings")
        .delete()
        .eq("user_id", userId)
        .eq("perk_name", perkName)
        .then(({ error }) => { if (error) handleError(); });
    } else {
      supabase
        .from("ratings")
        .upsert({ user_id: userId, perk_name: perkName, grade })
        .then(({ error }) => { if (error) handleError(); });
    }
  };

  return { ratings, setRating };
};

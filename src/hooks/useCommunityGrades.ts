import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { CommunityGrade } from "../types/dbd";

export const useCommunityGrades = (userId: string | null) => {
  const [grades, setGrades] = useState<CommunityGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setGrades([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from("perk_community_grades")
      .select("*")
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
        } else {
          setGrades((data ?? []) as CommunityGrade[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { grades, loading, error };
};

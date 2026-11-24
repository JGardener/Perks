import { useEffect, useEffectEvent, useState } from "react";
import { supabase } from "../services/supabase";
import type { CommunityGrade } from "../types/dbd";
import { useToast } from "./useToast";

export const useCommunityGrades = (userId: string | null) => {
  const { showToast } = useToast();
  const [grades, setGrades] = useState<CommunityGrade[]>([]);
  const [loading, setLoading] = useState(userId !== null);

  // Reset on user change / sign-out during render rather than in the effect.
  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setGrades([]);
    setLoading(userId !== null);
  }

  // Non-reactive side effect: showing a toast shouldn't re-trigger the fetch.
  const notifyUnavailable = useEffectEvent(() => {
    showToast("Community grades unavailable", "info");
  });

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    supabase
      .rpc("get_perk_community_grades")
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          notifyUnavailable();
        } else {
          setGrades((data ?? []) as CommunityGrade[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Load failures surface as a toast, not hook state (the view is
  // non-essential), so error is always null; kept for a uniform hook shape.
  return { grades, loading, error: null as string | null };
};

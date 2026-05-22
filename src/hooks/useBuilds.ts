import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { Build } from "../types/dbd";
import { useToast } from "./useToast";

export const useBuilds = (userId: string | null) => {
  const { showToast } = useToast();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBuilds([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from("builds")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
        } else {
          setBuilds((data ?? []) as Build[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveBuild = useCallback(
    async (
      name: string,
      role: "survivor" | "killer",
      perks: (string | null)[],
      isPublic = false,
    ): Promise<Build | null> => {
      if (!userId) return null;

      const { data: validateData, error: validateError } =
        await supabase.functions.invoke("validate-build", {
          body: { role, perks },
        });

      if (validateError || !(validateData as { valid: boolean })?.valid) {
        const messages = (validateData as { errors?: string[] })?.errors ?? [];
        setError(messages.join(", ") || "Invalid build");
        return null;
      }

      const { data, error: insertError } = await supabase
        .from("builds")
        .insert({ user_id: userId, name, role, perks, is_public: isPublic })
        .select()
        .single();

      if (insertError) {
        showToast("Failed to save build");
        return null;
      }

      const build = data as Build;
      setBuilds((prev) => [build, ...prev]);
      return build;
    },
    [userId],
  );

  const deleteBuild = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) return;

      const { error: deleteError } = await supabase
        .from("builds")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (deleteError) {
        showToast("Failed to delete build");
        return;
      }

      setBuilds((prev) => prev.filter((b) => b.id !== id));
    },
    [userId],
  );

  return { builds, loading, error, saveBuild, deleteBuild };
};

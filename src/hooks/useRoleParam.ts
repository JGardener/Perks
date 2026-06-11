import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export type Role = "survivor" | "killer";

// Role lives in ?role= so it survives navigation and stays shareable.
// Setter merges with existing params and replaces history (no spam).
export function useRoleParam(): [Role, (role: Role) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const role: Role = searchParams.get("role") === "killer" ? "killer" : "survivor";

  const setRole = useCallback(
    (next: Role) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set("role", next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return [role, setRole];
}

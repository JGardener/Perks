import type { Perk } from "../types/dbd";

export function encodeBuild(role: "survivor" | "killer", slots: (Perk | null)[]): string {
  const params = new URLSearchParams();
  params.set("role", role);
  slots.forEach((perk, i) => params.set(`p${i}`, perk?.name ?? ""));
  return params.toString();
}

export function decodeBuild(
  search: string,
  allPerks: Perk[],
): { role: "survivor" | "killer"; slots: (Perk | null)[] } | null {
  const params = new URLSearchParams(search);
  if (!params.has("role")) return null;

  const rawRole = params.get("role");
  const role: "survivor" | "killer" =
    rawRole === "killer" ? "killer" : "survivor";

  const byName = new Map(allPerks.map((p) => [p.name, p]));
  const slots: (Perk | null)[] = [0, 1, 2, 3].map((i) => {
    const name = params.get(`p${i}`);
    return name ? (byName.get(name) ?? null) : null;
  });

  return { role, slots };
}

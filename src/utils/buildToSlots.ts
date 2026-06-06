import type { Perk } from "../types/dbd";

/** Number of perk slots in a build. */
export const BUILD_SLOT_COUNT = 4;

/**
 * Reconstruct a build's `(Perk | null)[]` slots from a list of perk names.
 *
 * Single home for the name→Perk mapping shared by URL decoding, loading a
 * saved build, and rendering a saved-build icon strip. Always returns exactly
 * {@link BUILD_SLOT_COUNT} slots: missing, empty, or unknown names become `null`.
 */
export function buildToSlots(
  names: (string | null | undefined)[],
  perks: Perk[],
): (Perk | null)[] {
  const byName = new Map(perks.map((p) => [p.name, p]));
  return Array.from({ length: BUILD_SLOT_COUNT }, (_, i) => {
    const name = names[i] ?? null;
    return name ? (byName.get(name) ?? null) : null;
  });
}

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Perk } from "../types/dbd";
import { useConstraints } from "./useConstraints";

function makePerk(overrides: Partial<Perk> & { name: string }): Perk {
  return {
    description: "",
    character: null,
    role: "survivor",
    image: "",
    categories: null,
    tunables: null,
    ...overrides,
  };
}

const CHAR_MAP: Record<number, string> = { 1: "Dwight", 2: "Meg" };

const BASE_PERKS: Perk[] = [
  makePerk({ name: "Adrenaline",   character: null, categories: ["adaptation"] }),
  makePerk({ name: "Dead Hard",    character: 1,    categories: ["chasing"]    }),
  makePerk({ name: "Spine Chill",  character: null, categories: ["perception"] }),
  makePerk({ name: "Sprint Burst", character: 2,    categories: ["navigation"] }),
];

function renderConstraints(
  perks = BASE_PERKS,
  initialSlots: (Perk | null)[] = [null, null, null, null],
  role: "survivor" | "killer" = "survivor"
) {
  // Mutable ref so setSlots can update slots for the next render
  const ref = { slots: initialSlots };
  const setSlots = (s: (Perk | null)[]) => { ref.slots = s; };

  const hook = renderHook(() =>
    useConstraints(perks, ref.slots, setSlots, CHAR_MAP, role)
  );
  return { hook, ref };
}

afterEach(() => {
  localStorage.clear();
});

describe("useConstraints", () => {
  // ── Eligible pool ──────────────────────────────────────────────────────────

  describe("eligible pool", () => {
    it("with no filters all perks are eligible", () => {
      const { hook } = renderConstraints();
      const [, , derived] = hook.result.current;
      expect(derived.eligibleCount).toBe(4);
    });

    it("blacklist removes a named perk", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleBlacklist("Dead Hard");
      });
      const [, , derived] = hook.result.current;
      expect(derived.eligibleCount).toBe(3);
    });

    it("category include keeps only perks that match at least one included category", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleCategory("adaptation", "include");
      });
      // Only Adrenaline has 'adaptation'
      const [, , derived] = hook.result.current;
      expect(derived.eligibleCount).toBe(1);
    });

    it("category exclude removes perks whose only categories are all excluded", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleCategory("chasing", "exclude");
      });
      // Dead Hard has only 'chasing' — removed; others stay
      const [, , derived] = hook.result.current;
      expect(derived.eligibleCount).toBe(3);
    });

    it("character include keeps only perks with that character key", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleCharacter("1", "include"); // Dwight
      });
      // Dead Hard (character 1) only
      const [, , derived] = hook.result.current;
      expect(derived.eligibleCount).toBe(1);
    });

    it("base character include keeps only base perks (character: null)", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleCharacter("base", "include");
      });
      // Adrenaline + Spine Chill (both character: null)
      const [, , derived] = hook.result.current;
      expect(derived.eligibleCount).toBe(2);
    });

    it("character exclude removes perks with that character key", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleCharacter("2", "exclude"); // exclude Meg
      });
      // Sprint Burst (character 2) removed
      const [, , derived] = hook.result.current;
      expect(derived.eligibleCount).toBe(3);
    });

    it("a perk already pinned in a slot is excluded from the eligible pool", () => {
      const slots: (Perk | null)[] = [BASE_PERKS[0], null, null, null]; // Adrenaline pinned in slot 0
      const { hook } = renderConstraints(BASE_PERKS, slots);
      act(() => {
        const [, actions] = hook.result.current;
        actions.togglePin(0);
      });
      const [, , derived] = hook.result.current;
      // Adrenaline is pinned — excluded from pool; 3 remain
      expect(derived.eligibleCount).toBe(3);
    });
  });

  // ── Conflict detection ─────────────────────────────────────────────────────

  describe("conflict detection", () => {
    it("no conflicts when pool is large enough", () => {
      const { hook } = renderConstraints();
      const [, , derived] = hook.result.current;
      expect(derived.constraintError).toBeNull();
      expect(derived.canRandomise).toBe(true);
    });

    it("pin + blacklist produces a specific error and disables Randomise", () => {
      const slots: (Perk | null)[] = [BASE_PERKS[1], null, null, null]; // Dead Hard in slot 0
      const { hook } = renderConstraints(BASE_PERKS, slots);
      act(() => {
        const [, actions] = hook.result.current;
        actions.togglePin(0);
        actions.toggleBlacklist("Dead Hard");
      });
      const [, , derived] = hook.result.current;
      expect(derived.constraintError).toMatch(/Dead Hard/);
      expect(derived.constraintError).toMatch(/blacklisted/);
      expect(derived.canRandomise).toBe(false);
    });

    it("pin + excluded character produces a specific error", () => {
      const slots: (Perk | null)[] = [BASE_PERKS[1], null, null, null]; // Dead Hard (char 1)
      const { hook } = renderConstraints(BASE_PERKS, slots);
      act(() => {
        const [, actions] = hook.result.current;
        actions.togglePin(0);
        actions.toggleCharacter("1", "exclude");
      });
      const [, , derived] = hook.result.current;
      expect(derived.constraintError).toMatch(/Dead Hard/);
      expect(derived.constraintError).toMatch(/excluded/);
      expect(derived.canRandomise).toBe(false);
    });

    it("pin not covered by active include produces a specific error", () => {
      const slots: (Perk | null)[] = [BASE_PERKS[1], null, null, null]; // Dead Hard (char 1)
      const { hook } = renderConstraints(BASE_PERKS, slots);
      act(() => {
        const [, actions] = hook.result.current;
        actions.togglePin(0);
        // Include only Meg (char 2) — Dead Hard (char 1) is not covered
        actions.toggleCharacter("2", "include");
      });
      const [, , derived] = hook.result.current;
      expect(derived.constraintError).toMatch(/Dead Hard/);
      expect(derived.constraintError).toMatch(/not included/);
      expect(derived.canRandomise).toBe(false);
    });

    it("pool too small produces an error counting eligible vs required", () => {
      // 1 perk in pool, need 4 → error
      const singlePerk = [BASE_PERKS[0]];
      const { hook } = renderConstraints(singlePerk);
      const [, , derived] = hook.result.current;
      expect(derived.constraintError).toMatch(/eligible/);
      expect(derived.constraintError).toMatch(/need/);
      expect(derived.canRandomise).toBe(false);
    });
  });

  // ── randomise() ────────────────────────────────────────────────────────────

  describe("randomise()", () => {
    it("fills empty slots with perks from the eligible pool", () => {
      const { hook, ref } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.randomise();
      });
      // setSlots was called — ref.slots should now have perks
      expect(ref.slots.filter(Boolean).length).toBeGreaterThan(0);
    });

    it("only uses perks from the eligible pool", () => {
      const { hook, ref } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleBlacklist("Dead Hard");
      });
      act(() => {
        const [, actions] = hook.result.current;
        actions.randomise();
      });
      const names = ref.slots.filter(Boolean).map((p) => p!.name);
      expect(names).not.toContain("Dead Hard");
    });

    it("preserves pinned perks in their original slots", () => {
      const slots: (Perk | null)[] = [BASE_PERKS[0], null, null, null]; // Adrenaline in slot 0
      const { hook, ref } = renderConstraints(BASE_PERKS, slots);
      act(() => {
        const [, actions] = hook.result.current;
        actions.togglePin(0);
      });
      act(() => {
        const [, actions] = hook.result.current;
        actions.randomise();
      });
      expect(ref.slots[0]?.name).toBe("Adrenaline");
    });

    it("respects buildSize — only fills up to buildSize slots", () => {
      const { hook, ref } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.setBuildSize(2);
      });
      act(() => {
        const [, actions] = hook.result.current;
        actions.randomise();
      });
      const filled = ref.slots.filter(Boolean).length;
      expect(filled).toBe(2);
      // Slots beyond index 1 must be null
      expect(ref.slots[2]).toBeNull();
      expect(ref.slots[3]).toBeNull();
    });
  });

  // ── activeConstraintCount ──────────────────────────────────────────────────

  describe("activeConstraintCount", () => {
    it("is 0 when no constraints are set", () => {
      const { hook } = renderConstraints();
      const [, , derived] = hook.result.current;
      expect(derived.activeConstraintCount).toBe(0);
    });

    it("counts buildSize change as 1", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.setBuildSize(2);
      });
      const [, , derived] = hook.result.current;
      expect(derived.activeConstraintCount).toBe(1);
    });

    it("counts each blacklisted perk individually", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleBlacklist("Dead Hard");
        actions.toggleBlacklist("Adrenaline");
      });
      const [, , derived] = hook.result.current;
      expect(derived.activeConstraintCount).toBe(2);
    });

    it("counts each active category filter", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleCategory("chasing", "include");
        actions.toggleCategory("adaptation", "exclude");
      });
      const [, , derived] = hook.result.current;
      expect(derived.activeConstraintCount).toBe(2);
    });

    it("returning a filter to neutral decrements the count", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.toggleCategory("chasing", "include");
      });
      act(() => {
        const [, actions] = hook.result.current;
        // Clicking the active Include button returns it to neutral
        actions.toggleCategory("chasing", "include");
      });
      const [, , derived] = hook.result.current;
      expect(derived.activeConstraintCount).toBe(0);
    });
  });

  // ── localStorage persistence ───────────────────────────────────────────────

  describe("localStorage persistence", () => {
    it("persists constraints and restores them on remount", () => {
      const { hook } = renderConstraints();
      act(() => {
        const [, actions] = hook.result.current;
        actions.setBuildSize(2);
        actions.toggleBlacklist("Dead Hard");
        actions.toggleCategory("chasing", "include");
        actions.toggleCharacter("base", "exclude");
      });

      // Remount a fresh hook — it should restore from localStorage
      const { hook: hook2 } = renderConstraints();
      const [state2] = hook2.result.current;

      expect(state2.buildSize).toBe(2);
      expect(state2.blacklist.has("Dead Hard")).toBe(true);
      expect(state2.categoryFilters["chasing"]).toBe("include");
      expect(state2.characterFilters["base"]).toBe("exclude");
    });

    it("survivor and killer constraints are stored independently", () => {
      const { hook: survivorHook } = renderConstraints(BASE_PERKS, [null, null, null, null], "survivor");
      act(() => {
        const [, actions] = survivorHook.result.current;
        actions.setBuildSize(2);
      });

      const { hook: killerHook } = renderConstraints(BASE_PERKS, [null, null, null, null], "killer");
      const [killerState] = killerHook.result.current;
      expect(killerState.buildSize).toBe(4); // killer is unaffected
    });

    it("stale blacklisted perk name is silently ignored on load", () => {
      // Pre-populate localStorage with a perk name that no longer exists in the game
      localStorage.setItem(
        "constraints_survivor",
        JSON.stringify({ blacklist: ["OldRemovedPerk"], buildSize: 4, categoryFilters: {}, characterFilters: {} })
      );

      const { hook } = renderConstraints();
      const [state, , derived] = hook.result.current;

      expect(state.blacklist.has("OldRemovedPerk")).toBe(false);
      expect(derived.constraintError).toBeNull();
    });
  });
});

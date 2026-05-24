import { useMemo, useState, useEffect } from "react";
import type { Perk } from "../types/dbd";

export type FilterState = "include" | "exclude" | "neutral";

export interface ConstraintsState {
  pinnedSlots: Set<number>;
  blacklist: Set<string>;
  buildSize: number;
  categoryFilters: Record<string, FilterState>;
  characterFilters: Record<string, FilterState>;
}

export interface ConstraintsActions {
  togglePin: (idx: number) => void;
  toggleBlacklist: (name: string) => void;
  setBuildSize: (n: number) => void;
  toggleCategory: (cat: string, value?: FilterState) => void;
  toggleCharacter: (charKey: string, value?: FilterState) => void;
  resetConstraints: () => void;
  randomise: () => void;
}

export interface ConstraintsDerived {
  eligibleCount: number;
  activeConstraintCount: number;
  constraintError: string | null;
  canRandomise: boolean;
  availableCategories: string[];
  availableCharacterKeys: string[];
  getCharacterLabel: (key: string) => string;
  pinnedCount: number;
}

function storageKey(role: string) {
  return `constraints_${role}`;
}

function loadFromStorage(role: string): Partial<{
  blacklist: string[];
  buildSize: number;
  categoryFilters: Record<string, FilterState>;
  characterFilters: Record<string, FilterState>;
}> {
  try {
    const raw = localStorage.getItem(storageKey(role));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorage(role: string, state: {
  blacklist: Set<string>;
  buildSize: number;
  categoryFilters: Record<string, FilterState>;
  characterFilters: Record<string, FilterState>;
}) {
  try {
    localStorage.setItem(storageKey(role), JSON.stringify({
      blacklist: [...state.blacklist],
      buildSize: state.buildSize,
      categoryFilters: state.categoryFilters,
      characterFilters: state.characterFilters,
    }));
  } catch {
    // storage unavailable — silently ignore
  }
}

export function useConstraints(
  perks: Perk[],
  slots: (Perk | null)[],
  setSlots: (s: (Perk | null)[]) => void,
  characterMap: Record<number, string>,
  role: "survivor" | "killer"
): [ConstraintsState, ConstraintsActions, ConstraintsDerived] {
  const [initialized, setInitialized] = useState(false);
  const [pinnedSlots, setPinnedSlots] = useState<Set<number>>(new Set());
  const [blacklist, setBlacklist] = useState<Set<string>>(new Set());
  const [buildSize, setBuildSizeState] = useState(4);
  const [categoryFilters, setCategoryFilters] = useState<Record<string, FilterState>>({});
  const [characterFilters, setCharacterFilters] = useState<Record<string, FilterState>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage(role);
    if (saved.buildSize !== undefined) setBuildSizeState(saved.buildSize);
    if (saved.categoryFilters) setCategoryFilters(saved.categoryFilters);
    if (saved.characterFilters) setCharacterFilters(saved.characterFilters);
    if (saved.blacklist) {
      const perkNames = new Set(perks.map((p) => p.name));
      setBlacklist(new Set(saved.blacklist.filter((n) => perkNames.has(n))));
    }
    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Save to localStorage on every state change (after initialization)
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(role, { blacklist, buildSize, categoryFilters, characterFilters });
  }, [role, initialized, blacklist, buildSize, categoryFilters, characterFilters]);

  const cycle = (s: FilterState): FilterState =>
    s === "neutral" ? "include" : s === "include" ? "exclude" : "neutral";

  const togglePin = (idx: number) => {
    if (!slots[idx]) return;
    setPinnedSlots((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleBlacklist = (name: string) => {
    setBlacklist((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const setBuildSize = (n: number) => setBuildSizeState(n);

  const toggleCategory = (cat: string, value?: FilterState) =>
    setCategoryFilters((prev) => {
      const current = prev[cat] ?? "neutral";
      const next = value !== undefined
        ? (current === value ? "neutral" : value)
        : cycle(current);
      return { ...prev, [cat]: next };
    });

  const toggleCharacter = (key: string, value?: FilterState) =>
    setCharacterFilters((prev) => {
      const current = prev[key] ?? "neutral";
      const next = value !== undefined
        ? (current === value ? "neutral" : value)
        : cycle(current);
      return { ...prev, [key]: next };
    });

  const resetConstraints = () => {
    setPinnedSlots(new Set());
    setBlacklist(new Set());
    setBuildSizeState(4);
    setCategoryFilters({});
    setCharacterFilters({});
  };

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    perks.forEach((p) => p.categories?.forEach((c) => cats.add(c)));
    return [...cats].sort();
  }, [perks]);

  const availableCharacterKeys = useMemo(() => {
    const ids = new Set<number>();
    perks.forEach((p) => { if (p.character !== null) ids.add(p.character); });
    const sorted = [...ids].sort((a, b) =>
      (characterMap[a] ?? "").localeCompare(characterMap[b] ?? "")
    );
    return ["base", ...sorted.map(String)];
  }, [perks, characterMap]);

  const getCharacterLabel = (key: string) =>
    key === "base" ? "Base Perks" : (characterMap[Number(key)] ?? "Unknown");

  const pinnedCount = useMemo(
    () => [...pinnedSlots].filter((i) => i < 4 && slots[i] !== null).length,
    [pinnedSlots, slots]
  );

  const requiredFromPool = Math.max(0, buildSize - pinnedCount);

  const eligiblePool = useMemo(() => {
    let pool = perks.filter((p) => !blacklist.has(p.name));

    const incCats = Object.entries(categoryFilters).filter(([, v]) => v === "include").map(([k]) => k);
    const excCats = Object.entries(categoryFilters).filter(([, v]) => v === "exclude").map(([k]) => k);
    if (incCats.length) pool = pool.filter((p) => p.categories?.some((c) => incCats.includes(c)) ?? false);
    if (excCats.length) pool = pool.filter((p) => !(p.categories?.every((c) => excCats.includes(c)) ?? false));

    const incChars = Object.entries(characterFilters).filter(([, v]) => v === "include").map(([k]) => k);
    const excChars = Object.entries(characterFilters).filter(([, v]) => v === "exclude").map(([k]) => k);
    const charKey = (p: Perk) => (p.character === null ? "base" : String(p.character));
    if (incChars.length) pool = pool.filter((p) => incChars.includes(charKey(p)));
    if (excChars.length) pool = pool.filter((p) => !excChars.includes(charKey(p)));

    const pinnedNames = new Set(
      [...pinnedSlots].map((i) => slots[i]?.name).filter(Boolean) as string[]
    );
    return pool.filter((p) => !pinnedNames.has(p.name));
  }, [perks, blacklist, categoryFilters, characterFilters, pinnedSlots, slots]);

  const eligibleCount = eligiblePool.length;

  const constraintError = useMemo((): string | null => {
    const incCats = Object.entries(categoryFilters).filter(([, v]) => v === "include").map(([k]) => k);
    const excCats = Object.entries(categoryFilters).filter(([, v]) => v === "exclude").map(([k]) => k);
    const incChars = Object.entries(characterFilters).filter(([, v]) => v === "include").map(([k]) => k);
    const excChars = Object.entries(characterFilters).filter(([, v]) => v === "exclude").map(([k]) => k);
    const charKey = (p: Perk) => (p.character === null ? "base" : String(p.character));

    for (const idx of pinnedSlots) {
      const perk = slots[idx];
      if (!perk) continue;
      if (blacklist.has(perk.name)) return `"${perk.name}" is pinned but blacklisted`;
      const ck = charKey(perk);
      if (excChars.includes(ck)) return `"${perk.name}" is pinned but its character is excluded`;
      if (incChars.length && !incChars.includes(ck)) return `"${perk.name}" is pinned but its character is not included`;
      if (incCats.length && !perk.categories?.some((c) => incCats.includes(c))) return `"${perk.name}" is pinned but no matching category`;
      if (excCats.length && perk.categories?.every((c) => excCats.includes(c))) return `"${perk.name}" is pinned but all categories excluded`;
    }

    if (requiredFromPool > 0 && eligibleCount < requiredFromPool)
      return `${eligibleCount} perk${eligibleCount !== 1 ? "s" : ""} eligible, need ${requiredFromPool}`;

    return null;
  }, [pinnedSlots, slots, blacklist, categoryFilters, characterFilters, eligibleCount, requiredFromPool]);

  const canRandomise =
    constraintError === null && (requiredFromPool > 0 || pinnedCount > 0);

  const activeConstraintCount = useMemo(() => {
    let n = buildSize !== 4 ? 1 : 0;
    n += blacklist.size;
    n += Object.values(categoryFilters).filter((v) => v !== "neutral").length;
    n += Object.values(characterFilters).filter((v) => v !== "neutral").length;
    return n;
  }, [buildSize, blacklist, categoryFilters, characterFilters]);

  const randomise = () => {
    if (!canRandomise) return;
    const shuffled = [...eligiblePool].sort(() => Math.random() - 0.5);
    const newSlots: (Perk | null)[] = [null, null, null, null];
    for (const idx of pinnedSlots) {
      if (idx < 4 && slots[idx]) newSlots[idx] = slots[idx];
    }
    let filled = 0;
    for (const perk of shuffled) {
      if (filled >= requiredFromPool) break;
      const emptyIdx = newSlots.findIndex((s, i) => s === null && i < buildSize);
      if (emptyIdx === -1) break;
      newSlots[emptyIdx] = perk;
      filled++;
    }
    setSlots(newSlots);
  };

  return [
    { pinnedSlots, blacklist, buildSize, categoryFilters, characterFilters },
    { togglePin, toggleBlacklist, setBuildSize, toggleCategory, toggleCharacter, resetConstraints, randomise },
    { eligibleCount, activeConstraintCount, constraintError, canRandomise, availableCategories, availableCharacterKeys, getCharacterLabel, pinnedCount },
  ];
}

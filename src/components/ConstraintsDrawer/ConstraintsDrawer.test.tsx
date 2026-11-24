import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ConstraintsActions, ConstraintsDerived, ConstraintsState } from "../../hooks/useConstraints";
import { ConstraintsDrawer } from "./ConstraintsDrawer";

function makeState(overrides: Partial<ConstraintsState> = {}): ConstraintsState {
  return {
    pinnedSlots: new Set(),
    blacklist: new Set(),
    buildSize: 4,
    categoryFilters: {},
    characterFilters: {},
    ...overrides,
  };
}

function makeActions(overrides: Partial<ConstraintsActions> = {}): ConstraintsActions {
  return {
    togglePin: vi.fn(),
    toggleBlacklist: vi.fn(),
    setBuildSize: vi.fn(),
    toggleCategory: vi.fn(),
    toggleCharacter: vi.fn(),
    resetConstraints: vi.fn(),
    randomise: vi.fn(),
    ...overrides,
  };
}

function makeDerived(overrides: Partial<ConstraintsDerived> = {}): ConstraintsDerived {
  return {
    eligibleCount: 10,
    activeConstraintCount: 0,
    constraintError: null,
    canRandomise: true,
    availableCategories: [],
    availableCharacterKeys: [],
    getCharacterLabel: (k) => k,
    pinnedCount: 0,
    ...overrides,
  };
}

function renderDrawer(
  stateOverrides: Partial<ConstraintsState> = {},
  actionsOverrides: Partial<ConstraintsActions> = {},
  derivedOverrides: Partial<ConstraintsDerived> = {},
) {
  return render(
    <ConstraintsDrawer
      state={makeState(stateOverrides)}
      actions={makeActions(actionsOverrides)}
      derived={makeDerived(derivedOverrides)}
    />
  );
}

function openDrawer() {
  fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
}

describe("ConstraintsDrawer", () => {
  it("toggle button is always visible with text 'Constraints'", () => {
    renderDrawer();
    expect(screen.getByRole("button", { name: /constraints/i })).not.toBeNull();
  });

  it("drawer starts closed — Build Size pills are not rendered", () => {
    renderDrawer();
    expect(screen.queryByRole("button", { name: "1" })).toBeNull();
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
    expect(screen.queryByRole("button", { name: "3" })).toBeNull();
    expect(screen.queryByRole("button", { name: "4" })).toBeNull();
  });

  it("clicking the toggle opens the drawer (Build Size section appears)", () => {
    renderDrawer();
    openDrawer();
    expect(screen.getByRole("button", { name: "1" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "2" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "3" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "4" })).not.toBeNull();
  });

  it("clicking toggle again closes the drawer", () => {
    renderDrawer();
    const toggle = screen.getByRole("button", { name: /constraints/i });
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(screen.queryByRole("button", { name: "1" })).toBeNull();
  });

  it("the active build size pill has aria-pressed='true'", () => {
    renderDrawer({ buildSize: 3 });
    openDrawer();
    expect(screen.getByRole("button", { name: "3" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "1" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("clicking an inactive pill calls actions.setBuildSize with that value", () => {
    const setBuildSize = vi.fn();
    renderDrawer({}, { setBuildSize });
    openDrawer();
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(setBuildSize).toHaveBeenCalledWith(2);
  });

  it("active constraint count badge renders when activeConstraintCount > 0", () => {
    renderDrawer({}, {}, { activeConstraintCount: 3 });
    const toggle = screen.getByRole("button", { name: /constraints/i });
    expect(toggle.textContent).toContain("3");
  });

  it("no badge when activeConstraintCount is 0", () => {
    renderDrawer({}, {}, { activeConstraintCount: 0 });
    expect(screen.queryByText("0")).toBeNull();
  });

  it("pills with value below pinnedCount are disabled", () => {
    renderDrawer({ buildSize: 3 }, {}, { pinnedCount: 2 });
    openDrawer();
    expect((screen.getByRole("button", { name: "1" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "2" }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: "3" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("pills with value equal to or above pinnedCount are enabled", () => {
    renderDrawer({ buildSize: 4 }, {}, { pinnedCount: 2 });
    openDrawer();
    expect((screen.getByRole("button", { name: "2" }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: "3" }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: "4" }) as HTMLButtonElement).disabled).toBe(false);
  });
});

describe("Pool status line", () => {
  it("shows the live eligible-perk count", () => {
    renderDrawer({}, {}, { eligibleCount: 23 });
    openDrawer();
    expect(screen.getByText(/23 perks eligible for randomising/i)).not.toBeNull();
  });

  it("uses singular phrasing for one eligible perk", () => {
    renderDrawer({}, {}, { eligibleCount: 1 });
    openDrawer();
    expect(screen.getByText(/1 perk eligible for randomising/i)).not.toBeNull();
  });

  it("shows the constraint error instead of the count when present", () => {
    renderDrawer({}, {}, { constraintError: "2 perks eligible, need 4" });
    openDrawer();
    expect(screen.getByText("2 perks eligible, need 4")).not.toBeNull();
    expect(screen.queryByText(/eligible for randomising/i)).toBeNull();
  });
});

describe("Category filters", () => {
  const categories = { availableCategories: ["chasing", "adaptation"] };

  it("renders the three mode radios with full-sentence category labels", () => {
    renderDrawer({}, {}, categories);
    openDrawer();
    expect(screen.getByRole("radio", { name: /pick from all categories/i })).not.toBeNull();
    expect(screen.getByRole("radio", { name: /only use selected categories/i })).not.toBeNull();
    expect(screen.getByRole("radio", { name: /avoid selected categories/i })).not.toBeNull();
  });

  it("defaults to 'Pick from all' with the checkboxes disabled", () => {
    renderDrawer({}, {}, categories);
    openDrawer();
    expect((screen.getByRole("radio", { name: /pick from all categories/i }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "chasing" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("checkbox", { name: "adaptation" }) as HTMLInputElement).disabled).toBe(true);
  });

  it("selecting 'Only use selected' enables the checkboxes", () => {
    renderDrawer({}, {}, categories);
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /only use selected categories/i }));
    expect((screen.getByRole("checkbox", { name: "chasing" }) as HTMLInputElement).disabled).toBe(false);
  });

  it("ticking a checkbox in 'only' mode calls toggleCategory with 'include'", () => {
    const toggleCategory = vi.fn();
    renderDrawer({}, { toggleCategory }, categories);
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /only use selected categories/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: "chasing" }));
    expect(toggleCategory).toHaveBeenCalledWith("chasing", "include");
  });

  it("ticking a checkbox in 'avoid' mode calls toggleCategory with 'exclude'", () => {
    const toggleCategory = vi.fn();
    renderDrawer({}, { toggleCategory }, categories);
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /avoid selected categories/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: "chasing" }));
    expect(toggleCategory).toHaveBeenCalledWith("chasing", "exclude");
  });

  it("an existing include filter derives the 'only' mode and ticks the box", () => {
    renderDrawer({ categoryFilters: { chasing: "include" } }, {}, categories);
    openDrawer();
    expect((screen.getByRole("radio", { name: /only use selected categories/i }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "chasing" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "adaptation" }) as HTMLInputElement).checked).toBe(false);
  });

  it("an existing exclude filter derives the 'avoid' mode and ticks the box", () => {
    renderDrawer({ categoryFilters: { chasing: "exclude" } }, {}, categories);
    openDrawer();
    expect((screen.getByRole("radio", { name: /avoid selected categories/i }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "chasing" }) as HTMLInputElement).checked).toBe(true);
  });

  it("switching from 'only' to 'avoid' converts every selection to exclude", () => {
    const toggleCategory = vi.fn();
    renderDrawer(
      { categoryFilters: { chasing: "include", adaptation: "include" } },
      { toggleCategory },
      categories,
    );
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /avoid selected categories/i }));
    expect(toggleCategory).toHaveBeenCalledWith("chasing", "exclude");
    expect(toggleCategory).toHaveBeenCalledWith("adaptation", "exclude");
  });

  it("switching back to 'Pick from all' clears every active filter", () => {
    const toggleCategory = vi.fn();
    renderDrawer(
      { categoryFilters: { chasing: "include" } },
      { toggleCategory },
      categories,
    );
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /pick from all categories/i }));
    // Toggling with the current value resets the filter to neutral.
    expect(toggleCategory).toHaveBeenCalledWith("chasing", "include");
  });

  it("status line spells out an 'only' selection", () => {
    renderDrawer({ categoryFilters: { chasing: "include" } }, {}, categories);
    openDrawer();
    expect(screen.getByText(/only using: chasing/i)).not.toBeNull();
  });

  it("status line spells out an 'avoid' selection", () => {
    renderDrawer({ categoryFilters: { adaptation: "exclude" } }, {}, categories);
    openDrawer();
    expect(screen.getByText(/avoiding: adaptation/i)).not.toBeNull();
  });

  it("status line explains that an empty selection still means all categories", () => {
    renderDrawer({}, {}, categories);
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /only use selected categories/i }));
    expect(screen.getByText(/nothing ticked — still picking from all categories/i)).not.toBeNull();
  });
});

describe("Reset", () => {
  it("Reset button appears when activeConstraintCount > 0", () => {
    renderDrawer({}, {}, { activeConstraintCount: 2 });
    expect(screen.getByRole("button", { name: /reset/i })).not.toBeNull();
  });

  it("Reset button is not shown when activeConstraintCount is 0", () => {
    renderDrawer({}, {}, { activeConstraintCount: 0 });
    expect(screen.queryByRole("button", { name: /reset/i })).toBeNull();
  });

  it("clicking Reset calls actions.resetConstraints", () => {
    const resetConstraints = vi.fn();
    renderDrawer({}, { resetConstraints }, { activeConstraintCount: 1 });
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(resetConstraints).toHaveBeenCalledOnce();
  });

  it("Reset snaps the mode radios back to 'Pick from all'", () => {
    renderDrawer({}, {}, { activeConstraintCount: 1, availableCategories: ["chasing"] });
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /only use selected categories/i }));
    expect((screen.getByRole("checkbox", { name: "chasing" }) as HTMLInputElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect((screen.getByRole("radio", { name: /pick from all categories/i }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "chasing" }) as HTMLInputElement).disabled).toBe(true);
  });
});

describe("Blacklist / Banned Perks", () => {
  it("renders a chip for each blacklisted perk name when drawer is open", () => {
    renderDrawer({ blacklist: new Set(["Dead Hard", "Adrenaline"]) });
    openDrawer();
    expect(screen.getByText("Dead Hard")).not.toBeNull();
    expect(screen.getByText("Adrenaline")).not.toBeNull();
  });

  it("clicking the remove button on a chip calls toggleBlacklist with that perk name", () => {
    const toggleBlacklist = vi.fn();
    renderDrawer({ blacklist: new Set(["Dead Hard"]) }, { toggleBlacklist });
    openDrawer();
    fireEvent.click(screen.getByRole("button", { name: /remove dead hard from blacklist/i }));
    expect(toggleBlacklist).toHaveBeenCalledWith("Dead Hard");
  });

  it("no chips rendered when blacklist is empty", () => {
    renderDrawer({ blacklist: new Set() });
    openDrawer();
    expect(screen.queryByText("Banned Perks")).toBeNull();
  });
});

describe("Character filters", () => {
  const characters = {
    availableCharacterKeys: ["base", "1"],
    getCharacterLabel: (k: string) => (k === "base" ? "Base Perks" : "Dwight"),
  };

  it("renders the three mode radios with full-sentence character labels", () => {
    renderDrawer({}, {}, characters);
    openDrawer();
    expect(screen.getByRole("radio", { name: /pick from all characters/i })).not.toBeNull();
    expect(screen.getByRole("radio", { name: /only use selected characters/i })).not.toBeNull();
    expect(screen.getByRole("radio", { name: /avoid selected characters/i })).not.toBeNull();
  });

  it("renders a labelled checkbox per character", () => {
    renderDrawer({}, {}, characters);
    openDrawer();
    expect(screen.getByRole("checkbox", { name: "Base Perks" })).not.toBeNull();
    expect(screen.getByRole("checkbox", { name: "Dwight" })).not.toBeNull();
  });

  it("ticking a character in 'only' mode calls toggleCharacter with 'include'", () => {
    const toggleCharacter = vi.fn();
    renderDrawer({}, { toggleCharacter }, characters);
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /only use selected characters/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Dwight" }));
    expect(toggleCharacter).toHaveBeenCalledWith("1", "include");
  });

  it("ticking a character in 'avoid' mode calls toggleCharacter with 'exclude'", () => {
    const toggleCharacter = vi.fn();
    renderDrawer({}, { toggleCharacter }, characters);
    openDrawer();
    fireEvent.click(screen.getByRole("radio", { name: /avoid selected characters/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Dwight" }));
    expect(toggleCharacter).toHaveBeenCalledWith("1", "exclude");
  });

  it("an existing include filter derives the 'only' mode and names the character in the status line", () => {
    renderDrawer({ characterFilters: { "1": "include" } }, {}, characters);
    openDrawer();
    expect((screen.getByRole("radio", { name: /only use selected characters/i }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Dwight" }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/only using: dwight/i)).not.toBeNull();
  });

  it("an existing exclude filter derives the 'avoid' mode and names the character in the status line", () => {
    renderDrawer({ characterFilters: { "1": "exclude" } }, {}, characters);
    openDrawer();
    expect((screen.getByRole("radio", { name: /avoid selected characters/i }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/avoiding: dwight/i)).not.toBeNull();
  });

  it("category and character sections have independent modes", () => {
    renderDrawer(
      { characterFilters: { "1": "include" } },
      {},
      { ...characters, availableCategories: ["chasing"] },
    );
    openDrawer();
    expect((screen.getByRole("radio", { name: /only use selected characters/i }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("radio", { name: /pick from all categories/i }) as HTMLInputElement).checked).toBe(true);
  });
});

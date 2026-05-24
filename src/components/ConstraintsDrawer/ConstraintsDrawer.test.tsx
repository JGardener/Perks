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
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
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
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByRole("button", { name: "3" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "1" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("clicking an inactive pill calls actions.setBuildSize with that value", () => {
    const setBuildSize = vi.fn();
    renderDrawer({}, { setBuildSize });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(setBuildSize).toHaveBeenCalledWith(2);
  });

  it("active constraint count badge renders when activeConstraintCount > 0", () => {
    renderDrawer({}, {}, { activeConstraintCount: 3 });
    expect(screen.getByText("3")).not.toBeNull();
  });

  it("no badge when activeConstraintCount is 0", () => {
    renderDrawer({}, {}, { activeConstraintCount: 0 });
    expect(screen.queryByText("0")).toBeNull();
  });

  it("pills with value below pinnedCount are disabled", () => {
    renderDrawer({ buildSize: 3 }, {}, { pinnedCount: 2 });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect((screen.getByRole("button", { name: "1" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "2" }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: "3" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("pills with value equal to or above pinnedCount are enabled", () => {
    renderDrawer({ buildSize: 4 }, {}, { pinnedCount: 2 });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect((screen.getByRole("button", { name: "2" }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: "3" }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: "4" }) as HTMLButtonElement).disabled).toBe(false);
  });
});

describe("Category filters", () => {
  it("renders Include and Exclude buttons for each available category when drawer is open", () => {
    renderDrawer({}, {}, { availableCategories: ["chasing", "adaptation"] });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByRole("button", { name: /include chasing/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /exclude chasing/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /include adaptation/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /exclude adaptation/i })).not.toBeNull();
  });

  it("clicking Include calls toggleCategory with the category and 'include'", () => {
    const toggleCategory = vi.fn();
    renderDrawer({}, { toggleCategory }, { availableCategories: ["chasing"] });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    fireEvent.click(screen.getByRole("button", { name: /include chasing/i }));
    expect(toggleCategory).toHaveBeenCalledWith("chasing", "include");
  });

  it("clicking Exclude calls toggleCategory with the category and 'exclude'", () => {
    const toggleCategory = vi.fn();
    renderDrawer({}, { toggleCategory }, { availableCategories: ["chasing"] });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    fireEvent.click(screen.getByRole("button", { name: /exclude chasing/i }));
    expect(toggleCategory).toHaveBeenCalledWith("chasing", "exclude");
  });

  it("Include button has aria-pressed='true' when filter is 'include', 'false' otherwise", () => {
    renderDrawer(
      { categoryFilters: { chasing: "include" } },
      {},
      { availableCategories: ["chasing"] },
    );
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByRole("button", { name: /include chasing/i }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /exclude chasing/i }).getAttribute("aria-pressed")).toBe("false");
  });

  it("Exclude button has aria-pressed='true' when filter is 'exclude', 'false' otherwise", () => {
    renderDrawer(
      { categoryFilters: { chasing: "exclude" } },
      {},
      { availableCategories: ["chasing"] },
    );
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByRole("button", { name: /exclude chasing/i }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /include chasing/i }).getAttribute("aria-pressed")).toBe("false");
  });
});

describe("Blacklist / Banned Perks", () => {
  it("renders a chip for each blacklisted perk name when drawer is open", () => {
    renderDrawer({ blacklist: new Set(["Dead Hard", "Adrenaline"]) });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByText("Dead Hard")).not.toBeNull();
    expect(screen.getByText("Adrenaline")).not.toBeNull();
  });

  it("clicking the remove button on a chip calls toggleBlacklist with that perk name", () => {
    const toggleBlacklist = vi.fn();
    renderDrawer({ blacklist: new Set(["Dead Hard"]) }, { toggleBlacklist });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove dead hard from blacklist/i }));
    expect(toggleBlacklist).toHaveBeenCalledWith("Dead Hard");
  });

  it("no chips rendered when blacklist is empty", () => {
    renderDrawer({ blacklist: new Set() });
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.queryByText("Banned Perks")).toBeNull();
  });
});

describe("Character filters", () => {
  it("renders Include and Exclude buttons for each available character key when drawer is open", () => {
    renderDrawer(
      {},
      {},
      { availableCharacterKeys: ["base", "1"], getCharacterLabel: (k) => k === "base" ? "Base Perks" : "Dwight" },
    );
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByRole("button", { name: /include base perks/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /exclude base perks/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /include dwight/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /exclude dwight/i })).not.toBeNull();
  });

  it("clicking Include calls toggleCharacter with the key and 'include'", () => {
    const toggleCharacter = vi.fn();
    renderDrawer(
      {},
      { toggleCharacter },
      { availableCharacterKeys: ["1"], getCharacterLabel: () => "Dwight" },
    );
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    fireEvent.click(screen.getByRole("button", { name: /include dwight/i }));
    expect(toggleCharacter).toHaveBeenCalledWith("1", "include");
  });

  it("clicking Exclude calls toggleCharacter with the key and 'exclude'", () => {
    const toggleCharacter = vi.fn();
    renderDrawer(
      {},
      { toggleCharacter },
      { availableCharacterKeys: ["1"], getCharacterLabel: () => "Dwight" },
    );
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    fireEvent.click(screen.getByRole("button", { name: /exclude dwight/i }));
    expect(toggleCharacter).toHaveBeenCalledWith("1", "exclude");
  });

  it("Include button has aria-pressed='true' when character filter is 'include'", () => {
    renderDrawer(
      { characterFilters: { "1": "include" } },
      {},
      { availableCharacterKeys: ["1"], getCharacterLabel: () => "Dwight" },
    );
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByRole("button", { name: /include dwight/i }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /exclude dwight/i }).getAttribute("aria-pressed")).toBe("false");
  });

  it("Exclude button has aria-pressed='true' when character filter is 'exclude'", () => {
    renderDrawer(
      { characterFilters: { "1": "exclude" } },
      {},
      { availableCharacterKeys: ["1"], getCharacterLabel: () => "Dwight" },
    );
    fireEvent.click(screen.getByRole("button", { name: /constraints/i }));
    expect(screen.getByRole("button", { name: /exclude dwight/i }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /include dwight/i }).getAttribute("aria-pressed")).toBe("false");
  });
});

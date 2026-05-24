import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Perk } from "../../types/dbd";
import { useToast } from "../../hooks/useToast";
import { BuildMaker } from "./BuildMaker";

vi.mock("../../hooks/useToast", () => ({ useToast: vi.fn() }));

const mockUseToast = vi.mocked(useToast);

function makePerk(name: string, character: number | null = null): Perk {
  return {
    name,
    description: "",
    character,
    role: "survivor",
    image: "",
    categories: ["adaptation"],
    tunables: null,
  };
}

const TEST_PERKS = [
  makePerk("Adrenaline"),
  makePerk("Dead Hard", 1),
  makePerk("Spine Chill"),
  makePerk("Sprint Burst", 2),
];

const defaultProps = {
  perks: TEST_PERKS,
  role: "survivor" as const,
  characterMap: { 1: "Dwight", 2: "Meg" },
  hasRatings: false,
  onExportTierList: vi.fn(),
  userId: null,
  onOpenAuthModal: vi.fn(),
  onSave: vi.fn().mockResolvedValue(undefined),
  builds: [],
  onDelete: vi.fn().mockResolvedValue(undefined),
};

function preloadUrl(perkName: string) {
  window.history.pushState({}, "", `?role=survivor&p0=${encodeURIComponent(perkName)}&p1=&p2=&p3=`);
}

beforeEach(() => {
  mockUseToast.mockReturnValue({ showToast: vi.fn() });
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  window.history.pushState({}, "", "/");
  localStorage.clear();
  vi.clearAllMocks();
});

describe("BuildMaker — ConstraintsDrawer integration", () => {
  it("renders the Constraints toggle button", () => {
    render(<BuildMaker {...defaultProps} />);
    expect(screen.getByRole("button", { name: /constraints/i })).not.toBeNull();
  });
});

describe("BuildMaker — perk blacklist", () => {
  it("each perk in the picker has a ban button", () => {
    render(<BuildMaker {...defaultProps} />);
    TEST_PERKS.forEach((perk) => {
      expect(screen.getByRole("button", { name: `Exclude ${perk.name} from randomiser` })).not.toBeNull();
    });
  });

  it("clicking a ban button shows the activeConstraintCount badge in the Constraints drawer", () => {
    render(<BuildMaker {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Exclude Dead Hard from randomiser" }));
    expect(screen.getByText("1")).not.toBeNull();
  });

  it("the ban button label changes to 'Remove from blacklist' after banning", () => {
    render(<BuildMaker {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Exclude Dead Hard from randomiser" }));
    expect(screen.getByRole("button", { name: "Remove Dead Hard from blacklist" })).not.toBeNull();
  });
});

describe("BuildMaker — pin slots", () => {
  it("renders a Pin button for each slot", () => {
    render(<BuildMaker {...defaultProps} />);
    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(4);
  });

  it("all Pin buttons are disabled when slots are empty", () => {
    render(<BuildMaker {...defaultProps} />);
    screen.getAllByRole("button", { name: "Pin" }).forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("Pin button for a filled slot is enabled", () => {
    preloadUrl("Adrenaline");
    render(<BuildMaker {...defaultProps} />);

    // Slot 0 is pre-populated with Adrenaline; slots 1-3 are empty
    const pinButtons = screen.getAllByRole("button", { name: "Pin" });
    expect((pinButtons[0] as HTMLButtonElement).disabled).toBe(false);
    expect((pinButtons[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it("clicking Pin changes the button label to 'Pinned'", () => {
    preloadUrl("Adrenaline");
    render(<BuildMaker {...defaultProps} />);

    const pinButtons = screen.getAllByRole("button", { name: "Pin" });
    fireEvent.click(pinButtons[0]);

    expect(screen.getByRole("button", { name: "Pinned" })).not.toBeNull();
    // Other slots still show "Pin"
    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(3);
  });

  it("clicking Pinned toggles back to Pin (unpin)", () => {
    preloadUrl("Adrenaline");
    render(<BuildMaker {...defaultProps} />);

    const pinBtn = screen.getAllByRole("button", { name: "Pin" })[0];
    fireEvent.click(pinBtn); // pin
    fireEvent.click(screen.getByRole("button", { name: "Pinned" })); // unpin

    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(4);
    expect(screen.queryByRole("button", { name: "Pinned" })).toBeNull();
  });

  it("removing a perk from a pinned slot auto-unpins it", () => {
    preloadUrl("Adrenaline");
    render(<BuildMaker {...defaultProps} />);

    // Pin slot 0
    const pinBtn = screen.getAllByRole("button", { name: "Pin" })[0];
    fireEvent.click(pinBtn);
    expect(screen.getByRole("button", { name: "Pinned" })).not.toBeNull();

    // Remove the perk by clicking the slot octagon (it has role="button" when filled)
    const removeBtn = screen.getByRole("button", { name: /remove adrenaline/i });
    fireEvent.click(removeBtn);

    // Slot is empty → pin auto-cleared → all 4 Pin buttons present and disabled
    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(4);
    expect(screen.queryByRole("button", { name: "Pinned" })).toBeNull();
  });
});

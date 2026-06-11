import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
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

// BuildMaker reads/writes the URL via react-router; tests mount it in a
// MemoryRouter. `withPerk` pre-populates slot 0 through the share-URL params.
function renderBuildMaker(props = defaultProps, withPerk?: string) {
  const url = withPerk
    ? `/build?role=survivor&p0=${encodeURIComponent(withPerk)}&p1=&p2=&p3=`
    : "/build";
  return render(
    <MemoryRouter initialEntries={[url]}>
      <BuildMaker {...props} />
    </MemoryRouter>,
  );
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
  localStorage.clear();
  vi.clearAllMocks();
});

describe("BuildMaker — URL sync through the router", () => {
  it("hydrates from share-URL params and writes slot changes back to the URL", () => {
    // Renders the live router search string so assertions stay pure.
    const LocationProbe = () => <div data-testid="location-search">{useLocation().search}</div>;
    render(
      <MemoryRouter initialEntries={["/build?role=survivor&p0=Adrenaline&p1=&p2=&p3="]}>
        <BuildMaker {...defaultProps} />
        <LocationProbe />
      </MemoryRouter>,
    );

    // Hydrated from URL
    expect(screen.getByRole("button", { name: /remove adrenaline/i })).not.toBeNull();

    // Removing the perk syncs the URL (BuildMaker is the single writer)
    fireEvent.click(screen.getByRole("button", { name: /remove adrenaline/i }));
    const search = screen.getByTestId("location-search").textContent ?? "";
    expect(search).toContain("role=survivor");
    expect(search).not.toContain("Adrenaline");
  });
});

describe("BuildMaker — ConstraintsDrawer integration", () => {
  it("renders the Constraints toggle button", () => {
    renderBuildMaker();
    expect(screen.getByRole("button", { name: /constraints/i })).not.toBeNull();
  });
});

describe("BuildMaker — perk blacklist", () => {
  it("each perk in the picker has a ban button", () => {
    renderBuildMaker();
    TEST_PERKS.forEach((perk) => {
      expect(screen.getByRole("button", { name: `Exclude ${perk.name} from randomiser` })).not.toBeNull();
    });
  });

  it("clicking a ban button shows the activeConstraintCount badge in the Constraints drawer", () => {
    renderBuildMaker();
    fireEvent.click(screen.getByRole("button", { name: "Exclude Dead Hard from randomiser" }));
    const toggle = screen.getByRole("button", { name: /constraints/i });
    expect(toggle.textContent).toContain("1");
  });

  it("the ban button label changes to 'Remove from blacklist' after banning", () => {
    renderBuildMaker();
    fireEvent.click(screen.getByRole("button", { name: "Exclude Dead Hard from randomiser" }));
    expect(screen.getByRole("button", { name: "Remove Dead Hard from blacklist" })).not.toBeNull();
  });
});

describe("BuildMaker — pin slots", () => {
  it("renders a Pin button for each slot", () => {
    renderBuildMaker();
    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(4);
  });

  it("all Pin buttons are disabled when slots are empty", () => {
    renderBuildMaker();
    screen.getAllByRole("button", { name: "Pin" }).forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("Pin button for a filled slot is enabled", () => {
    renderBuildMaker(defaultProps, "Adrenaline");

    // Slot 0 is pre-populated with Adrenaline; slots 1-3 are empty
    const pinButtons = screen.getAllByRole("button", { name: "Pin" });
    expect((pinButtons[0] as HTMLButtonElement).disabled).toBe(false);
    expect((pinButtons[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it("clicking Pin changes the button label to 'Pinned'", () => {
    renderBuildMaker(defaultProps, "Adrenaline");

    const pinButtons = screen.getAllByRole("button", { name: "Pin" });
    fireEvent.click(pinButtons[0]);

    expect(screen.getByRole("button", { name: "Pinned" })).not.toBeNull();
    // Other slots still show "Pin"
    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(3);
  });

  it("clicking Pinned toggles back to Pin (unpin)", () => {
    renderBuildMaker(defaultProps, "Adrenaline");

    const pinBtn = screen.getAllByRole("button", { name: "Pin" })[0];
    fireEvent.click(pinBtn); // pin
    fireEvent.click(screen.getByRole("button", { name: "Pinned" })); // unpin

    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(4);
    expect(screen.queryByRole("button", { name: "Pinned" })).toBeNull();
  });

  it("removing a perk from a pinned slot auto-unpins it", () => {
    renderBuildMaker(defaultProps, "Adrenaline");

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

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacters } from "../../hooks/useCharacters";
import { usePerks } from "../../hooks/usePerks";
import { useRatings } from "../../hooks/useRatings";
import { PerkList } from "./PerkList";

vi.mock("../../hooks/usePerks");
vi.mock("../../hooks/useCharacters");
vi.mock("../../hooks/useRatings");

const mockUsePerks = vi.mocked(usePerks);
const mockUseCharacters = vi.mocked(useCharacters);
const mockUseRatings = vi.mocked(useRatings);

beforeEach(() => {
  mockUseCharacters.mockReturnValue({ characterMap: {}, loading: false, error: "", retry: vi.fn() });
  mockUseRatings.mockReturnValue({ ratings: {}, setRating: vi.fn() });
});

describe("PerkList error state", () => {
  it("shows a Retry button when perk load fails", () => {
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "503 Service Unavailable", retry: vi.fn() });

    render(<PerkList />);

    expect(screen.queryByRole("button", { name: /retry|try again/i })).not.toBeNull();
  });

  it("does not show the raw error string to the user", () => {
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "503 Service Unavailable", retry: vi.fn() });

    render(<PerkList />);

    expect(screen.queryByText("503 Service Unavailable")).toBeNull();
  });

  it("clicking Try again calls retry()", () => {
    const retryMock = vi.fn();
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "Network error", retry: retryMock });

    render(<PerkList />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(retryMock).toHaveBeenCalledOnce();
  });
});

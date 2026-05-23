import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { useBuilds } from "../../hooks/useBuilds";
import { useCharacters } from "../../hooks/useCharacters";
import { usePerks } from "../../hooks/usePerks";
import { useRatings } from "../../hooks/useRatings";
import { useToast } from "../../hooks/useToast";
import { AuthModalContext } from "../../context/AuthModalContext";
import { PerkList } from "./PerkList";

vi.mock("../../hooks/usePerks");
vi.mock("../../hooks/useCharacters");
vi.mock("../../hooks/useRatings");
vi.mock("../../hooks/useToast", () => ({ useToast: vi.fn() }));
vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../hooks/useBuilds", () => ({ useBuilds: vi.fn() }));

const mockUsePerks = vi.mocked(usePerks);
const mockUseCharacters = vi.mocked(useCharacters);
const mockUseRatings = vi.mocked(useRatings);
const mockUseToast = vi.mocked(useToast);
const mockUseAuth = vi.mocked(useAuth);
const mockUseBuilds = vi.mocked(useBuilds);

const renderWithAuthModal = (ui: React.ReactElement) =>
  render(
    <AuthModalContext.Provider value={{ openAuthModal: vi.fn() }}>
      {ui}
    </AuthModalContext.Provider>
  );

beforeEach(() => {
  mockUseCharacters.mockReturnValue({ characterMap: {}, loading: false, error: "", retry: vi.fn() });
  mockUseRatings.mockReturnValue({ ratings: {}, setRating: vi.fn() });
  mockUseToast.mockReturnValue({ showToast: vi.fn() });
  mockUseAuth.mockReturnValue({ user: null, loading: false, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), signInWithGoogle: vi.fn() });
  mockUseBuilds.mockReturnValue({ builds: [], loading: false, error: null, saveBuild: vi.fn(), deleteBuild: vi.fn() });
});

describe("PerkList error state", () => {
  it("shows a Retry button when perk load fails", () => {
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "503 Service Unavailable", retry: vi.fn() });

    renderWithAuthModal(<PerkList />);

    expect(screen.queryByRole("button", { name: /retry|try again/i })).not.toBeNull();
  });

  it("does not show the raw error string to the user", () => {
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "503 Service Unavailable", retry: vi.fn() });

    renderWithAuthModal(<PerkList />);

    expect(screen.queryByText("503 Service Unavailable")).toBeNull();
  });

  it("clicking Try again calls retry()", () => {
    const retryMock = vi.fn();
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "Network error", retry: retryMock });

    renderWithAuthModal(<PerkList />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(retryMock).toHaveBeenCalledOnce();
  });
});

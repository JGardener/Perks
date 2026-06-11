import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { useBuilds } from "../../hooks/useBuilds";
import { useCommunityGrades } from "../../hooks/useCommunityGrades";
import { useCharacters } from "../../hooks/useCharacters";
import { usePerks } from "../../hooks/usePerks";
import { useRatings } from "../../hooks/useRatings";
import { AppDataProvider } from "../../context/AppDataContext";
import { AuthModalContext } from "../../context/AuthModalContext";
import { PerksPage } from "./PerksPage";

vi.mock("../../hooks/usePerks");
vi.mock("../../hooks/useCharacters");
vi.mock("../../hooks/useRatings");
vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../hooks/useBuilds", () => ({ useBuilds: vi.fn() }));
vi.mock("../../hooks/useCommunityGrades", () => ({ useCommunityGrades: vi.fn() }));

const mockUsePerks = vi.mocked(usePerks);
const mockUseCharacters = vi.mocked(useCharacters);
const mockUseRatings = vi.mocked(useRatings);
const mockUseAuth = vi.mocked(useAuth);
const mockUseBuilds = vi.mocked(useBuilds);
const mockUseCommunityGrades = vi.mocked(useCommunityGrades);

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/perks"]}>
      <AuthModalContext.Provider value={{ openAuthModal: vi.fn() }}>
        <AppDataProvider>
          <PerksPage />
        </AppDataProvider>
      </AuthModalContext.Provider>
    </MemoryRouter>,
  );

beforeEach(() => {
  mockUseCharacters.mockReturnValue({ characterMap: {}, loading: false, error: "", retry: vi.fn() });
  mockUseRatings.mockReturnValue({ ratings: {}, setRating: vi.fn() });
  mockUseAuth.mockReturnValue({ user: null, loading: false, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), signInWithGoogle: vi.fn() });
  mockUseBuilds.mockReturnValue({ builds: [], loading: false, error: null, saveBuild: vi.fn(), deleteBuild: vi.fn() });
  mockUseCommunityGrades.mockReturnValue({ grades: [], loading: false, error: null });
});

describe("PerksPage error state", () => {
  it("shows a Retry button when perk load fails", () => {
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "503 Service Unavailable", retry: vi.fn() });

    renderPage();

    expect(screen.queryByRole("button", { name: /retry|try again/i })).not.toBeNull();
  });

  it("does not show the raw error string to the user", () => {
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "503 Service Unavailable", retry: vi.fn() });

    renderPage();

    expect(screen.queryByText("503 Service Unavailable")).toBeNull();
  });

  it("clicking Try again calls retry()", () => {
    const retryMock = vi.fn();
    mockUsePerks.mockReturnValue({ perks: [], loading: false, error: "Network error", retry: retryMock });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(retryMock).toHaveBeenCalledOnce();
  });
});

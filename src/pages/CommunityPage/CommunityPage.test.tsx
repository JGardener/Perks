import { render, screen } from "@testing-library/react";
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
import type { CommunityGrade, Grade, Perk } from "../../types/dbd";
import { CommunityPage } from "./CommunityPage";

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

const makePerk = (name: string, role: "survivor" | "killer" = "survivor"): Perk => ({
  name,
  description: "",
  character: null,
  role,
  image: "",
  categories: null,
  tunables: null,
});

const makeGrade = (perk_name: string, count: number): CommunityGrade => ({
  perk_name,
  grade: "A",
  count,
});

const IRON_WILL = makePerk("Iron Will", "survivor");
const DEAD_HARD = makePerk("Dead Hard", "survivor");
const CORRUPT = makePerk("Corrupt Intervention", "killer");

const ratings: Record<string, Grade> = { "Iron Will": "A" };

const AUTHED_USER = {
  user: { id: "u1" } as ReturnType<typeof useAuth>["user"],
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/community"]}>
      <AuthModalContext.Provider value={{ openAuthModal: vi.fn() }}>
        <AppDataProvider>
          <CommunityPage />
        </AppDataProvider>
      </AuthModalContext.Provider>
    </MemoryRouter>,
  );

beforeEach(() => {
  mockUsePerks.mockReturnValue({
    perks: [IRON_WILL, DEAD_HARD, CORRUPT],
    loading: false,
    error: "",
    retry: vi.fn(),
  });
  mockUseCharacters.mockReturnValue({ characterMap: {}, loading: false, error: "", retry: vi.fn() });
  mockUseRatings.mockReturnValue({ ratings, setRating: vi.fn() });
  mockUseAuth.mockReturnValue(AUTHED_USER);
  mockUseBuilds.mockReturnValue({ builds: [], loading: false, error: null, saveBuild: vi.fn(), deleteBuild: vi.fn() });
  mockUseCommunityGrades.mockReturnValue({ grades: [], loading: false, error: null });
});

describe("CommunityPage — community top picks", () => {
  it("does not render Community's Top Picks when no perk has any A-votes", () => {
    mockUseCommunityGrades.mockReturnValue({
      grades: [{ perk_name: "Iron Will", grade: "B", count: 10 }],
      loading: false,
      error: null,
    });

    renderPage();

    expect(screen.queryByText(/community's top picks/i)).toBeNull();
  });

  it("renders Community's Top Picks when communityGrades has A-votes", () => {
    mockUseCommunityGrades.mockReturnValue({
      grades: [makeGrade("Iron Will", 10), makeGrade("Corrupt Intervention", 5)],
      loading: false,
      error: null,
    });

    renderPage();

    expect(screen.queryAllByText(/community's top picks/i).length).toBeGreaterThan(0);
  });
});

describe("CommunityPage — tier board gating", () => {
  it("shows the tier board for an authenticated user with community data", () => {
    mockUseCommunityGrades.mockReturnValue({
      grades: [makeGrade("Iron Will", 10)],
      loading: false,
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole("button", { name: /Iron Will — community grade A/i }),
    ).not.toBeNull();
  });

  it("shows the sign-in nudge instead of the board for anonymous users", () => {
    mockUseAuth.mockReturnValue({ ...AUTHED_USER, user: null });
    mockUseCommunityGrades.mockReturnValue({
      grades: [makeGrade("Iron Will", 10)],
      loading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByRole("button", { name: /sign in to unlock/i })).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Iron Will — community grade/i })).toBeNull();
  });

  it("still shows personal ratings for anonymous users", () => {
    mockUseAuth.mockReturnValue({ ...AUTHED_USER, user: null });

    renderPage();

    expect(screen.getByText("1 / 2 rated")).not.toBeNull();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Perk } from "../../types/dbd";
import { AuthModalContext } from "../../context/AuthModalContext";
import { useAuth } from "../../hooks/useAuth";
import { PerkCard } from "./PerkCard";

vi.mock("../../hooks/useAuth");

const mockUseAuth = vi.mocked(useAuth);

const mockPerk: Perk = {
  name: "Adrenaline",
  description: "Feel the rush.",
  character: null,
  role: "survivor",
  image: "Perk_Adrenaline",
  categories: [],
  tunables: null,
};

function renderCard(openAuthModal = vi.fn(), onRate = vi.fn()) {
  return render(
    <AuthModalContext.Provider value={{ openAuthModal }}>
      <PerkCard perk={mockPerk} characterName={null} rating={null} onRate={onRate} onClick={vi.fn()} />
    </AuthModalContext.Provider>
  );
}

describe("PerkCard grade buttons", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null, loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), signInWithGoogle: vi.fn(),
    });
  });

  it("calls openAuthModal when signed out and a grade is clicked", () => {
    const openAuthModal = vi.fn();
    renderCard(openAuthModal);

    fireEvent.click(screen.getByRole("button", { name: /Rate Adrenaline A/i }));

    expect(openAuthModal).toHaveBeenCalledWith("Sign in to rate perks");
  });

  it("calls onRate when signed in and a grade is clicked", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123" } as ReturnType<typeof useAuth>["user"],
      loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), signInWithGoogle: vi.fn(),
    });
    const onRate = vi.fn();
    renderCard(vi.fn(), onRate);

    fireEvent.click(screen.getByRole("button", { name: /Rate Adrenaline A/i }));

    expect(onRate).toHaveBeenCalledWith("A");
  });
});

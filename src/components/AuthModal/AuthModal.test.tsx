import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthModal } from "./AuthModal";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ signIn: vi.fn(), signUp: vi.fn(), signInWithGoogle: vi.fn() }),
}));

describe("AuthModal", () => {
  it("renders reason above tabs when provided", () => {
    render(<AuthModal onClose={vi.fn()} reason="Sign in to rate perks" />);

    expect(screen.queryByText("Sign in to rate perks")).not.toBeNull();
  });
});

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAuthModal } from "./AuthModalContext";

describe("useAuthModal", () => {
  it("throws when called outside AuthModalContext", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAuthModal())).toThrow(
      "useAuthModal must be used within AuthModalContext"
    );

    spy.mockRestore();
  });
});

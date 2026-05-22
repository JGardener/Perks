import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../services/supabase";
import { useToast } from "./useToast";
import { useRatings } from "./useRatings";

vi.mock("../services/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("./useToast", () => ({
  useToast: vi.fn(),
}));

const mockGetSession = vi.mocked(supabase.auth.getSession);
const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange);
const mockFrom = vi.mocked(supabase.from);
const mockUseToast = vi.mocked(useToast);

beforeEach(() => {
  mockGetSession.mockResolvedValue({ data: { session: null } } as any);
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  } as any);
  mockUseToast.mockReturnValue({ showToast: vi.fn() });
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("useRatings", () => {
  it("anonymous user sees an empty ratings map even if localStorage has data", () => {
    localStorage.setItem("perk-ratings", JSON.stringify({ Adrenaline: "A" }));

    const { result } = renderHook(() => useRatings());

    expect(result.current.ratings).toEqual({});
  });

  it("setRating is a no-op for anonymous users", () => {
    const { result } = renderHook(() => useRatings());

    act(() => { result.current.setRating("Adrenaline", "A"); });

    expect(result.current.ratings).toEqual({});
  });

  it("reverts rating and shows toast when Supabase write fails", async () => {
    const showToast = vi.fn();
    mockUseToast.mockReturnValue({ showToast });

    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
    } as any);

    // First from() call: load ratings (returns empty)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }) as any);

    // Second from() call: upsert (fails)
    mockFrom.mockImplementationOnce(() => ({
      upsert: vi.fn().mockResolvedValue({ error: { message: "Network error" } }),
    }) as any);

    const { result } = renderHook(() => useRatings());

    // Wait for auth to settle and load to complete
    await waitFor(() => expect(mockFrom).toHaveBeenCalled());

    // Optimistic update
    act(() => { result.current.setRating("Adrenaline", "A"); });
    expect(result.current.ratings).toEqual({ Adrenaline: "A" });

    // Wait for rollback after async upsert error
    await waitFor(() => expect(result.current.ratings).toEqual({}));
    expect(showToast).toHaveBeenCalledWith("Failed to save rating");
  });
});

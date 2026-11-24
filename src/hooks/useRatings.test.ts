import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
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

// Test doubles stub only what useRatings touches, so partial objects are cast
// through `unknown` to the real Supabase types rather than to `any`.
type QueryBuilder = ReturnType<typeof supabase.from>;
type AuthListener = ReturnType<typeof supabase.auth.onAuthStateChange>;

beforeEach(() => {
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  } as unknown as AuthListener);
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
      data: { session: { user: { id: "user-123" } } as unknown as Session },
      error: null,
    });

    // First from() call: load ratings (returns empty)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }) as unknown as QueryBuilder);

    // Second from() call: upsert (fails)
    mockFrom.mockImplementationOnce(() => ({
      upsert: vi.fn().mockResolvedValue({ error: { message: "Network error" } }),
    }) as unknown as QueryBuilder);

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

  it("clears ratings when the user signs out", async () => {
    let onAuthChange: ((event: string, session: Session | null) => void) | undefined;
    mockOnAuthStateChange.mockImplementation(((cb: typeof onAuthChange) => {
      onAuthChange = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }) as unknown as typeof supabase.auth.onAuthStateChange);
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-123" } } as unknown as Session },
      error: null,
    });
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ perk_name: "Adrenaline", grade: "A" }], error: null }),
      }),
    }) as unknown as QueryBuilder);

    const { result } = renderHook(() => useRatings());

    await waitFor(() => expect(result.current.ratings).toEqual({ Adrenaline: "A" }));

    act(() => { onAuthChange?.("SIGNED_OUT", null); });

    expect(result.current.ratings).toEqual({});
  });
});

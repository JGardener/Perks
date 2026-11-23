import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../services/supabase";
import { useToast } from "./useToast";
import { useBuilds } from "./useBuilds";

vi.mock("../services/supabase", () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

vi.mock("./useToast", () => ({
  useToast: vi.fn(),
}));

const mockFrom = vi.mocked(supabase.from);
const mockInvoke = vi.mocked(supabase.functions.invoke);
const mockUseToast = vi.mocked(useToast);

// Test doubles stub only the query-builder chain each test exercises, so they
// are cast through `unknown` to the real builder type rather than to `any`.
type QueryBuilder = ReturnType<typeof supabase.from>;
type InvokeResult = Awaited<ReturnType<typeof supabase.functions.invoke>>;

function makeLoadMock(error: null | object = null) {
  return (): QueryBuilder => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error }),
      }),
    }),
  }) as unknown as QueryBuilder;
}

beforeEach(() => {
  mockUseToast.mockReturnValue({ showToast: vi.fn() });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useBuilds", () => {
  it("deleteBuild failure shows toast and does not set error state", async () => {
    const showToast = vi.fn();
    mockUseToast.mockReturnValue({ showToast });

    mockFrom.mockImplementationOnce(makeLoadMock());
    mockFrom.mockImplementationOnce(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
        }),
      }),
    }) as unknown as QueryBuilder);

    const { result } = renderHook(() => useBuilds("user-123"));
    await waitFor(() => expect(mockFrom).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.deleteBuild("build-abc");
    });

    expect(showToast).toHaveBeenCalledWith("Failed to delete build");
    expect(result.current.error).toBeNull();
  });

  it("saveBuild failure shows toast and does not set error state", async () => {
    const showToast = vi.fn();
    mockUseToast.mockReturnValue({ showToast });

    mockFrom.mockImplementationOnce(makeLoadMock());
    mockInvoke.mockResolvedValue({ data: { valid: true }, error: null } as InvokeResult);
    mockFrom.mockImplementationOnce(() => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
        }),
      }),
    }) as unknown as QueryBuilder);

    const { result } = renderHook(() => useBuilds("user-123"));
    await waitFor(() => expect(mockFrom).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.saveBuild("My Build", "survivor", [null, null, null, null]);
    });

    expect(showToast).toHaveBeenCalledWith("Failed to save build");
    expect(result.current.error).toBeNull();
  });

  it("clears builds and loading when the user signs out", async () => {
    const build = { id: "b1", user_id: "user-123", name: "B", role: "survivor", perks: [], is_public: false };
    mockFrom.mockImplementationOnce((() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [build], error: null }),
        }),
      }),
    })) as unknown as () => QueryBuilder);

    const { result, rerender } = renderHook(({ id }) => useBuilds(id), {
      initialProps: { id: "user-123" as string | null },
    });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.builds).toHaveLength(1));
    expect(result.current.loading).toBe(false);

    rerender({ id: null });

    expect(result.current.builds).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it("does not fetch for an anonymous user", () => {
    const { result } = renderHook(() => useBuilds(null));

    expect(result.current.loading).toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

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

function makeLoadMock(error: null | object = null) {
  return () => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error }),
      }),
    }),
  });
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

    mockFrom.mockImplementationOnce(makeLoadMock() as any);
    mockFrom.mockImplementationOnce(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
        }),
      }),
    }) as any);

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

    mockFrom.mockImplementationOnce(makeLoadMock() as any);
    mockInvoke.mockResolvedValue({ data: { valid: true }, error: null } as any);
    mockFrom.mockImplementationOnce(() => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
        }),
      }),
    }) as any);

    const { result } = renderHook(() => useBuilds("user-123"));
    await waitFor(() => expect(mockFrom).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.saveBuild("My Build", "survivor", [null, null, null, null]);
    });

    expect(showToast).toHaveBeenCalledWith("Failed to save build");
    expect(result.current.error).toBeNull();
  });
});

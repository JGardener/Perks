import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../services/supabase";
import { useToast } from "./useToast";
import { useCommunityGrades } from "./useCommunityGrades";

vi.mock("../services/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("./useToast", () => ({
  useToast: vi.fn(),
}));

const mockRpc = vi.mocked(supabase.rpc);
const mockUseToast = vi.mocked(useToast);

beforeEach(() => {
  mockUseToast.mockReturnValue({ showToast: vi.fn() });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCommunityGrades", () => {
  it("load failure shows info toast and does not set error state", async () => {
    const showToast = vi.fn();
    mockUseToast.mockReturnValue({ showToast });

    mockRpc.mockResolvedValueOnce({ data: null, error: { message: "DB error", details: "", hint: "", code: "", name: "PostgrestError" }, count: null, status: 500, statusText: "Internal Server Error" } as never);

    const { result } = renderHook(() => useCommunityGrades("user-123"));

    await waitFor(() => expect(showToast).toHaveBeenCalled());

    expect(showToast).toHaveBeenCalledWith("Community grades unavailable", "info");
    expect(result.current.error).toBeNull();
  });
});

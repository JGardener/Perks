import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAsyncData } from "./useAsyncData";

describe("useAsyncData", () => {
  it("returns fetcher data after mount", async () => {
    const fetcher = vi.fn().mockResolvedValue("hello");
    const { result } = renderHook(() => useAsyncData(fetcher, ""));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe("hello");
    expect(result.current.error).toBe("");
  });

  it("sets error when fetcher rejects", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useAsyncData(fetcher, ""));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("network down");
  });

  it("retry() triggers a new fetch", async () => {
    const fetcher = vi.fn().mockResolvedValue("data");
    const { result } = renderHook(() => useAsyncData(fetcher, ""));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher).toHaveBeenCalledTimes(1);

    act(() => { result.current.retry(); });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("retry() clears error before new fetch resolves", async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error("first failure"));
      return new Promise(() => {}); // hangs — so we can observe cleared error
    });
    const { result } = renderHook(() => useAsyncData(fetcher, ""));

    await waitFor(() => expect(result.current.error).toBe("first failure"));

    act(() => { result.current.retry(); });

    await waitFor(() => expect(result.current.error).toBe(""));
  });

  it("is loading from the very first render", () => {
    const fetcher = vi.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAsyncData(fetcher, ""));

    expect(result.current.loading).toBe(true);
  });

  it("retry() flips loading back on synchronously", async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount++;
      return callCount === 1 ? Promise.resolve("first") : new Promise(() => {});
    });
    const { result } = renderHook(() => useAsyncData(fetcher, ""));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.retry(); });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe("first");
  });

  it("uses the latest fetcher on retry without refetching when it changes", async () => {
    const first = vi.fn().mockResolvedValue("a");
    const second = vi.fn().mockResolvedValue("b");
    const { result, rerender } = renderHook(({ f }) => useAsyncData(f, ""), {
      initialProps: { f: first },
    });

    await waitFor(() => expect(result.current.data).toBe("a"));
    rerender({ f: second });
    expect(second).not.toHaveBeenCalled();

    act(() => { result.current.retry(); });

    await waitFor(() => expect(result.current.data).toBe("b"));
    expect(first).toHaveBeenCalledTimes(1);
  });
});

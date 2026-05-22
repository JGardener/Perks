import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ToastProvider } from "./ToastContext";
import { useToast } from "../hooks/useToast";

function Trigger({ message, type }: { message: string; type?: "error" | "info" }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, type)}>show</button>;
}

describe("Toast system", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("toast appears in DOM after showToast()", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger message="Something went wrong" />
      </ToastProvider>
    );

    await user.click(screen.getByRole("button", { name: "show" }));

    expect(screen.queryByText("Something went wrong")).not.toBeNull();
  });

  it("toast is removed from DOM after auto-dismiss timeout", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Trigger message="Temporary" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "show" }));
    expect(screen.queryByText("Temporary")).not.toBeNull();

    act(() => { vi.advanceTimersByTime(5000); });

    expect(screen.queryByText("Temporary")).toBeNull();
  });

  it("info toast is visually distinct from error toast", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger message="FYI" type="info" />
      </ToastProvider>
    );

    await user.click(screen.getByRole("button", { name: "show" }));

    const toast = screen.getByText("FYI").closest("[data-type]") as HTMLElement;
    expect(toast.dataset.type).toBe("info");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteBuildModal } from "./DeleteBuildModal";

describe("DeleteBuildModal", () => {
  it("Confirm button calls onConfirm", () => {
    const onConfirm = vi.fn();
    render(<DeleteBuildModal buildName="My Build" onConfirm={onConfirm} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("Cancel button calls onClose", () => {
    const onClose = vi.fn();
    render(<DeleteBuildModal buildName="My Build" onConfirm={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("Escape key calls onClose", () => {
    const onClose = vi.fn();
    render(<DeleteBuildModal buildName="My Build" onConfirm={vi.fn()} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows the build name in the dialog", () => {
    render(<DeleteBuildModal buildName="Stealth Runner" onConfirm={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByText(/Stealth Runner/)).not.toBeNull();
  });
});

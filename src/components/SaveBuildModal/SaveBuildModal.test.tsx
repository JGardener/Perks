import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Perk } from "../../types/dbd";
import { SaveBuildModal } from "./SaveBuildModal";

const makePerk = (name: string): Perk => ({
  name,
  description: "",
  character: null,
  role: "survivor",
  image: "",
  categories: null,
  tunables: null,
});

const fullSlots: (Perk | null)[] = [
  makePerk("Iron Will"), makePerk("Sprint Burst"), makePerk("Borrowed Time"), makePerk("Kindred"),
];

const partialSlots: (Perk | null)[] = [
  makePerk("Iron Will"), null, null, null,
];

describe("SaveBuildModal", () => {
  it("Save button is disabled when the name input is empty", () => {
    render(<SaveBuildModal slots={fullSlots} onSave={vi.fn()} onClose={vi.fn()} />);

    expect((screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("warning is shown when any slot is null", () => {
    render(<SaveBuildModal slots={partialSlots} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByText(/some slots are empty/i)).not.toBeNull();
  });

  it("warning is hidden when all 4 slots are filled", () => {
    render(<SaveBuildModal slots={fullSlots} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByText(/some slots are empty/i)).toBeNull();
  });

  it("Escape key closes the modal", () => {
    const onClose = vi.fn();
    render(<SaveBuildModal slots={fullSlots} onSave={vi.fn()} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("close button closes the modal", () => {
    const onClose = vi.fn();
    render(<SaveBuildModal slots={fullSlots} onSave={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("submitting a valid name calls onSave with that name", async () => {
    const onSave = vi.fn();
    render(<SaveBuildModal slots={fullSlots} onSave={onSave} onClose={vi.fn()} />);

    await userEvent.type(screen.getByRole("textbox"), "My Build");
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(onSave).toHaveBeenCalledWith("My Build");
  });

  it("clicking outside the modal does not close it", () => {
    const onClose = vi.fn();
    render(<SaveBuildModal slots={fullSlots} onSave={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByRole("presentation"));

    expect(onClose).not.toHaveBeenCalled();
  });
});

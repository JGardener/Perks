import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Build, Perk } from "../../types/dbd";
import { SavedBuilds } from "./SavedBuilds";

const makePerk = (name: string): Perk => ({
  name,
  description: "",
  character: null,
  role: "survivor",
  image: "",
  categories: null,
  tunables: null,
});

const makeBuild = (id: string, role: "survivor" | "killer", perkNames: (string | null)[], name = "My Build"): Build => ({
  id,
  user_id: "user-1",
  name,
  role,
  perks: perkNames,
  is_public: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

const survivorBuild = makeBuild("s1", "survivor", ["Iron Will", null, null, null], "Stealth Run");
const killerBuild = makeBuild("k1", "killer", ["Corrupt Intervention", null, null, null], "Slow Start");
const perks = [makePerk("Iron Will"), makePerk("Corrupt Intervention")];

const defaultProps = {
  builds: [survivorBuild, killerBuild],
  role: "survivor" as const,
  perks,
  onOpenAuthModal: vi.fn(),
  isCurrentBuildEmpty: true,
  onLoad: vi.fn(),
  onDelete: vi.fn(),
};

describe("SavedBuilds", () => {
  it("unauthenticated user sees a sign-in prompt", () => {
    render(<SavedBuilds {...defaultProps} userId={null} />);

    expect(screen.queryByText(/sign in/i)).not.toBeNull();
  });

  it("authenticated user with no builds for active role sees empty state", () => {
    render(<SavedBuilds {...defaultProps} userId="user-1" builds={[killerBuild]} role="survivor" />);

    expect(screen.queryByText(/no saved builds/i)).not.toBeNull();
  });

  it("authenticated user with builds sees a card per build for the active role", () => {
    const builds = [
      makeBuild("s1", "survivor", [null, null, null, null], "Build A"),
      makeBuild("s2", "survivor", [null, null, null, null], "Build B"),
    ];
    render(<SavedBuilds {...defaultProps} userId="user-1" builds={builds} role="survivor" />);

    expect(screen.queryByText("Build A")).not.toBeNull();
    expect(screen.queryByText("Build B")).not.toBeNull();
  });

  it("builds for a different role are not shown", () => {
    render(<SavedBuilds {...defaultProps} userId="user-1" />);

    expect(screen.queryByText("Stealth Run")).not.toBeNull();
    expect(screen.queryByText("Slow Start")).toBeNull();
  });

  it("clicking Load when current build is empty calls onLoad immediately", () => {
    const onLoad = vi.fn();
    render(
      <SavedBuilds {...defaultProps} userId="user-1" builds={[survivorBuild]} isCurrentBuildEmpty={true} onLoad={onLoad} />
    );

    fireEvent.click(screen.getByRole("button", { name: /load/i }));

    expect(onLoad).toHaveBeenCalledWith(survivorBuild);
    expect(screen.queryByText(/replace build in progress/i)).toBeNull();
  });

  it("clicking Load when current build is occupied shows confirmation", () => {
    render(
      <SavedBuilds {...defaultProps} userId="user-1" builds={[survivorBuild]} isCurrentBuildEmpty={false} />
    );

    fireEvent.click(screen.getByRole("button", { name: /load/i }));

    expect(screen.queryByText(/replace build in progress/i)).not.toBeNull();
  });

  it("cancelling load confirmation does not call onLoad", () => {
    const onLoad = vi.fn();
    render(
      <SavedBuilds {...defaultProps} userId="user-1" builds={[survivorBuild]} isCurrentBuildEmpty={false} onLoad={onLoad} />
    );

    fireEvent.click(screen.getByRole("button", { name: /load/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onLoad).not.toHaveBeenCalled();
  });

  it("confirming load calls onLoad with the build", () => {
    const onLoad = vi.fn();
    render(
      <SavedBuilds {...defaultProps} userId="user-1" builds={[survivorBuild]} isCurrentBuildEmpty={false} onLoad={onLoad} />
    );

    fireEvent.click(screen.getByRole("button", { name: /load/i }));
    fireEvent.click(screen.getByRole("button", { name: /replace/i }));

    expect(onLoad).toHaveBeenCalledWith(survivorBuild);
  });

  it("clicking Delete opens confirmation dialog with the build name", () => {
    render(<SavedBuilds {...defaultProps} userId="user-1" builds={[survivorBuild]} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.queryByRole("dialog")).not.toBeNull();
    expect(screen.queryAllByText(/Stealth Run/).length).toBeGreaterThan(0);
  });

  it("cancelling delete confirmation does not call onDelete", () => {
    const onDelete = vi.fn();
    render(<SavedBuilds {...defaultProps} userId="user-1" builds={[survivorBuild]} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("confirming delete calls onDelete with the build id", () => {
    const onDelete = vi.fn();
    render(<SavedBuilds {...defaultProps} userId="user-1" builds={[survivorBuild]} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(onDelete).toHaveBeenCalledWith("s1");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportBuildImage, exportTierListImage } from "./exportCanvas";
import type { Grade, Perk } from "../types/dbd";

let mockCtx: Record<string, unknown>;

beforeEach(() => {
  mockCtx = {
    fillStyle: "",
    font: "",
    letterSpacing: "",
    textAlign: "left" as CanvasTextAlign,
    textBaseline: "alphabetic" as CanvasTextBaseline,
    lineWidth: 1,
    strokeStyle: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 0 }),
  };
  Object.defineProperty(document, "fonts", {
    value: { ready: Promise.resolve() },
    writable: true,
    configurable: true,
  });
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(() => {});
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        Promise.resolve().then(() => this.onload?.());
      }
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const minimalPerk: Perk = {
  name: "Adrenaline",
  image: "iconPerks_adrenaline",
  description: "Run faster.",
  character: 1,
  categories: null,
  tunables: null,
  role: "survivor",
};

describe("exportBuildImage", () => {
  it("returns false when getContext returns null", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const result = await exportBuildImage([null, null, null, null], "survivor");

    expect(result).toBe(false);
  });

  it("returns true on a successful render", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockCtx as any);

    const result = await exportBuildImage([null, null, null, null], "survivor");

    expect(result).toBe(true);
  });
});

describe("exportTierListImage", () => {
  it("returns false when getContext returns null", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const result = await exportTierListImage(
      [minimalPerk],
      { Adrenaline: "A" as Grade },
      "survivor",
    );

    expect(result).toBe(false);
  });

  it("returns true on a successful render", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockCtx as any);

    const result = await exportTierListImage(
      [minimalPerk],
      { Adrenaline: "A" as Grade },
      "survivor",
    );

    expect(result).toBe(true);
  });
});

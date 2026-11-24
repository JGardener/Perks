import { describe, expect, it } from "vitest";
import { toggleInSet } from "./setUtils";

describe("toggleInSet", () => {
  it("adds a value that is absent", () => {
    expect(toggleInSet(new Set([1]), 2)).toEqual(new Set([1, 2]));
  });

  it("removes a value that is present", () => {
    expect(toggleInSet(new Set(["a", "b"]), "a")).toEqual(new Set(["b"]));
  });

  it("returns a new Set and leaves the input untouched", () => {
    const original = new Set([1]);
    const next = toggleInSet(original, 1);
    expect(next).not.toBe(original);
    expect(original).toEqual(new Set([1]));
  });
});

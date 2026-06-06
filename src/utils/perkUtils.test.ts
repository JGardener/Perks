import { describe, expect, it } from "vitest";
import { getPerkImageUrl, resolveDescription } from "./perkUtils";

describe("getPerkImageUrl", () => {
  it("takes the filename and points it at /perks/*.png", () => {
    expect(getPerkImageUrl("foo/bar/Adrenaline")).toBe("/perks/Adrenaline.png");
    expect(getPerkImageUrl("Adrenaline")).toBe("/perks/Adrenaline.png");
  });
});

describe("resolveDescription — tunables", () => {
  it("substitutes a single tunable value", () => {
    expect(resolveDescription("Gain {Tunable.X.myValue} speed", { myvalue: [5] })).toBe(
      "Gain 5 speed",
    );
  });

  it("joins multiple tunable values with a slash", () => {
    expect(resolveDescription("Choose {Tunable.C.skill}", { skill: [1, 2, 3] })).toBe(
      "Choose 1/2/3",
    );
  });

  it("looks up keys case-insensitively", () => {
    expect(resolveDescription("Speed {Tunable.S.SpeedValue}", { speedvalue: [100] })).toBe(
      "Speed 100",
    );
  });

  it("falls back to the variable name when the key is missing", () => {
    expect(resolveDescription("Deal {Tunable.D.amount} damage", { other: [10] })).toBe(
      "Deal amount damage",
    );
  });

  it("falls back when tunables is null", () => {
    expect(resolveDescription("Gain {Tunable.C.boost}", null)).toBe("Gain boost");
  });
});

describe("resolveDescription — keyword & input", () => {
  it("wraps a keyword in a styled span", () => {
    expect(resolveDescription("You are {Keyword.Exposed}", null)).toBe(
      'You are <span class="keyword">Exposed</span>',
    );
  });

  it("maps a known input to its label inside a kbd", () => {
    expect(resolveDescription("Press {Input.UseItem}", null)).toBe(
      "Press <kbd>Use Item</kbd>",
    );
  });

  it("falls back to the raw key for an unknown input", () => {
    expect(resolveDescription("Press {Input.Unknown.Binding}", null)).toBe(
      "Press <kbd>Input.Unknown.Binding</kbd>",
    );
  });
});

describe("resolveDescription — sanitisation & edge cases", () => {
  it("strips disallowed tags", () => {
    expect(resolveDescription("A <script>alert('x')</script> perk", null)).toBe(
      "A  perk",
    );
  });

  it("preserves allowed tags while stripping the rest", () => {
    expect(resolveDescription("{Keyword.Broken} and <b>x</b>", null)).toBe(
      '<span class="keyword">Broken</span> and x',
    );
  });

  it("returns an empty string for empty input", () => {
    expect(resolveDescription("", null)).toBe("");
  });

  it("resolves all three placeholder types together", () => {
    expect(
      resolveDescription(
        "{Keyword.Perk} gains {Tunable.B.value} when {Input.UseItem} is used",
        { value: [2] },
      ),
    ).toBe(
      '<span class="keyword">Perk</span> gains 2 when <kbd>Use Item</kbd> is used',
    );
  });
});

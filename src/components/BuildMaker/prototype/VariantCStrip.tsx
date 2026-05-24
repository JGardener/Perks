// PROTOTYPE — Variant C: Control Strip
// No collapsible panel — all constraints always visible as a compact horizontal strip.
import { useRef, useState } from "react";
import { CATEGORY_COLORS } from "../../../utils/categoryColors";
import type { ConstraintsActions, ConstraintsDerived, ConstraintsState } from "./useConstraintsProto";
import styles from "./proto.module.scss";

interface Props {
  state: ConstraintsState;
  actions: ConstraintsActions;
  derived: ConstraintsDerived;
}

export const VariantCStrip = ({ state, actions, derived }: Props) => {
  const [charOpen, setCharOpen] = useState(false);
  const charBtnRef = useRef<HTMLButtonElement>(null);
  const { buildSize, categoryFilters, characterFilters, blacklist, pinnedSlots } = state;
  const { setBuildSize, toggleCategory, toggleCharacter, toggleBlacklist, resetConstraints, randomise } = actions;
  const {
    eligibleCount, constraintError, canRandomise,
    availableCategories, availableCharacterKeys, getCharacterLabel,
  } = derived;

  const pinnedCount = [...pinnedSlots].filter((i) => i < 4).length;
  const activeCharCount = Object.values(characterFilters).filter((v) => v !== "neutral").length;

  const handleReset = () => {
    if (window.confirm("Reset all constraints?")) resetConstraints();
  };

  return (
    <div className={styles.varC}>
      <div className={styles.varC_strip}>
        <button
          className={`${styles.varC_randomBtn} ${constraintError ? styles["varC_randomBtn--warn"] : ""}`}
          onClick={randomise}
          disabled={!canRandomise}
          title={constraintError ?? undefined}
        >
          Randomise
        </button>

        <div className={styles.varC_divider} />

        <span className={styles.varC_label}>Size</span>
        <div className={styles.varC_sizePills}>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`${styles.varC_sizePill} ${buildSize === n ? styles["varC_sizePill--active"] : ""}`}
              onClick={() => setBuildSize(n)}
              disabled={n < pinnedCount}
              title={n < pinnedCount ? `Can't set below ${pinnedCount} pinned` : undefined}
            >
              {n}
            </button>
          ))}
        </div>

        <div className={styles.varC_divider} />

        <div className={styles.varC_catPills}>
          {availableCategories.map((cat) => {
            const fs = categoryFilters[cat] ?? "neutral";
            const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ?? "#a8957e";
            return (
              <button
                key={cat}
                className={`${styles.varC_catPill} ${styles[`varC_catPill--${fs}`]}`}
                style={{ color, borderColor: color }}
                onClick={() => toggleCategory(cat)}
                title={`${cat}: ${fs}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className={styles.varC_divider} />

        <div className={styles.varC_popoverWrap}>
          <button
            ref={charBtnRef}
            className={`${styles.varC_popoverBtn} ${activeCharCount > 0 ? styles["varC_popoverBtn--active"] : ""}`}
            onClick={() => setCharOpen((o) => !o)}
          >
            Chars{activeCharCount > 0 ? ` (${activeCharCount})` : ""} ▾
          </button>
          {charOpen && (
            <div className={styles.varC_popover}>
              {availableCharacterKeys.map((key) => {
                const fs = characterFilters[key] ?? "neutral";
                return (
                  <div key={key} className={styles.varC_charRow}>
                    <span className={styles.varC_charName}>{getCharacterLabel(key)}</span>
                    <div className={styles.varC_charToggle}>
                      {(["neutral", "include", "exclude"] as const).map((v) => (
                        <button
                          key={v}
                          className={`${styles.varC_charBtn} ${fs === v && v !== "neutral" ? styles[`varC_charBtn--${v}`] : ""}`}
                          onClick={() => toggleCharacter(key)}
                        >
                          {v === "neutral" ? "·" : v === "include" ? "+" : "−"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {blacklist.size > 0 && (
          <button
            className={`${styles.varC_popoverBtn} ${styles["varC_popoverBtn--active"]}`}
            onClick={() => {
              if (window.confirm(`Remove all ${blacklist.size} blacklisted perks?`)) {
                [...blacklist].forEach(toggleBlacklist);
              }
            }}
          >
            {blacklist.size} banned ×
          </button>
        )}

        <button className={styles.varC_resetBtn} onClick={handleReset}>
          Reset
        </button>

        <span className={`${styles.varC_poolCount} ${constraintError ? styles["varC_poolCount--warn"] : ""}`}>
          {eligibleCount} eligible
        </span>
      </div>

      {constraintError && <p className={styles.varC_error}>{constraintError}</p>}
    </div>
  );
};

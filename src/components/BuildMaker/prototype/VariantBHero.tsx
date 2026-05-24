// PROTOTYPE — Variant B: Hero Command
// Dominant full-width Randomise button + gear icon opening a right-side drawer.
// Pins are explicit toggle buttons below each slot name (see BuildMaker.tsx injection).
import { useState } from "react";
import { CATEGORY_COLORS } from "../../../utils/categoryColors";
import type { ConstraintsActions, ConstraintsDerived, ConstraintsState } from "./useConstraintsProto";
import styles from "./proto.module.scss";

interface Props {
  state: ConstraintsState;
  actions: ConstraintsActions;
  derived: ConstraintsDerived;
}

export const VariantBHero = ({ state, actions, derived }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { buildSize, categoryFilters, characterFilters, blacklist, pinnedSlots } = state;
  const { setBuildSize, toggleCategory, toggleCharacter, toggleBlacklist, resetConstraints, randomise } = actions;
  const {
    eligibleCount, activeConstraintCount, constraintError, canRandomise,
    availableCategories, availableCharacterKeys, getCharacterLabel,
  } = derived;

  const pinnedCount = [...pinnedSlots].filter((i) => i < 4).length;

  const handleReset = () => {
    if (window.confirm("Reset all constraints?")) {
      resetConstraints();
      setDrawerOpen(false);
    }
  };

  return (
    <div className={styles.varB}>
      <div className={styles.varB_heroRow}>
        <button
          className={styles.varB_randomBtn}
          onClick={randomise}
          disabled={!canRandomise}
        >
          Randomise Build
          <span className={`${styles.varB_heroPool} ${constraintError ? styles["varB_heroPool--warn"] : ""}`}>
            {constraintError ?? `${eligibleCount} perk${eligibleCount !== 1 ? "s" : ""} eligible`}
          </span>
        </button>

        <button
          className={`${styles.varB_gearBtn} ${drawerOpen ? styles["varB_gearBtn--active"] : ""}`}
          onClick={() => setDrawerOpen((o) => !o)}
          aria-label="Open constraints panel"
        >
          ⚙
          {activeConstraintCount > 0 && (
            <span className={styles.varB_gearBadge}>{activeConstraintCount}</span>
          )}
        </button>
      </div>

      {drawerOpen && (
        <div className={styles.varB_overlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.varB_drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.varB_drawerHead}>
              <span className={styles.varB_drawerTitle}>Constraints</span>
              <button className={styles.varB_drawerClose} onClick={() => setDrawerOpen(false)}>
                ✕
              </button>
            </div>

            {/* Build Size */}
            <div className={styles.varB_section}>
              <span className={styles.varB_sectionLabel}>Build Size</span>
              <div className={styles.varB_sizeCards}>
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    className={`${styles.varB_sizeCard} ${buildSize === n ? styles["varB_sizeCard--active"] : ""}`}
                    onClick={() => setBuildSize(n)}
                    disabled={n < pinnedCount}
                    title={n < pinnedCount ? `Can't set below ${pinnedCount} pinned perks` : undefined}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className={styles.varB_section}>
              <span className={styles.varB_sectionLabel}>Categories</span>
              {availableCategories.map((cat) => {
                const fs = categoryFilters[cat] ?? "neutral";
                const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ?? "#a8957e";
                return (
                  <div key={cat} className={styles.varB_filterRow}>
                    <span className={styles.varB_filterLabel} style={{ color }}>{cat}</span>
                    <div className={styles.varB_togglePair}>
                      <button
                        className={`${styles.varB_toggleBtn} ${fs === "include" ? styles["varB_toggleBtn--include"] : ""}`}
                        onClick={() => toggleCategory(cat, "include")}
                      >
                        Include
                      </button>
                      <button
                        className={`${styles.varB_toggleBtn} ${fs === "exclude" ? styles["varB_toggleBtn--exclude"] : ""}`}
                        onClick={() => toggleCategory(cat, "exclude")}
                      >
                        Exclude
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Characters */}
            <div className={styles.varB_section}>
              <span className={styles.varB_sectionLabel}>Characters</span>
              {availableCharacterKeys.map((key) => {
                const fs = characterFilters[key] ?? "neutral";
                return (
                  <div key={key} className={styles.varB_filterRow}>
                    <span className={styles.varB_filterLabel}>{getCharacterLabel(key)}</span>
                    <div className={styles.varB_togglePair}>
                      <button
                        className={`${styles.varB_toggleBtn} ${fs === "include" ? styles["varB_toggleBtn--include"] : ""}`}
                        onClick={() => toggleCharacter(key, "include")}
                      >
                        Include
                      </button>
                      <button
                        className={`${styles.varB_toggleBtn} ${fs === "exclude" ? styles["varB_toggleBtn--exclude"] : ""}`}
                        onClick={() => toggleCharacter(key, "exclude")}
                      >
                        Exclude
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Blacklist */}
            <div className={styles.varB_section}>
              <span className={styles.varB_sectionLabel}>Blacklist</span>
              {blacklist.size === 0 ? (
                <span className={styles.varB_emptyBlacklist}>
                  No perks blacklisted — use ⊘ on any perk in the picker
                </span>
              ) : (
                <div className={styles.varB_chips}>
                  {[...blacklist].map((name) => (
                    <span key={name} className={styles.varB_chip}>
                      {name}
                      <button
                        className={styles.varB_chipRemove}
                        onClick={() => toggleBlacklist(name)}
                        aria-label={`Remove ${name} from blacklist`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.varB_drawerFooter}>
              <button className={styles.varB_resetBtn} onClick={handleReset}>
                Reset All Constraints
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

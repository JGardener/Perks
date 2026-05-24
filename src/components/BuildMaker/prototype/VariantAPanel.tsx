// PROTOTYPE — Variant A: Integrated Panel
// Randomise button in the action row; constraints in a collapsible panel below.
import { useState } from "react";
import { CATEGORY_COLORS } from "../../../utils/categoryColors";
import type { ConstraintsActions, ConstraintsDerived, ConstraintsState } from "./useConstraintsProto";
import styles from "./proto.module.scss";

interface Props {
  state: ConstraintsState;
  actions: ConstraintsActions;
  derived: ConstraintsDerived;
}

export const VariantAPanel = ({ state, actions, derived }: Props) => {
  const [open, setOpen] = useState(false);
  const { buildSize, categoryFilters, characterFilters, blacklist, pinnedSlots } = state;
  const { setBuildSize, toggleCategory, toggleCharacter, toggleBlacklist, resetConstraints, randomise } = actions;
  const {
    eligibleCount, activeConstraintCount, constraintError, canRandomise,
    availableCategories, availableCharacterKeys, getCharacterLabel,
  } = derived;

  const pinnedCount = [...pinnedSlots].filter((i) => i < 4).length;

  const handleReset = () => {
    if (window.confirm("Reset all constraints?")) resetConstraints();
  };

  return (
    <div className={styles.varA}>
      <div className={styles.varA_topRow}>
        <button className={styles.varA_randomBtn} onClick={randomise} disabled={!canRandomise}>
          Randomise
        </button>

        <button className={styles.varA_toggleBtn} onClick={() => setOpen((o) => !o)}>
          Constraints
          {activeConstraintCount > 0 && (
            <span className={styles.varA_activeBadge}>{activeConstraintCount}</span>
          )}
          <span className={`${styles.varA_caret} ${open ? styles["varA_caret--open"] : ""}`}>▼</span>
        </button>

        <span className={`${styles.varA_poolCount} ${constraintError ? styles["varA_poolCount--warn"] : ""}`}>
          {eligibleCount} eligible
        </span>
      </div>

      {constraintError && <p className={styles.varA_error}>{constraintError}</p>}

      {open && (
        <div className={styles.varA_panel}>
          <div className={styles.varA_section}>
            <span className={styles.varA_sectionLabel}>Build Size</span>
            <div className={styles.varA_sizePills}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  className={`${styles.varA_sizePill} ${buildSize === n ? styles["varA_sizePill--active"] : ""}`}
                  onClick={() => setBuildSize(n)}
                  disabled={n < pinnedCount}
                  title={n < pinnedCount ? `Can't set below ${pinnedCount} pinned perks` : undefined}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.varA_section}>
            <span className={styles.varA_sectionLabel}>
              Categories — click to include, again to exclude, again to clear
            </span>
            <div className={styles.varA_catBadges}>
              {availableCategories.map((cat) => {
                const fs = categoryFilters[cat] ?? "neutral";
                const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ?? "#a8957e";
                return (
                  <button
                    key={cat}
                    className={`${styles.varA_catBadge} ${styles[`varA_catBadge--${fs}`]}`}
                    style={{ color, borderColor: color }}
                    onClick={() => toggleCategory(cat)}
                    title={`${cat}: ${fs}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.varA_section}>
            <span className={styles.varA_sectionLabel}>Characters</span>
            <div className={styles.varA_charPills}>
              {availableCharacterKeys.map((key) => {
                const fs = characterFilters[key] ?? "neutral";
                return (
                  <button
                    key={key}
                    className={`${styles.varA_charPill} ${styles[`varA_charPill--${fs}`]}`}
                    onClick={() => toggleCharacter(key)}
                  >
                    {getCharacterLabel(key)}
                  </button>
                );
              })}
            </div>
          </div>

          {blacklist.size > 0 && (
            <div className={styles.varA_section}>
              <span className={styles.varA_sectionLabel}>Blacklisted ({blacklist.size})</span>
              <div className={styles.varA_chips}>
                {[...blacklist].map((name) => (
                  <span key={name} className={styles.varA_chip}>
                    {name}
                    <button
                      className={styles.varA_chipRemove}
                      onClick={() => toggleBlacklist(name)}
                      aria-label={`Remove ${name} from blacklist`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.varA_panelFooter}>
            <button className={styles.varA_resetBtn} onClick={handleReset}>
              Reset Constraints
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

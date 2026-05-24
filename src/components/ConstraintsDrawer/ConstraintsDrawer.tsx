import { useState } from "react";
import type { ConstraintsActions, ConstraintsDerived, ConstraintsState, FilterState } from "../../hooks/useConstraints";
import styles from "./ConstraintsDrawer.module.scss";

function FilterSection({ label, items, filters, getLabel, onToggle }: {
  label: string;
  items: string[];
  filters: Record<string, FilterState>;
  getLabel: (key: string) => string;
  onToggle: (key: string, value: FilterState) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>{label}</span>
      <div className={styles.filterGrid}>
        {items.map((key) => {
          const displayLabel = getLabel(key);
          const fs = filters[key] ?? "neutral";
          return (
            <div key={key} className={styles.filterRow}>
              <span className={styles.filterLabel}>{displayLabel}</span>
              <button
                className={`${styles.filterBtn} ${fs === "include" ? styles["filterBtn--include"] : ""}`}
                aria-pressed={fs === "include"}
                onClick={() => onToggle(key, "include")}
                aria-label={`Include ${displayLabel}`}
              >
                +
              </button>
              <button
                className={`${styles.filterBtn} ${fs === "exclude" ? styles["filterBtn--exclude"] : ""}`}
                aria-pressed={fs === "exclude"}
                onClick={() => onToggle(key, "exclude")}
                aria-label={`Exclude ${displayLabel}`}
              >
                −
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  state: ConstraintsState;
  actions: ConstraintsActions;
  derived: ConstraintsDerived;
}

export const ConstraintsDrawer = ({ state, actions, derived }: Props) => {
  const [open, setOpen] = useState(false);
  const { buildSize, blacklist, categoryFilters, characterFilters } = state;
  const { setBuildSize, toggleBlacklist, toggleCategory, toggleCharacter, resetConstraints } = actions;
  const { activeConstraintCount, pinnedCount, availableCategories, availableCharacterKeys, getCharacterLabel } = derived;

  return (
    <div className={styles.drawer}>
      <div className={styles.toggleRow}>
        <button
          className={styles.toggle}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          Constraints
          {activeConstraintCount > 0 && (
            <span className={styles.badge}>{activeConstraintCount}</span>
          )}
          <span className={`${styles.caret} ${open ? styles["caret--open"] : ""}`}>▼</span>
        </button>
        {activeConstraintCount > 0 && (
          <button className={styles.resetBtn} onClick={resetConstraints}>
            Reset
          </button>
        )}
      </div>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <div
        className={`${styles.panel} ${open ? styles["panel--open"] : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Constraints</span>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close constraints panel"
            tabIndex={open ? 0 : -1}
          >
            ×
          </button>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Build Size</span>
          <div className={styles.sizePills}>
            {([1, 2, 3, 4] as const).map((n) => (
              <button
                key={n}
                className={`${styles.pill} ${buildSize === n ? styles["pill--active"] : ""}`}
                aria-pressed={buildSize === n}
                onClick={() => setBuildSize(n)}
                disabled={n < pinnedCount}
                tabIndex={open ? 0 : -1}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {blacklist.size > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Banned Perks</span>
            <div className={styles.blacklistChips}>
              {[...blacklist].map((name) => (
                <div key={name} className={styles.chip}>
                  <span className={styles.chipName}>{name}</span>
                  <button
                    className={styles.chipRemove}
                    onClick={() => toggleBlacklist(name)}
                    aria-label={`Remove ${name} from blacklist`}
                    tabIndex={open ? 0 : -1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <FilterSection
          label="Categories"
          items={availableCategories}
          filters={categoryFilters}
          getLabel={(k) => k}
          onToggle={toggleCategory}
        />

        <FilterSection
          label="Characters"
          items={availableCharacterKeys}
          filters={characterFilters}
          getLabel={getCharacterLabel}
          onToggle={toggleCharacter}
        />
      </div>
    </div>
  );
};

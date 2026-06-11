import { useEffect, useRef, useState } from "react";
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
  const included = items.filter((k) => (filters[k] ?? "neutral") === "include");
  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>{label}</span>
      <span className={styles.filterHint}>+ = only selected · − = skip selected</span>
      {included.length > 0 && (
        <span className={styles.filterActive}>Only: {included.map(getLabel).join(", ")}</span>
      )}
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
                aria-label={`Only randomise from ${displayLabel}`}
                title={`Only: restrict pool to ${displayLabel}`}
              >
                +
              </button>
              <button
                className={`${styles.filterBtn} ${fs === "exclude" ? styles["filterBtn--exclude"] : ""}`}
                aria-pressed={fs === "exclude"}
                onClick={() => onToggle(key, "exclude")}
                aria-label={`Exclude ${displayLabel}`}
                title={`Skip: exclude ${displayLabel} from pool`}
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the drawer; focus moves in on open and back on close.
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const { buildSize, blacklist, categoryFilters, characterFilters } = state;
  const { setBuildSize, toggleBlacklist, toggleCategory, toggleCharacter, resetConstraints } = actions;
  const { activeConstraintCount, pinnedCount, availableCategories, availableCharacterKeys, getCharacterLabel } = derived;

  return (
    <div className={styles.drawer}>
      <div className={styles.toggleRow}>
        <button
          ref={toggleRef}
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
        role="dialog"
        aria-label="Randomiser constraints"
      >
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Constraints</span>
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
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

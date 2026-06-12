import { useEffect, useId, useRef, useState } from "react";
import type { ConstraintsActions, ConstraintsDerived, ConstraintsState, FilterState } from "../../hooks/useConstraints";
import styles from "./ConstraintsDrawer.module.scss";

type SectionMode = "anyone" | "only" | "avoid";

const MODE_LABELS: Record<SectionMode, (noun: string) => string> = {
  anyone: (noun) => `Pick from all ${noun}`,
  only: (noun) => `Only use selected ${noun}`,
  avoid: (noun) => `Avoid selected ${noun}`,
};

function FilterSection({ label, noun, items, filters, getLabel, onToggle, focusable }: {
  label: string;
  noun: string; // plural, lowercase — completes the radio sentences ("characters")
  items: string[];
  filters: Record<string, FilterState>;
  getLabel: (key: string) => string;
  onToggle: (key: string, value: FilterState) => void;
  focusable: boolean;
}) {
  const radioGroupName = useId();
  // Only consulted while every item is neutral; once a filter exists the mode
  // is derived from the data so storage-loaded state always displays honestly.
  const [chosenMode, setChosenMode] = useState<SectionMode>("anyone");

  if (items.length === 0) return null;

  const hasInclude = items.some((k) => filters[k] === "include");
  const hasExclude = items.some((k) => filters[k] === "exclude");
  const mode: SectionMode = hasInclude ? "only" : hasExclude ? "avoid" : chosenMode;
  const activeValue: FilterState = mode === "avoid" ? "exclude" : "include";
  const selected = items.filter((k) => filters[k] === activeValue);

  const applyMode = (next: SectionMode) => {
    setChosenMode(next);
    if (next === "anyone") {
      // Toggling an item with its current value resets it to neutral.
      items.forEach((k) => {
        const v = filters[k] ?? "neutral";
        if (v !== "neutral") onToggle(k, v);
      });
    } else {
      const from: FilterState = next === "only" ? "exclude" : "include";
      const to: FilterState = next === "only" ? "include" : "exclude";
      items.forEach((k) => {
        if (filters[k] === from) onToggle(k, to);
      });
    }
  };

  return (
    <fieldset className={styles.sectionFieldset}>
      <legend className={styles.sectionLabel}>{label}</legend>
      <div className={styles.sectionBody}>
        <div className={styles.modeChoices}>
          {(["anyone", "only", "avoid"] as const).map((m) => (
            <label
              key={m}
              className={`${styles.modeChoice} ${mode === m ? styles["modeChoice--active"] : ""}`}
            >
              <input
                type="radio"
                name={radioGroupName}
                checked={mode === m}
                onChange={() => applyMode(m)}
                tabIndex={focusable ? 0 : -1}
              />
              <span>{MODE_LABELS[m](noun)}</span>
            </label>
          ))}
        </div>

        {mode !== "anyone" && (
          <p
            className={`${styles.sectionStatus} ${selected.length === 0 ? styles["sectionStatus--muted"] : ""}`}
            role="status"
          >
            {selected.length === 0
              ? `Nothing ticked — still picking from all ${noun}.`
              : `${mode === "only" ? "Only using" : "Avoiding"}: ${selected.map(getLabel).join(", ")}`}
          </p>
        )}

        <div
          className={[
            styles.choiceGrid,
            mode === "anyone" ? styles["choiceGrid--disabled"] : "",
            mode === "avoid" ? styles["choiceGrid--avoid"] : "",
          ].join(" ")}
          role="group"
          aria-label={`${label} selection`}
        >
          {items.map((key) => (
            <label key={key} className={styles.choiceChip}>
              <input
                type="checkbox"
                checked={filters[key] === activeValue}
                disabled={mode === "anyone"}
                onChange={() => onToggle(key, activeValue)}
                tabIndex={focusable ? 0 : -1}
              />
              <span className={styles.choiceName}>{getLabel(key)}</span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

interface Props {
  state: ConstraintsState;
  actions: ConstraintsActions;
  derived: ConstraintsDerived;
}

export const ConstraintsDrawer = ({ state, actions, derived }: Props) => {
  const [open, setOpen] = useState(false);
  // Remounts the filter sections so their mode radios snap back to "Pick from all".
  const [resetSeq, setResetSeq] = useState(0);
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
  const {
    activeConstraintCount, pinnedCount, availableCategories, availableCharacterKeys,
    getCharacterLabel, eligibleCount, constraintError,
  } = derived;

  const handleReset = () => {
    resetConstraints();
    setResetSeq((n) => n + 1);
  };

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
          <button className={styles.resetBtn} onClick={handleReset}>
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

        <p
          className={`${styles.poolStatus} ${constraintError ? styles["poolStatus--error"] : ""}`}
          role="status"
        >
          {constraintError ?? `${eligibleCount} perk${eligibleCount !== 1 ? "s" : ""} eligible for randomising`}
        </p>

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
          key={`categories-${resetSeq}`}
          label="Categories"
          noun="categories"
          items={availableCategories}
          filters={categoryFilters}
          getLabel={(k) => k}
          onToggle={toggleCategory}
          focusable={open}
        />

        <FilterSection
          key={`characters-${resetSeq}`}
          label="Characters"
          noun="characters"
          items={availableCharacterKeys}
          filters={characterFilters}
          getLabel={getCharacterLabel}
          onToggle={toggleCharacter}
          focusable={open}
        />
      </div>
    </div>
  );
};

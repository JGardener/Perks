import { useState } from "react";
import type { ConstraintsActions, ConstraintsDerived, ConstraintsState } from "../../hooks/useConstraints";
import styles from "./ConstraintsDrawer.module.scss";

interface Props {
  state: ConstraintsState;
  actions: ConstraintsActions;
  derived: ConstraintsDerived;
}

export const ConstraintsDrawer = ({ state, actions, derived }: Props) => {
  const [open, setOpen] = useState(false);
  const { buildSize } = state;
  const { setBuildSize } = actions;
  const { activeConstraintCount, pinnedCount } = derived;

  return (
    <div className={styles.drawer}>
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

      {open && (
        <div className={styles.panel}>
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
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

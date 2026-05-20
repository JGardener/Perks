import type { PerkCategory } from "../../types/dbd";
import { CATEGORY_COLORS } from "../../utils/categoryColors";
import styles from "./CategoryFilter.module.scss";

interface CategoryFilterProps {
  available: PerkCategory[];
  active: Set<PerkCategory>;
  onToggle: (category: PerkCategory) => void;
  onClear: () => void;
}

export const CategoryFilter = ({ available, active, onToggle, onClear }: CategoryFilterProps) => {
  return (
    <div className={styles.categoryFilter} role="group" aria-label="Filter by category">
      <span className={styles.label}>Filter</span>
      <div className={styles.buttons}>
        {available.map((cat) => {
          const color = CATEGORY_COLORS[cat];
          const isActive = active.has(cat);
          return (
            <button
              key={cat}
              className={`${styles.button} ${isActive ? styles["button--active"] : ""}`}
              style={{ "--cat-color": color } as React.CSSProperties}
              onClick={() => onToggle(cat)}
              aria-pressed={isActive}
            >
              {cat}
            </button>
          );
        })}
        {active.size > 0 && (
          <button className={styles.clear} onClick={onClear} aria-label="Clear category filter">
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

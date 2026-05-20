import type { Grade } from "../../types/dbd";
import { GRADE_COLORS } from "../../utils/gradeColors";
import styles from "./RatingFilter.module.scss";

export type RatingFilterValue = Grade | "unrated";

export { GRADE_COLORS };

const GRADES: Grade[] = ["A", "B", "C", "D", "E", "F"];

interface RatingFilterProps {
  active: Set<RatingFilterValue>;
  onToggle: (value: RatingFilterValue) => void;
  onClear: () => void;
}

export const RatingFilter = ({ active, onToggle, onClear }: RatingFilterProps) => {
  return (
    <div className={styles.ratingFilter} role="group" aria-label="Filter by rating">
      <span className={styles.label}>Rating</span>
      <div className={styles.buttons}>
        {GRADES.map((grade) => {
          const color = GRADE_COLORS[grade];
          const isActive = active.has(grade);
          return (
            <button
              key={grade}
              className={`${styles.button} ${isActive ? styles["button--active"] : ""}`}
              style={{ "--grade-color": color } as React.CSSProperties}
              onClick={() => onToggle(grade)}
              aria-pressed={isActive}
            >
              {grade}
            </button>
          );
        })}
        <button
          className={`${styles.button} ${styles["button--unrated"]} ${active.has("unrated") ? styles["button--active"] : ""}`}
          onClick={() => onToggle("unrated")}
          aria-pressed={active.has("unrated")}
        >
          Unrated
        </button>
        {active.size > 0 && (
          <button className={styles.clear} onClick={onClear} aria-label="Clear rating filter">
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

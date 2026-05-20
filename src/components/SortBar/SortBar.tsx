import styles from "./SortBar.module.scss";

export type SortField = "name" | "character" | "grade";
export type SortDirection = "asc" | "desc";

interface SortBarProps {
  sortBy: SortField;
  direction: SortDirection;
  onSortChange: (field: SortField) => void;
  onDirectionToggle: () => void;
  characterLabel: string;
}

export const SortBar = ({ sortBy, direction, onSortChange, onDirectionToggle, characterLabel }: SortBarProps) => {
  const sortOptions: { value: SortField; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "character", label: characterLabel },
    { value: "grade", label: "Grade" },
  ];

  return (
    <div className={styles.sortBar} role="toolbar" aria-label="Sort options">
      <span className={styles.sortBar__label} id="sort-label">Sort by</span>
      <div className={styles.sortBar__options} role="group" aria-labelledby="sort-label">
        {sortOptions.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.sortBar__option} ${sortBy === value ? styles["sortBar__option--active"] : ""}`}
            onClick={() => onSortChange(value)}
            aria-pressed={sortBy === value}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        className={styles.sortBar__direction}
        onClick={onDirectionToggle}
        aria-label={`Sort ${direction === "asc" ? "ascending" : "descending"} — click to reverse`}
      >
        {direction === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
};

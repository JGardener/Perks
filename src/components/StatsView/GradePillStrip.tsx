import type { Grade } from "../../types/dbd";
import { GRADE_COLORS } from "../../utils/gradeColors";
import styles from "./StatsView.module.scss";

export interface GradePillStripProps {
  distribution: { grade: Grade; count: number; pct: number }[];
}

export const GradePillStrip = ({ distribution }: GradePillStripProps) => {
  const maxPct = Math.max(...distribution.map((d) => d.pct), 1);

  return (
    <ul className={styles.pillStrip} aria-label="Community grade distribution">
      {distribution.map(({ grade, count, pct }) => {
        const color = GRADE_COLORS[grade];
        const barW = count === 0 ? 0 : Math.max(4, Math.round((pct / maxPct) * 52));
        return (
          <li
            key={grade}
            className={styles.pill}
            style={{ borderColor: `${color}55` }}
            title={`${count} votes`}
          >
            <span className={styles.pill__grade} style={{ color }}>
              {grade}
            </span>
            <span className={styles.pill__bar} style={{ width: barW, background: color }} />
            <span className={styles.pill__pct}>{pct}%</span>
          </li>
        );
      })}
    </ul>
  );
};

import type { Grade } from "../../types/dbd";
import { GRADE_COLORS } from "../../utils/gradeColors";
import styles from "./StatsView.module.scss";

export interface GradeChartProps {
  distribution: { grade: Grade; count: number; pct: number }[];
  ratedCount: number;
}

const ROW_HEIGHT = 28;
const BAR_X = 28;
const BAR_MAX_W = 490;
const COUNT_LABEL_X = 530;
const TOTAL_W = 600;

export const GradeChart = ({ distribution, ratedCount }: GradeChartProps) => {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);
  const svgHeight = distribution.length * ROW_HEIGHT;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${TOTAL_W} ${svgHeight}`}
      aria-label="Grade distribution bar chart"
      role="img"
    >
      <title>Grade distribution</title>
      {distribution.map(({ grade, count, pct }, i) => {
        const y = i * ROW_HEIGHT;
        const cy = y + ROW_HEIGHT / 2;
        const barW = count === 0 ? 0 : Math.max(2, Math.round((count / maxCount) * BAR_MAX_W));

        return (
          <g key={grade}>
            <text
              x={0}
              y={cy}
              className={styles.chart__gradeLabel}
              aria-label={`Grade ${grade}`}
            >
              {grade}
            </text>

            <rect
              x={BAR_X}
              y={y + 6}
              width={BAR_MAX_W}
              height={ROW_HEIGHT - 12}
              rx={2}
              className={styles.chart__barBg}
            />

            {count > 0 && (
              <rect
                x={BAR_X}
                y={y + 6}
                width={barW}
                height={ROW_HEIGHT - 12}
                rx={2}
                fill={GRADE_COLORS[grade]}
                aria-label={`${count} perks rated ${grade} (${pct}%)`}
              />
            )}

            <text
              x={COUNT_LABEL_X}
              y={cy}
              className={styles.chart__countLabel}
            >
              {ratedCount > 0 ? `${count} (${pct}%)` : "—"}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

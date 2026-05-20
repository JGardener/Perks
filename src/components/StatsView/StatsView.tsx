import { useMemo } from "react";
import type { Grade, Perk } from "../../types/dbd";
import { GRADE_ORDER } from "../../utils/gradeColors";
import { GradeChart } from "./GradeChart";
import { TopPerks } from "./TopPerks";
import styles from "./StatsView.module.scss";

export interface StatsViewProps {
  perks: Perk[];
  ratings: Record<string, Grade>;
}

const GRADES: Grade[] = (Object.entries(GRADE_ORDER) as [Grade, number][])
  .sort(([, a], [, b]) => a - b)
  .map(([g]) => g);

interface RoleStat {
  role: "survivor" | "killer";
  label: string;
  totalPerks: number;
  ratedCount: number;
  distribution: { grade: Grade; count: number; pct: number }[];
  topPerks: Perk[];
}

function buildRoleStat(
  role: "survivor" | "killer",
  label: string,
  perks: Perk[],
  ratings: Record<string, Grade>,
): RoleStat {
  const rolePerks = perks.filter((p) => p.role === role);
  const totalPerks = rolePerks.length;
  const ratedPerks = rolePerks.filter((p) => ratings[p.name] !== undefined);
  const ratedCount = ratedPerks.length;

  const counts: Record<Grade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  for (const perk of ratedPerks) {
    counts[ratings[perk.name]]++;
  }

  const distribution = GRADES.map((grade) => ({
    grade,
    count: counts[grade],
    pct: ratedCount > 0 ? Math.round((counts[grade] / ratedCount) * 100) : 0,
  }));

  const topPerks = rolePerks
    .filter((p) => ratings[p.name] === "A")
    .sort((a, b) => a.name.localeCompare(b.name));

  return { role, label, totalPerks, ratedCount, distribution, topPerks };
}

export const StatsView = ({ perks, ratings }: StatsViewProps) => {
  const totalRated = useMemo(() => Object.keys(ratings).length, [ratings]);

  const survivorStat = useMemo(
    () => buildRoleStat("survivor", "Survivor", perks, ratings),
    [perks, ratings],
  );

  const killerStat = useMemo(
    () => buildRoleStat("killer", "Killer", perks, ratings),
    [perks, ratings],
  );

  if (totalRated === 0) {
    return (
      <section className={styles.statsView} aria-label="Stats">
        <div className={styles.emptyState}>
          <h2 className={styles.emptyState__heading}>No ratings yet</h2>
          <p className={styles.emptyState__body}>
            Head to the Perks tab and grade some perks — your stats will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.statsView} aria-label="Stats">
      {[survivorStat, killerStat].map((stat) => (
        <div key={stat.role} className={styles.roleSection}>
          <h2 className={styles.roleSection__heading}>{stat.label} Perks</h2>
          <p className={styles.ratedCount}>
            {stat.ratedCount} / {stat.totalPerks} rated
          </p>
          <GradeChart distribution={stat.distribution} ratedCount={stat.ratedCount} />
          {stat.topPerks.length > 0 && <TopPerks perks={stat.topPerks} />}
        </div>
      ))}
    </section>
  );
};

import { useMemo } from "react";
import { useAuthModal } from "../../context/AuthModalContext";
import { useAuth } from "../../hooks/useAuth";
import type { CommunityGrade, Grade, Perk } from "../../types/dbd";
import { getCommunityTopPerks } from "../../utils/communityPerks";
import { GRADE_COLORS } from "../../utils/gradeColors";
import { GRADE_ORDER } from "../../utils/gradeColors";
import { GradeChart } from "./GradeChart";
import { GradePillStrip } from "./GradePillStrip";
import { TopPerks } from "./TopPerks";
import styles from "./StatsView.module.scss";

export interface StatsViewProps {
  perks: Perk[];
  ratings: Record<string, Grade>;
  communityGrades: CommunityGrade[];
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

function buildCommunityDist(
  communityGrades: CommunityGrade[],
  perks: Perk[],
  role: "survivor" | "killer",
): { grade: Grade; count: number; pct: number }[] {
  const roleNames = new Set(perks.filter((p) => p.role === role).map((p) => p.name));
  const counts: Record<Grade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  let totalVotes = 0;
  for (const cg of communityGrades) {
    if (roleNames.has(cg.perk_name)) {
      counts[cg.grade] += cg.count;
      totalVotes += cg.count;
    }
  }
  return GRADES.map((grade) => ({
    grade,
    count: counts[grade],
    pct: totalVotes > 0 ? Math.round((counts[grade] / totalVotes) * 100) : 0,
  }));
}

const GhostPillStrip = () => (
  <ul className={`${styles.pillStrip} ${styles["pillStrip--ghost"]}`} aria-hidden="true">
    {GRADES.map((grade) => (
      <li key={grade} className={styles.pill}>
        <span className={styles.pill__grade}>{grade}</span>
        <span className={styles.pill__bar} style={{ width: 28 }} />
        <span className={styles.pill__pct}>—%</span>
      </li>
    ))}
  </ul>
);

export const StatsView = ({ perks, ratings, communityGrades }: StatsViewProps) => {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const totalRated = useMemo(() => Object.keys(ratings).length, [ratings]);

  const survivorStat = useMemo(
    () => buildRoleStat("survivor", "Survivor", perks, ratings),
    [perks, ratings],
  );
  const killerStat = useMemo(
    () => buildRoleStat("killer", "Killer", perks, ratings),
    [perks, ratings],
  );
  const survivorCommDist = useMemo(
    () => buildCommunityDist(communityGrades, perks, "survivor"),
    [communityGrades, perks],
  );
  const killerCommDist = useMemo(
    () => buildCommunityDist(communityGrades, perks, "killer"),
    [communityGrades, perks],
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

  const isAuthed = !!user;
  const hasCommunity = communityGrades.length > 0;

  return (
    <section className={styles.statsView} aria-label="Stats">
      {(
        [
          { stat: survivorStat, commDist: survivorCommDist },
          { stat: killerStat, commDist: killerCommDist },
        ] as const
      ).map(({ stat, commDist }) => {
        const communityTopPerks = getCommunityTopPerks(communityGrades, perks, stat.role);
        return (
          <div key={stat.role} className={styles.roleSection}>
            <h2 className={styles.roleSection__heading}>{stat.label} Perks</h2>
            <p className={styles.ratedCount}>
              {stat.ratedCount} / {stat.totalPerks} rated
            </p>

            <GradeChart distribution={stat.distribution} ratedCount={stat.ratedCount} />
            {stat.topPerks.length > 0 && <TopPerks perks={stat.topPerks} />}

            <p className={styles.communityLabel}>
              Community distribution
              {!isAuthed && (
                <button
                  className={styles.signInLink}
                  onClick={() => openAuthModal("Sign in to see community grades")}
                >
                  Sign in to unlock →
                </button>
              )}
            </p>

            {isAuthed && hasCommunity ? (
              <>
                <GradePillStrip distribution={commDist} />
                {communityTopPerks.length > 0 && (
                  <TopPerks perks={communityTopPerks} heading="Community's Top Picks" />
                )}
              </>
            ) : (
              !isAuthed && <GhostPillStrip />
            )}
          </div>
        );
      })}
    </section>
  );
};

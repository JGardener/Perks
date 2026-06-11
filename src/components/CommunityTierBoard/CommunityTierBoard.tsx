import { useMemo } from "react";
import type { Grade, Perk } from "../../types/dbd";
import type { ConsensusGrade } from "../../utils/communityConsensus";
import { GRADE_COLORS } from "../../utils/gradeColors";
import { GRADES } from "../../utils/statsUtils";
import { getPerkImageUrl } from "../../utils/perkUtils";
import styles from "./CommunityTierBoard.module.scss";

interface CommunityTierBoardProps {
  perks: Perk[];
  consensusMap: Map<string, ConsensusGrade>;
  onSelect: (perk: Perk) => void;
}

// The community's verdict as a tier list: one band per grade, filled
// with the perks whose consensus lands there, busiest perks first.
export const CommunityTierBoard = ({ perks, consensusMap, onSelect }: CommunityTierBoardProps) => {
  const rows = useMemo(() => {
    const byGrade = new Map<Grade, { perk: Perk; votes: number }[]>(GRADES.map((g) => [g, []]));
    for (const perk of perks) {
      const consensus = consensusMap.get(perk.name);
      if (!consensus) continue;
      byGrade.get(consensus.grade)!.push({ perk, votes: consensus.votes });
    }
    for (const list of byGrade.values()) list.sort((a, b) => b.votes - a.votes);
    return GRADES.map((grade) => ({ grade, entries: byGrade.get(grade)! }));
  }, [perks, consensusMap]);

  return (
    <div className={styles.board}>
      {rows.map(({ grade, entries }) => (
        <div
          key={grade}
          className={styles.row}
          style={{ "--grade-color": GRADE_COLORS[grade] } as React.CSSProperties}
        >
          <span className={styles.gradeLabel} aria-hidden="true">
            {grade}
          </span>
          <ul className={styles.icons} aria-label={`Community grade ${grade} perks`}>
            {entries.length === 0 ? (
              <li className={styles.empty}>—</li>
            ) : (
              entries.map(({ perk, votes }) => (
                <li key={perk.name}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => onSelect(perk)}
                    aria-label={`${perk.name} — community grade ${grade}, ${votes} vote${votes === 1 ? "" : "s"}`}
                    title={`${perk.name} · ${votes} vote${votes === 1 ? "" : "s"}`}
                  >
                    <span className={styles.octa}>
                      <img
                        src={getPerkImageUrl(perk.image)}
                        alt=""
                        onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
                      />
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

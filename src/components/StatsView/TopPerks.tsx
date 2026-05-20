import type { Perk } from "../../types/dbd";
import { getPerkImageUrl } from "../../utils/perkUtils";
import styles from "./StatsView.module.scss";

export interface TopPerksProps {
  perks: Perk[];
}

export const TopPerks = ({ perks }: TopPerksProps) => {
  return (
    <div className={styles.topPerks}>
      <h3 className={styles.topPerks__heading}>A-Grade Perks</h3>
      <ul className={styles.topPerks__list} aria-label="A-grade perks">
        {perks.map((perk) => (
          <li key={perk.name} className={styles.topPerks__item}>
            <div className={styles.topPerks__octa} aria-hidden="true">
              <img
                className={styles.topPerks__img}
                src={getPerkImageUrl(perk.image)}
                alt=""
                onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
              />
            </div>
            <span className={styles.topPerks__name}>{perk.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

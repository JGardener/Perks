import type { Grade, Perk } from "../../types/dbd";
import { getCategoryColor } from "../../utils/categoryColors";
import { getPerkImageUrl, resolveDescription } from "../../utils/perkUtils";
import styles from "./PerkCard.module.scss";

const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E', 'F'];

interface PerkCardProps {
  perk: Perk;
  characterName: string | null;
  rating: Grade | null;
  onRate: (grade: Grade | null) => void;
  onClick: () => void;
}

export const PerkCard = ({ perk, characterName, rating, onRate, onClick }: PerkCardProps) => {
  const categoryColor = getCategoryColor(perk.categories);
  return (
    <div
      className={`${styles.perkCard} ${rating ? styles["perkCard--rated"] : ""}`}
      onClick={onClick}
      style={categoryColor ? { '--category-color': categoryColor } as React.CSSProperties : undefined}
    >
      <div className={styles["perkCard__imageWrapper"]}>
        <img
          className={styles["perkCard__image"]}
          src={getPerkImageUrl(perk.image)}
          alt={perk.name}
          onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
        />
      </div>
      <div className={styles["perkCard__body"]}>
        <h2 className={styles["perkCard__title"]}>{perk.name}</h2>
        {characterName && <h3 className={styles["perkCard__character"]}>{characterName}</h3>}
        <p
          className={styles["perkCard__description"]}
          dangerouslySetInnerHTML={{ __html: resolveDescription(perk.description, perk.tunables) }}
        />
        <div className={styles["perkCard__rater"]} onClick={(e) => e.stopPropagation()}>
          {GRADES.map((grade) => (
            <button
              key={grade}
              className={`${styles["perkCard__grade"]} ${rating === grade ? styles["perkCard__grade--active"] : ""}`}
              onClick={() => onRate(rating === grade ? null : grade)}
              aria-label={`Rate ${perk.name} ${grade}`}
              aria-pressed={rating === grade}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

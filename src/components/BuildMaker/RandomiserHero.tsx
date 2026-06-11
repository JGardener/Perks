import type { ConstraintsActions, ConstraintsDerived, ConstraintsState } from "../../hooks/useConstraints";
import { BloodwebBackdrop } from "../BloodwebBackdrop/BloodwebBackdrop";
import { ConstraintsDrawer } from "../ConstraintsDrawer/ConstraintsDrawer";
import styles from "./RandomiserHero.module.scss";

interface RandomiserHeroProps {
  onRandomise: () => void;
  constraints: ConstraintsState;
  constraintActions: ConstraintsActions;
  constraintDerived: ConstraintsDerived;
}

// The randomiser is the page's headline act: one giant breathing CTA
// at the top of /build, with the constraints drawer hanging off it.
export const RandomiserHero = ({
  onRandomise,
  constraints,
  constraintActions,
  constraintDerived,
}: RandomiserHeroProps) => {
  const { canRandomise, eligibleCount, constraintError } = constraintDerived;

  return (
    <section className={styles.hero} aria-label="Build randomiser">
      <BloodwebBackdrop variant="dim" />
      <div className={styles.content}>
        <div className={styles.ctaRow}>
          <button className={styles.cta} onClick={onRandomise} disabled={!canRandomise}>
            Randomise Build
          </button>
          <ConstraintsDrawer
            state={constraints}
            actions={constraintActions}
            derived={constraintDerived}
          />
        </div>
        <p
          className={`${styles.status} ${constraintError ? styles["status--warn"] : ""}`}
          role="status"
        >
          {constraintError ?? `${eligibleCount} perk${eligibleCount !== 1 ? "s" : ""} in the pool`}
        </p>
      </div>
    </section>
  );
};

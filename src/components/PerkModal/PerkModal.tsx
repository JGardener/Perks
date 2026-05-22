import { useEffect, useRef } from "react";
import type { Grade, Perk } from "../../types/dbd";
import { useAuthModal } from "../../context/AuthModalContext";
import { useAuth } from "../../hooks/useAuth";
import { getCategoryColor } from "../../utils/categoryColors";
import { getPerkImageUrl, resolveDescription } from "../../utils/perkUtils";
import styles from "./PerkModal.module.scss";

const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E', 'F'];

interface PerkModalProps {
  perk: Perk;
  characterName: string | null;
  rating: Grade | null;
  onRate: (grade: Grade | null) => void;
  onClose: () => void;
}

export const PerkModal = ({ perk, characterName, rating, onRate, onClose }: PerkModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(
        "button, [href], [tabindex]:not([tabindex='-1'])",
      ),
    ).filter((el) => !el.hasAttribute("disabled"));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", onKey);
    first?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const handleGrade = (grade: Grade) =>
    user ? onRate(rating === grade ? null : grade) : openAuthModal("Sign in to rate perks");
  const modalId = "perk-modal-title";
  const categoryColor = getCategoryColor(perk.categories);

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        style={categoryColor ? { '--category-color': categoryColor } as React.CSSProperties : undefined}
        aria-labelledby={modalId}
        ref={modalRef}
      >
        <button className={styles.close} onClick={onClose} aria-label="Close perk details">
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.imageWrapper}>
            <img
              className={styles.image}
              src={getPerkImageUrl(perk.image)}
              alt={perk.name}
              onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
            />
          </div>
          <div className={styles.meta}>
            <h2 id={modalId} className={styles.title}>{perk.name}</h2>
            {characterName && <p className={styles.character}>{characterName}</p>}
          </div>
        </div>

        <p
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: resolveDescription(perk.description, perk.tunables) }}
        />

        <div className={styles.rater} role="group" aria-label={`Rate ${perk.name}`}>
          {GRADES.map((grade) => (
            <button
              key={grade}
              className={`${styles.grade} ${rating === grade ? styles["grade--active"] : ""}`}
              onClick={() => handleGrade(grade)}
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

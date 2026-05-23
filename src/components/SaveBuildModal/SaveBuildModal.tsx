import { useEffect, useState } from "react";
import type { Perk } from "../../types/dbd";
import styles from "./SaveBuildModal.module.scss";

interface SaveBuildModalProps {
  slots: (Perk | null)[];
  onSave: (name: string) => void;
  onClose: () => void;
}

export const SaveBuildModal = ({ slots, onSave, onClose }: SaveBuildModalProps) => {
  const [name, setName] = useState("");
  const hasEmptySlots = slots.some((s) => s === null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <div role="presentation" className={styles.overlay}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-modal-title"
        className={styles.modal}
      >
        <h2 id="save-modal-title" className={styles.title}>Save Build</h2>
        <button className={styles.closeBtn} aria-label="Close" onClick={onClose}>✕</button>

        {hasEmptySlots && (
          <p className={styles.warning}>Some slots are empty — this build will save with fewer than 4 perks.</p>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Build name
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </label>
          <button className={styles.saveBtn} type="submit" disabled={!name.trim()}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

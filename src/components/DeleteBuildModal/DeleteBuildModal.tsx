import { useEffect } from "react";
import styles from "./DeleteBuildModal.module.scss";

interface DeleteBuildModalProps {
  buildName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteBuildModal = ({ buildName, onConfirm, onClose }: DeleteBuildModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="presentation" className={styles.overlay}>
      <div role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" className={styles.modal}>
        <h2 id="delete-modal-title" className={styles.title}>Delete {buildName}?</h2>
        <p className={styles.body}>This cannot be undone.</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

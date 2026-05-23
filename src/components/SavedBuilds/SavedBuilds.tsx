import { useState } from "react";
import type { Build, Perk } from "../../types/dbd";
import { DeleteBuildModal } from "../DeleteBuildModal/DeleteBuildModal";
import { getPerkImageUrl } from "../../utils/perkUtils";
import styles from "./SavedBuilds.module.scss";

const OCTAGON = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

interface SavedBuildsProps {
  builds: Build[];
  role: "survivor" | "killer";
  perks: Perk[];
  userId: string | null;
  onOpenAuthModal: () => void;
  isCurrentBuildEmpty: boolean;
  onLoad: (build: Build) => void;
  onDelete: (id: string) => void;
}

interface SavedBuildCardProps {
  build: Build;
  perks: Perk[];
  isCurrentBuildEmpty: boolean;
  pendingLoadId: string | null;
  onLoadClick: (build: Build) => void;
  onLoadConfirm: () => void;
  onLoadCancel: () => void;
  onDeleteClick: (build: Build) => void;
}

const SavedBuildCard = ({
  build,
  perks,
  isCurrentBuildEmpty,
  pendingLoadId,
  onLoadClick,
  onLoadConfirm,
  onLoadCancel,
  onDeleteClick,
}: SavedBuildCardProps) => {
  const perkMap = new Map(perks.map((p) => [p.name, p]));
  const slots = Array.from({ length: 4 }, (_, i) => {
    const name = build.perks[i] ?? null;
    return name ? (perkMap.get(name) ?? null) : null;
  });
  const isPending = pendingLoadId === build.id;

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardName}>{build.name}</span>
        <div className={styles.iconStrip}>
          {slots.map((perk, i) => (
            <div
              key={i}
              className={`${styles.iconSlot} ${!perk ? styles.iconSlotEmpty : ""}`}
              style={{ clipPath: OCTAGON }}
            >
              {perk && (
                <img
                  className={styles.iconImg}
                  style={{ clipPath: OCTAGON }}
                  src={getPerkImageUrl(perk.image)}
                  alt={perk.name}
                  onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
                />
              )}
            </div>
          ))}
        </div>
        <div className={styles.cardActions}>
          <button
            className={styles.loadBtn}
            onClick={() => {
              if (isCurrentBuildEmpty) {
                onLoadClick(build);
              } else {
                onLoadClick(build);
              }
            }}
          >
            Load
          </button>
          <button className={styles.deleteBtn} onClick={() => onDeleteClick(build)}>
            Delete
          </button>
        </div>
      </div>

      {isPending && (
        <div className={styles.confirmRow}>
          <p className={styles.confirmMsg}>Replace build in progress?</p>
          <button className={styles.replaceBtn} onClick={onLoadConfirm}>Replace</button>
          <button className={styles.cancelConfirmBtn} onClick={onLoadCancel}>Cancel</button>
        </div>
      )}
    </>
  );
};

export const SavedBuilds = ({
  builds,
  role,
  perks,
  userId,
  onOpenAuthModal,
  isCurrentBuildEmpty,
  onLoad,
  onDelete,
}: SavedBuildsProps) => {
  const [pendingLoad, setPendingLoad] = useState<Build | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Build | null>(null);

  const roleBuilds = builds.filter((b) => b.role === role);

  const handleLoadClick = (build: Build) => {
    if (isCurrentBuildEmpty) {
      onLoad(build);
    } else {
      setPendingLoad(build);
    }
  };

  const handleLoadConfirm = () => {
    if (pendingLoad) {
      onLoad(pendingLoad);
      setPendingLoad(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (pendingDelete) {
      onDelete(pendingDelete.id);
      setPendingDelete(null);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Your Builds</h2>

      {!userId ? (
        <p className={styles.prompt}>
          <button className={styles.promptLink} onClick={onOpenAuthModal}>Sign in</button>
          {" "}to save and load builds.
        </p>
      ) : roleBuilds.length === 0 ? (
        <p className={styles.emptyState}>No saved builds yet. Build something and hit Save.</p>
      ) : (
        <div className={styles.list}>
          {roleBuilds.map((build) => (
            <SavedBuildCard
              key={build.id}
              build={build}
              perks={perks}
              isCurrentBuildEmpty={isCurrentBuildEmpty}
              pendingLoadId={pendingLoad?.id ?? null}
              onLoadClick={handleLoadClick}
              onLoadConfirm={handleLoadConfirm}
              onLoadCancel={() => setPendingLoad(null)}
              onDeleteClick={setPendingDelete}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <DeleteBuildModal
          buildName={pendingDelete.name}
          onConfirm={handleDeleteConfirm}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
};

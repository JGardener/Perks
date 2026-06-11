import { useMemo, useState } from "react";
import { CommunityTierBoard } from "../../components/CommunityTierBoard/CommunityTierBoard";
import { ErrorBoundary } from "../../components/ErrorBoundary/ErrorBoundary";
import { PerkModal } from "../../components/PerkModal/PerkModal";
import { RoleToggle } from "../../components/RoleToggle/RoleToggle";
import { GradeChart } from "../../components/StatsView/GradeChart";
import { GradePillStrip } from "../../components/StatsView/GradePillStrip";
import { TopPerks } from "../../components/StatsView/TopPerks";
import { useAppData } from "../../context/AppDataContext";
import { useAuthModal } from "../../context/AuthModalContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useRoleParam } from "../../hooks/useRoleParam";
import type { Perk } from "../../types/dbd";
import { getCommunityTopPerks } from "../../utils/communityPerks";
import { GRADES, buildCommunityDist, buildRoleStat } from "../../utils/statsUtils";
import statStyles from "../../components/StatsView/StatsView.module.scss";
import styles from "./CommunityPage.module.scss";
import pageStyles from "../PerksPage/PerksPage.module.scss";

// Ghosted placeholder rows shown to signed-out visitors.
const GHOST_COUNTS = [6, 9, 7, 5, 3, 2];

const GhostBoard = () => (
  <div className={styles.ghostBoard} aria-hidden="true">
    {GRADES.map((grade, row) => (
      <div key={grade} className={styles.ghostRow}>
        <span className={styles.ghostGrade}>{grade}</span>
        <span className={styles.ghostIcons}>
          {Array.from({ length: GHOST_COUNTS[row] }, (_, i) => (
            <span key={i} className={styles.ghostOcta} />
          ))}
        </span>
      </div>
    ))}
  </div>
);

export const CommunityPage = () => {
  usePageTitle("Community Tiers");
  const {
    perks,
    survivorPerks,
    killerPerks,
    characterMap,
    dataLoading,
    dataError,
    retryAll,
    ratings,
    setRating,
    communityGrades,
    consensusMap,
    user,
  } = useAppData();
  const { openAuthModal } = useAuthModal();
  const [role, setRole] = useRoleParam();
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);

  const roleLabel = role === "killer" ? "Killer" : "Survivor";
  const rolePerks = role === "survivor" ? survivorPerks : killerPerks;

  const roleStat = useMemo(
    () => buildRoleStat(role, roleLabel, perks, ratings),
    [role, roleLabel, perks, ratings],
  );
  const commDist = useMemo(
    () => buildCommunityDist(communityGrades, perks, role),
    [communityGrades, perks, role],
  );
  const communityTopPerks = useMemo(
    () => getCommunityTopPerks(communityGrades, perks, role),
    [communityGrades, perks, role],
  );

  if (dataError)
    return (
      <div className={pageStyles.status}>
        <p role="alert">Failed to load perks. Please check your connection and try again.</p>
        <button onClick={retryAll}>Try again</button>
      </div>
    );
  if (dataLoading)
    return (
      <div className={pageStyles.status}>
        <p aria-busy="true" aria-live="polite">Loading…</p>
      </div>
    );

  const isAuthed = !!user;
  const hasCommunity = communityGrades.length > 0;
  const selectedCharacterName =
    selectedPerk?.character != null ? (characterMap[selectedPerk.character] ?? null) : null;

  return (
    <ErrorBoundary label="Community">
      <section className={styles.page} aria-label="Community tiers">
        <header className={styles.header}>
          <h1 className={styles.title}>Community Tiers</h1>
          <p className={styles.subtitle}>How the fog rates every {roleLabel.toLowerCase()} perk</p>
        </header>

        <RoleToggle role={role} onChange={setRole} />

        {isAuthed && hasCommunity ? (
          <>
            <CommunityTierBoard
              perks={rolePerks}
              consensusMap={consensusMap}
              onSelect={setSelectedPerk}
            />
            <h2 className={styles.sectionHeading}>Vote distribution</h2>
            <GradePillStrip distribution={commDist} />
            {communityTopPerks.length > 0 && (
              <TopPerks perks={communityTopPerks} heading="Community's Top Picks" />
            )}
          </>
        ) : (
          <div className={styles.ghostWrap}>
            <GhostBoard />
            <div className={styles.nudgePanel}>
              <p className={styles.nudgeText}>
                Community tiers are built from every player's ratings.
              </p>
              {!isAuthed ? (
                <button
                  className={styles.nudgeBtn}
                  onClick={() => openAuthModal("Sign in to see community grades")}
                >
                  Sign in to unlock
                </button>
              ) : (
                <p className={styles.nudgeText}>No community votes yet — be the first to rate.</p>
              )}
            </div>
          </div>
        )}

        <section className={styles.yourSection} aria-label="Your ratings">
          <h2 className={styles.sectionHeading}>Your {roleLabel} Ratings</h2>
          {roleStat.ratedCount > 0 ? (
            <>
              <p className={statStyles.ratedCount}>
                {roleStat.ratedCount} / {roleStat.totalPerks} rated
              </p>
              <GradeChart distribution={roleStat.distribution} ratedCount={roleStat.ratedCount} />
              {roleStat.topPerks.length > 0 && <TopPerks perks={roleStat.topPerks} />}
            </>
          ) : (
            <p className={styles.nudgeText}>
              You haven't rated any {roleLabel.toLowerCase()} perks yet — head to Perks and grade a few.
            </p>
          )}
        </section>

        {selectedPerk && (
          <PerkModal
            perk={selectedPerk}
            characterName={selectedCharacterName}
            rating={ratings[selectedPerk.name] ?? null}
            onRate={(grade) => setRating(selectedPerk.name, grade)}
            onClose={() => setSelectedPerk(null)}
          />
        )}
      </section>
    </ErrorBoundary>
  );
};

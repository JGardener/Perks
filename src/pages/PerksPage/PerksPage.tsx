import { ErrorBoundary } from "../../components/ErrorBoundary/ErrorBoundary";
import { PerkSection } from "../../components/PerkSection/PerkSection";
import { RoleToggle } from "../../components/RoleToggle/RoleToggle";
import { useAppData } from "../../context/AppDataContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useRoleParam } from "../../hooks/useRoleParam";
import styles from "./PerksPage.module.scss";

export const PerksPage = () => {
  usePageTitle("Browse Perks");
  const { survivorPerks, killerPerks, characterMap, dataLoading, dataError, retryAll, ratings, setRating } =
    useAppData();
  const [role, setRole] = useRoleParam();

  if (dataError)
    return (
      <div className={styles.status}>
        <p role="alert">Failed to load perks. Please check your connection and try again.</p>
        <button onClick={retryAll}>Try again</button>
      </div>
    );
  if (dataLoading)
    return (
      <div className={styles.status}>
        <p aria-busy="true" aria-live="polite">Loading…</p>
      </div>
    );

  const rolePerks = role === "survivor" ? survivorPerks : killerPerks;

  return (
    <>
      <RoleToggle role={role} onChange={setRole} />
      <ErrorBoundary label="Perks">
        <PerkSection
          role={role}
          perks={rolePerks}
          characterMap={characterMap}
          ratings={ratings}
          onRate={setRating}
        />
      </ErrorBoundary>
    </>
  );
};

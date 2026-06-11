import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { BuildMaker } from "../../components/BuildMaker/BuildMaker";
import { ErrorBoundary } from "../../components/ErrorBoundary/ErrorBoundary";
import { RoleToggle } from "../../components/RoleToggle/RoleToggle";
import { useAppData } from "../../context/AppDataContext";
import { useAuthModal } from "../../context/AuthModalContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { Role } from "../../hooks/useRoleParam";
import { useToast } from "../../hooks/useToast";
import { exportTierListImage } from "../../utils/exportCanvas";
import styles from "../PerksPage/PerksPage.module.scss";

export const BuildPage = () => {
  usePageTitle("Build Maker");
  const {
    survivorPerks,
    killerPerks,
    characterMap,
    dataLoading,
    dataError,
    retryAll,
    ratings,
    builds,
    saveBuild,
    deleteBuild,
    user,
  } = useAppData();
  const { openAuthModal } = useAuthModal();
  const { showToast } = useToast();

  // Role is page state here, NOT useRoleParam: BuildMaker's URL-sync
  // effect is the single writer of ?role=&p0..p3 on this page, so a
  // second URL writer would fight it. Initial value comes from the URL.
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<Role>(searchParams.get("role") === "killer" ? "killer" : "survivor");

  // The landing page's "My Builds" card links to /build#saved.
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== "#saved" || dataLoading) return;
    document.getElementById("saved")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, dataLoading]);

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
  const hasRatings = Object.keys(ratings).length > 0;

  const handleExportTierList = async () => {
    const ok = await exportTierListImage(rolePerks, ratings, role);
    if (!ok) showToast("Failed to export tier list");
  };

  return (
    <>
      <RoleToggle role={role} onChange={setRole} />
      <ErrorBoundary label="Build">
        <BuildMaker
          perks={rolePerks}
          role={role}
          characterMap={characterMap}
          hasRatings={hasRatings}
          onExportTierList={handleExportTierList}
          userId={user?.id ?? null}
          onOpenAuthModal={() => openAuthModal("Sign in to save builds")}
          onSave={async (name, perkNames) => {
            await saveBuild(name, role, perkNames, false);
          }}
          builds={builds}
          onDelete={deleteBuild}
        />
      </ErrorBoundary>
    </>
  );
};

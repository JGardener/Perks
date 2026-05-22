import { useState } from "react";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";
import { useCharacters } from "../../hooks/useCharacters";
import { usePerks } from "../../hooks/usePerks";
import { useRatings } from "../../hooks/useRatings";
import { exportTierListImage } from "../../utils/exportCanvas";
import { BuildMaker } from "../BuildMaker/BuildMaker";
import { PerkSection } from "../PerkSection/PerkSection";
import { StatsView } from "../StatsView/StatsView";
import styles from "./PerkList.module.scss";

type Tab = "perks" | "build" | "stats";
type Role = "survivor" | "killer";

function getRoleFromUrl(): Role {
  const params = new URLSearchParams(window.location.search);
  return params.get("role") === "killer" ? "killer" : "survivor";
}

export const PerkList = () => {
  const { perks, loading: perksLoading, error: perksError, retry: retryPerks } = usePerks();
  const { characterMap, loading: charsLoading, error: charsError, retry: retryChars } = useCharacters();
  const { ratings, setRating } = useRatings();
  const [activeTab, setActiveTab] = useState<Tab>("perks");
  const [activeRole, setActiveRole] = useState<Role>(getRoleFromUrl);

  const error = perksError || charsError;
  const loading = perksLoading || charsLoading;
  const retryAll = () => { retryPerks(); retryChars(); };

  if (error) return (
    <main className={styles.status}>
      <p role="alert">Failed to load perks. Please check your connection and try again.</p>
      <button onClick={retryAll}>Try again</button>
    </main>
  );
  if (loading) return <main className={styles.status}><p aria-busy="true" aria-live="polite">Loading…</p></main>;

  const survivorPerks = perks.filter((p) => p.role === "survivor");
  const killerPerks = perks.filter((p) => p.role === "killer");
  const rolePerks = activeRole === "survivor" ? survivorPerks : killerPerks;
  const hasRatings = Object.keys(ratings).length > 0;

  const handleExportTierList = () => {
    exportTierListImage(rolePerks, ratings, activeRole);
  };

  return (
    <main>
      <nav aria-label="Main navigation">
        <div className={styles.tabBar} role="tablist">
          <button
            role="tab"
            id="tab-perks"
            aria-selected={activeTab === "perks"}
            aria-controls="panel-perks"
            className={`${styles.tabBar__tab} ${activeTab === "perks" ? styles["tabBar__tab--active"] : ""}`}
            onClick={() => setActiveTab("perks")}
          >
            Perks
          </button>
          <button
            role="tab"
            id="tab-build"
            aria-selected={activeTab === "build"}
            aria-controls="panel-build"
            className={`${styles.tabBar__tab} ${activeTab === "build" ? styles["tabBar__tab--active"] : ""}`}
            onClick={() => setActiveTab("build")}
          >
            Build
          </button>
          <button
            role="tab"
            id="tab-stats"
            aria-selected={activeTab === "stats"}
            aria-controls="panel-stats"
            className={`${styles.tabBar__tab} ${activeTab === "stats" ? styles["tabBar__tab--active"] : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
        </div>
      </nav>

      {activeTab !== "stats" && (
        <nav aria-label="Role selection">
          <div className={styles.roleToggle} role="tablist">
            <button
              role="tab"
              aria-selected={activeRole === "survivor"}
              className={`${styles.roleToggle__tab} ${activeRole === "survivor" ? styles["roleToggle__tab--active"] : ""}`}
              onClick={() => setActiveRole("survivor")}
            >
              Survivor
            </button>
            <button
              role="tab"
              aria-selected={activeRole === "killer"}
              className={`${styles.roleToggle__tab} ${activeRole === "killer" ? styles["roleToggle__tab--active"] : ""}`}
              onClick={() => setActiveRole("killer")}
            >
              Killer
            </button>
          </div>
        </nav>
      )}

      <div
        role="tabpanel"
        id="panel-perks"
        aria-labelledby="tab-perks"
        hidden={activeTab !== "perks"}
      >
        <ErrorBoundary label="Perks">
          <PerkSection
            role={activeRole}
            perks={rolePerks}
            characterMap={characterMap}
            ratings={ratings}
            onRate={setRating}
          />
        </ErrorBoundary>
      </div>

      <div
        role="tabpanel"
        id="panel-build"
        aria-labelledby="tab-build"
        hidden={activeTab !== "build"}
      >
        <ErrorBoundary label="Build">
          <BuildMaker
            perks={rolePerks}
            role={activeRole}
            characterMap={characterMap}
            hasRatings={hasRatings}
            onExportTierList={handleExportTierList}
          />
        </ErrorBoundary>
      </div>

      <div
        role="tabpanel"
        id="panel-stats"
        aria-labelledby="tab-stats"
        hidden={activeTab !== "stats"}
      >
        <ErrorBoundary label="Stats">
          <StatsView perks={perks} ratings={ratings} />
        </ErrorBoundary>
      </div>
    </main>
  );
};

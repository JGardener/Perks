import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuthModal } from "../../context/AuthModalContext";
import { useAppData } from "../../context/AppDataContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import styles from "./LandingPage.module.scss";

// Placeholder hub — real hero ships in Phase 3.
export const LandingPage = () => {
  usePageTitle("Home");
  const { user, authLoading, signOut } = useAppData();
  const { openAuthModal } = useAuthModal();
  const [searchParams] = useSearchParams();

  // Legacy share links pointed at the root: /?role=killer&p0=... —
  // forward them to the build page with their params intact.
  if (searchParams.has("p0") || searchParams.has("role")) {
    return <Navigate to={{ pathname: "/build", search: `?${searchParams.toString()}` }} replace />;
  }

  return (
    <div className={styles.landing}>
      <div className={styles.auth}>
        {!authLoading &&
          (user ? (
            <button className={styles.authBtn} onClick={() => signOut()}>
              Sign Out
            </button>
          ) : (
            <button className={styles.authBtn} onClick={() => openAuthModal()}>
              Sign In
            </button>
          ))}
      </div>
      <header className={styles.hero}>
        <h1 className={styles.title}>The Bloodweb</h1>
        <p className={styles.subtitle}>Dead by Daylight</p>
      </header>
      <nav aria-label="Sections" className={styles.cards}>
        <Link to="/build" className={styles.card}>
          Randomise a Build
        </Link>
        <Link to="/perks" className={styles.card}>
          Browse Perks
        </Link>
        <Link to="/community" className={styles.card}>
          Community Tiers
        </Link>
        <Link to="/build#saved" className={styles.card}>
          My Builds
        </Link>
      </nav>
    </div>
  );
};

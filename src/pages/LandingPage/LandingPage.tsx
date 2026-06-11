import { Link, Navigate, useSearchParams } from "react-router-dom";
import { BloodwebBackdrop } from "../../components/BloodwebBackdrop/BloodwebBackdrop";
import { useAuthModal } from "../../context/AuthModalContext";
import { useAppData } from "../../context/AppDataContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import styles from "./LandingPage.module.scss";

const OCTAGON_PATH = "M30 2 H70 L98 30 V70 L70 98 H30 L2 70 V30 Z";

const GlyphRandomise = () => (
  <svg viewBox="0 0 100 100" className={styles.glyph} aria-hidden="true">
    <path d={OCTAGON_PATH} />
    <circle cx="35" cy="35" r="6" className={styles.glyphDot} />
    <circle cx="65" cy="35" r="6" className={styles.glyphDot} />
    <circle cx="35" cy="65" r="6" className={styles.glyphDot} />
    <circle cx="65" cy="65" r="6" className={styles.glyphDot} />
  </svg>
);

const GlyphPerks = () => (
  <svg viewBox="0 0 100 100" className={styles.glyph} aria-hidden="true">
    <path d="M15 3 H35 L47 15 V35 L35 47 H15 L3 35 V15 Z" />
    <path d="M65 3 H85 L97 15 V35 L85 47 H65 L53 35 V15 Z" />
    <path d="M15 53 H35 L47 65 V85 L35 97 H15 L3 85 V65 Z" />
    <path d="M65 53 H85 L97 65 V85 L85 97 H65 L53 85 V65 Z" />
  </svg>
);

const GlyphCommunity = () => (
  <svg viewBox="0 0 100 100" className={styles.glyph} aria-hidden="true">
    <line x1="50" y1="20" x2="18" y2="78" />
    <line x1="50" y1="20" x2="82" y2="78" />
    <line x1="18" y1="78" x2="82" y2="78" />
    <circle cx="50" cy="20" r="9" className={styles.glyphDot} />
    <circle cx="18" cy="78" r="9" className={styles.glyphDot} />
    <circle cx="82" cy="78" r="9" className={styles.glyphDot} />
  </svg>
);

const GlyphBuilds = () => (
  <svg viewBox="0 0 100 100" className={styles.glyph} aria-hidden="true">
    <path d={OCTAGON_PATH} />
    <path d="M35 30 H65 V72 L50 60 L35 72 Z" className={styles.glyphSolid} />
  </svg>
);

export const LandingPage = () => {
  usePageTitle("Dead by Daylight Perk Tiers & Builds");
  const { user, authLoading, signOut, perks, builds, dataLoading } = useAppData();
  const { openAuthModal } = useAuthModal();
  const [searchParams] = useSearchParams();

  // Legacy share links pointed at the root: /?role=killer&p0=... —
  // forward them to the build page with their params intact.
  if (searchParams.has("p0") || searchParams.has("role")) {
    return <Navigate to={{ pathname: "/build", search: `?${searchParams.toString()}` }} replace />;
  }

  const perkCount = dataLoading || perks.length === 0 ? "—" : String(perks.length);

  return (
    <div className={styles.landing}>
      <BloodwebBackdrop />
      <div className={styles.content}>
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
          <p className={styles.subtitle}>Rate perks · Craft builds · Survive the fog</p>
        </header>
        <nav aria-label="Sections" className={styles.cards}>
          <Link to="/build" className={`${styles.card} ${styles["card--primary"]}`} style={{ "--i": 0 } as React.CSSProperties}>
            <GlyphRandomise />
            <h2 className={styles.cardTitle}>Randomise a Build</h2>
            <p className={styles.cardHint}>Spin the web — four perks, one click</p>
          </Link>
          <Link to="/perks" className={styles.card} style={{ "--i": 1 } as React.CSSProperties}>
            <GlyphPerks />
            <h2 className={styles.cardTitle}>Browse Perks</h2>
            <p className={styles.cardHint}>{perkCount} perks · rate them A to F</p>
          </Link>
          <Link to="/community" className={styles.card} style={{ "--i": 2 } as React.CSSProperties}>
            <GlyphCommunity />
            <h2 className={styles.cardTitle}>Community Tiers</h2>
            <p className={styles.cardHint}>How the fog rates every perk</p>
          </Link>
          <Link to="/build#saved" className={styles.card} style={{ "--i": 3 } as React.CSSProperties}>
            <GlyphBuilds />
            <h2 className={styles.cardTitle}>My Builds</h2>
            <p className={styles.cardHint}>
              {user ? `${builds.length} saved build${builds.length === 1 ? "" : "s"}` : "Sign in to keep your builds"}
            </p>
          </Link>
        </nav>
      </div>
    </div>
  );
};

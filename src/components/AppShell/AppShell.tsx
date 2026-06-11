import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useAuthModal } from "../../context/AuthModalContext";
import { useAppData } from "../../context/AppDataContext";
import styles from "./AppShell.module.scss";

const NAV_ITEMS = [
  { to: "/perks", label: "Perks" },
  { to: "/build", label: "Build" },
  { to: "/community", label: "Community" },
] as const;

// Layout route for every page except the landing hub: skip link, slim
// wordmark header with primary nav + auth, and a focus reset on route
// change so keyboard/screen-reader users land at the new content.
export const AppShell = () => {
  const { user, authLoading, signOut } = useAppData();
  const { openAuthModal } = useAuthModal();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Carry the role across section links so switching pages keeps the
  // killer/survivor context (survivor is the default — omit it).
  const roleSearch = searchParams.get("role") === "killer" ? "?role=killer" : "";

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <Link to="/" className={styles.wordmark}>
          The Bloodweb
        </Link>
        <nav aria-label="Main navigation" className={styles.nav}>
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={{ pathname: to, search: roleSearch }}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles["navLink--active"] : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.auth}>
          {!authLoading &&
            (user ? (
              <>
                <span className={styles.user}>{user.email}</span>
                <button className={styles.authBtn} onClick={() => signOut()}>
                  Sign Out
                </button>
              </>
            ) : (
              <button className={styles.authBtn} onClick={() => openAuthModal()}>
                Sign In
              </button>
            ))}
        </div>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </>
  );
};

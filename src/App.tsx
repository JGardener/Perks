import "./App.css";
import "./styles/global.scss";

import { useCallback, useState } from "react";
import { AuthModal } from "./components/AuthModal/AuthModal";
import { PerkList } from "./components/PerkList/PerkList";
import { AuthModalContext } from "./context/AuthModalContext";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading, signOut } = useAuth();
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const openAuthModal = useCallback((reason?: string) => setAuthReason(reason ?? ""), []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      <header className="app-header" aria-label="The Bloodweb">
        <div className="app-header__left" />
        <div className="app-header__center">
          <h1 className="app-header__title">The Bloodweb</h1>
          <p className="app-header__subtitle">Dead by Daylight</p>
        </div>
        <div className="app-header__auth">
          {!loading && (user ? (
            <>
              <span className="app-header__user">{user.email}</span>
              <button className="app-header__auth-btn" onClick={() => signOut()}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="app-header__auth-btn" onClick={() => setShowAuth(true)}>
              Sign In
            </button>
          ))}
        </div>
      </header>
      <PerkList />
      {authReason !== undefined && (
        <AuthModal reason={authReason} onClose={() => setAuthReason(undefined)} />
      )}
    </AuthModalContext.Provider>
  );
}

export default App;

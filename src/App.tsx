import "./styles/global.scss";

import { useCallback, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthModal } from "./components/AuthModal/AuthModal";
import { AppShell } from "./components/AppShell/AppShell";
import { AppDataProvider } from "./context/AppDataContext";
import { AuthModalContext } from "./context/AuthModalContext";
import { BuildPage } from "./pages/BuildPage/BuildPage";
import { CommunityPage } from "./pages/CommunityPage/CommunityPage";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { PerksPage } from "./pages/PerksPage/PerksPage";

function App() {
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const openAuthModal = useCallback((reason?: string) => setAuthReason(reason ?? ""), []);

  return (
    <BrowserRouter>
      <AppDataProvider>
        <AuthModalContext.Provider value={{ openAuthModal }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AppShell />}>
              <Route path="/perks" element={<PerksPage />} />
              <Route path="/build" element={<BuildPage />} />
              <Route path="/community" element={<CommunityPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {authReason !== undefined && (
            <AuthModal reason={authReason} onClose={() => setAuthReason(undefined)} />
          )}
        </AuthModalContext.Provider>
      </AppDataProvider>
    </BrowserRouter>
  );
}

export default App;

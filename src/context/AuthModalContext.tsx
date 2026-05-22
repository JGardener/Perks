import { createContext, useContext } from "react";

interface AuthModalContextValue {
  openAuthModal: (reason?: string) => void;
}

export const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalContext");
  return ctx;
}

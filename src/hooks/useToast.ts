import { createContext, useContext } from "react";

export type ToastType = "error" | "info";

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// The context object and its consumer hook live here, apart from
// ToastProvider, so ToastContext.tsx exports only a component and keeps
// Vite Fast Refresh working.
export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

import "./instrument";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reactErrorHandler } from "@sentry/react";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "./context/ToastContext";
import "./styles/variables.scss";

createRoot(document.getElementById("root")!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);

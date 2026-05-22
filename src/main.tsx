import "./instrument";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reactErrorHandler } from "@sentry/react";
import App from "./App.tsx";
import { ToastProvider } from "./context/ToastContext";
import "./styles/variables.scss";

createRoot(document.getElementById("root")!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);

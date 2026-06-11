import { useEffect } from "react";

// WCAG 2.4.2 — every routed page gets a descriptive document title.
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — The Bloodweb`;
  }, [title]);
}

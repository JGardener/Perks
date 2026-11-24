import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    // Placeholder Supabase config so modules that build the client at import
    // time (src/services/supabase.ts) load in a fresh clone / CI with no .env.
    // Tests mock every network call; these values are never contacted.
    env: {
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
    exclude: ["**/node_modules/**", "supabase/**"],
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: { sourcemap: "hidden" },
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://dbd.tricky.lol",
        changeOrigin: true,
      },
      "/dbdassets": {
        target: "https://dbd.tricky.lol/dbdassets/",
        changeOrigin: true,
      },
    },
  },
});

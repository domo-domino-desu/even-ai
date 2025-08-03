import { defineConfig } from "vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";

import { cloudflare } from "@cloudflare/vite-plugin";
import { analyzer, unstableRolldownAdapter } from "vite-bundle-analyzer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths(),
    unstableRolldownAdapter(analyzer()),
    cloudflare(),
  ],
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 600,
  },
});

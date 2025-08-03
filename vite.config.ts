import { defineConfig } from "vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";

import { analyzer, unstableRolldownAdapter } from "vite-bundle-analyzer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/even-ai/",
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths(),
    unstableRolldownAdapter(analyzer()),
  ],
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 600,
  },
});

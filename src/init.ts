import initUnoCssRuntime from "@unocss/runtime";
import { createPlugin } from "~/utils/ai/plugin";

import { configResponsive } from "ahooks";
import { genericStore } from "~/utils/idb-kv";
import config from "../uno.config";

declare global {
  interface Window {
    createPlugin: typeof createPlugin;
  }
}

export async function globalInit() {
  // Register global function
  window.createPlugin = createPlugin;
  // Sync the theme mode from storage
  ui("mode", (await genericStore.get("theme-mode")) || "auto");
  // Align ahooks responsive breakpoints with BeerCSS
  configResponsive({ s: 0, m: 600, l: 992 });
  // Initialize UnoCSS runtime
  await initUnoCssRuntime({ defaults: config });
}

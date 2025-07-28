import { defineConfig } from "@unocss/runtime";

import presetIcons from "@unocss/preset-icons/browser";
import presetWind3 from "@unocss/preset-wind3";

export default defineConfig({
  presets: [
    presetWind3({ prefix: "un-" }),
    presetIcons({ cdn: "https://esm.sh/" }),
  ],
});

import { atomWithIdb } from "~/utils/idb-kv";

export const modeAtom = atomWithIdb<"light" | "dark" | "auto">(
  "theme-mode",
  "auto",
);

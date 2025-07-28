import { atom } from "jotai";
import { CryptoManager } from "~/utils/crypto-manager";
import { atomWithIdb } from "~/utils/idb-kv";

export type CryptoInfo =
  | null
  | { type: "raw" }
  | { type: "encrypted"; salt: string; encryptedText: string };

export const cryptoManagerAtom = atom<CryptoManager | null>(null);
export const cryptoInfoAtom = atomWithIdb<CryptoInfo>("crypto-info", null);

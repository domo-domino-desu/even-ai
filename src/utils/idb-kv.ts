import { atomWithStorage } from "jotai/utils";
import type { AsyncStorage } from "jotai/vanilla/utils/atomWithStorage";
import { db } from "~/utils/db";

export interface KVStore<T = unknown> {
  set: (key: string, value: T) => Promise<void>;
  get: <U = T>(key: string) => Promise<U | undefined>;
  has: (key: string) => Promise<boolean>;
  delete: (key: string) => Promise<void>;
}

export function createKV<T = unknown>(category: string): KVStore<T> {
  return {
    async set(key: string, value: T): Promise<void> {
      await db.kv_storage.put({ category, key, value });
    },

    async get<U = T>(key: string): Promise<U | undefined> {
      const record = await db.kv_storage.get([category, key]);
      return record?.value as U;
    },

    async delete(key: string): Promise<void> {
      await db.kv_storage.delete([category, key]);
    },

    async has(key: string): Promise<boolean> {
      const record = await db.kv_storage.get([category, key]);
      return record !== undefined;
    },
  };
}
export const jotaiStorage: AsyncStorage<unknown> = {
  getItem: async (key) => (await genericStore.get(key))!,
  setItem: async (key, value) => await genericStore.set(key, value),
  removeItem: async (key) => await genericStore.delete(key),
};

export function atomWithIdb<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(
    key,
    initialValue,
    jotaiStorage as AsyncStorage<T>,
    { getOnInit: true },
  );
}

export const genericStore = createKV("generic");

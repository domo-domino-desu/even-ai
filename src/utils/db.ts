import Dexie, { type EntityTable, type Table } from "dexie";
import { exportDB, importInto } from "dexie-export-import";
import type { ChatHistory } from "~/utils/ai/chat";
import type { ConfigFromSchema, ConfigSchema } from "~/utils/ai/plugin";
import type { ProviderType } from "~/utils/ai/provider";

export type Uuid = string;
export type ContentHash = string;

export interface PluginInfo<TSchema extends ConfigSchema> {
  id: Uuid;
  contentHash: ContentHash; // Unique hash for the plugin content
  name: string;
  tags: string[];
  description: string;
  configSchema: TSchema;
  content: string;
  globalConfig: Partial<ConfigFromSchema<TSchema>>;
}

export interface PluginHolder {
  id: Uuid;
  name: string;
  plugins: Record<string, Record<string, any>>; // Plugins and their configurations
}

export interface Provider extends PluginHolder {
  tags: string[];
  description: string;
  providerType: ProviderType;
  baseURL: string;
  encryptedApiKey: string;
  model: string;
  providerSettings: Record<string, any>;
}

export interface Prefab extends PluginHolder {
  tags: string[];
  description: string;
}

export interface Chat extends PluginHolder {
  tags: string[];
  theme?: string;
  history: ChatHistory;
  providerId?: Uuid;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface GenericKV {
  category: string;
  key: string;
  value: any;
}

export const db = new Dexie("even_ai") as Dexie & {
  plugins: EntityTable<PluginInfo<any>, "id">;
  ai_providers: EntityTable<Provider, "id">;
  prefabs: EntityTable<Prefab, "id">;
  chats: EntityTable<Chat, "id">;
  kv_storage: Table<GenericKV, [string, string]>;
};
db.version(1).stores({
  plugins: "id, name, &contentHash, *tags",
  prefabs: "id, name, *tags",
  ai_providers: "id, name, *tags",
  chats: "id, name, updatedAt, *tags",
  kv_storage: "&[category+key]",
});

export function dumpDb(): Promise<Blob> {
  return exportDB(db);
}

export async function loadDb(blob: Blob): Promise<void> {
  await importInto(db, blob, { clearTablesBeforeImport: true });
}

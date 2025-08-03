import type { Chat, PluginInfo } from "~/utils/db";
import { db } from "~/utils/db";
import type { ChatHistory } from "./chat";
import type { ConfigFromSchema, ConfigSchema, Plugin } from "./plugin";

export async function loadPluginFromString<TSchema extends ConfigSchema>(
  code: string,
): Promise<Plugin<TSchema>> {
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const module = await import(/* @vite-ignore */ url);
  URL.revokeObjectURL(url);
  return module.default;
}

export function getDefaultConfig<TSchema extends ConfigSchema>(
  schema: TSchema,
): ConfigFromSchema<TSchema> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, item]) => [key, item.default]),
  ) as ConfigFromSchema<TSchema>;
}

export async function getPluginsFromChat(
  chat: Chat,
): Promise<PluginInfo<any>[]> {
  const provider = await db.ai_providers.get(chat.providerId ?? "");
  const providerPluginIds = Object.keys(provider?.plugins ?? {});
  const pluginIds = Object.keys(chat.plugins);
  if (pluginIds.length === 0) return [];
  return await db.plugins
    .where("id")
    .anyOf(pluginIds.concat(providerPluginIds))
    .toArray();
}

async function runHooks<T>(
  chat: Chat,
  hookType: "inboundHooks" | "outboundHooks" | "anyHooks",
  filterFn: (hook: any) => boolean,
  initialValue: T,
): Promise<T> {
  const plugins = await getPluginsFromChat(chat);
  const loadedPlugins = await Promise.all(
    plugins.map(async (p) => ({
      ...p,
      loaded: await loadPluginFromString(p.content),
    })),
  );

  const hooks = loadedPlugins
    .flatMap((p) =>
      (p.loaded[hookType] || []).map((hook: any) => ({
        ...hook,
        config: p.globalConfig,
      })),
    )
    .filter(filterFn)
    .sort((a, b) => a.order - b.order);

  let result = initialValue;
  for (const hook of hooks) {
    result = await hook.handler(result, hook.config, {});
  }
  return result;
}

export async function runOutboundHooks(chat: Chat): Promise<ChatHistory> {
  return runHooks(chat, "outboundHooks", () => true, chat.history);
}

export async function runInboundHooks(
  chat: Chat,
  currentHistory: ChatHistory,
): Promise<ChatHistory> {
  return runHooks(chat, "inboundHooks", () => true, currentHistory);
}

export async function runAnyHooks(
  event: "after-page-enter" | "after-receive" | "after-send",
  chat: Chat,
): Promise<Chat> {
  const newHistory = await runHooks(
    chat,
    "anyHooks",
    (h) => h.event === event,
    chat.history,
  );
  return { ...chat, history: newHistory };
}

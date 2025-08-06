import { merge } from "moderndash";
import type { Chat, PluginInfo } from "~/utils/db";
import { db } from "~/utils/db";
import type { Conversation } from "./chat";
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
): Promise<{ plugin: PluginInfo<any>; config: any }[]> {
  // const provider = await db.ai_providers.get(chat.providerId ?? "");
  // const providerPluginIds = Object.keys(provider?.plugins ?? {});
  // const pluginIds = Object.keys(chat.plugins);
  // if (pluginIds.length === 0) return [];
  // return await db.plugin_infos
  //   .where("id")
  //   .anyOf(pluginIds.concat(providerPluginIds))
  //   .toArray();
  const provider = await db.ai_providers.get(chat.providerId ?? "");
  const providerPluginIds = Object.keys(provider?.plugins ?? {});
  const chatPluginIds = Object.keys(chat.plugins);
  const pluginIds = [...new Set([...providerPluginIds, ...chatPluginIds])];
  if (pluginIds.length === 0) return [];

  const plugins = await db.plugin_infos.where("id").anyOf(pluginIds).toArray();
  return plugins.map((plugin) => {
    const chatConfig = chat.plugins[plugin.id] || {};
    const providerConfig = provider?.plugins[plugin.id] || {};
    const globalConfig = plugin.globalConfig || {};
    const defaultConfig = getDefaultConfig(plugin.configSchema);
    return {
      plugin,
      config: merge(
        {},
        defaultConfig,
        globalConfig,
        providerConfig,
        chatConfig,
      ),
    };
  });
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
      loaded: await loadPluginFromString(p.plugin.content),
    })),
  );

  const hooks = loadedPlugins
    .flatMap((p) =>
      (p.loaded[hookType] || []).map((hook: any) => ({
        ...hook,
        config: p.config,
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

export async function runOutboundHooks(chat: Chat): Promise<Conversation> {
  return runHooks(chat, "outboundHooks", () => true, chat.history);
}

export async function runInboundHooks(
  chat: Chat,
  currentHistory: Conversation,
): Promise<Conversation> {
  return runHooks(chat, "inboundHooks", () => true, currentHistory);
}

export async function runAnyHooks(
  event: "onInit" | "afterReceive" | "beforeSend",
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

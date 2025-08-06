import { atom } from "jotai";
import { splitAtom, unwrap } from "jotai/utils";
import { merge } from "moderndash";
import type { Conversation, Message } from "~/utils/ai/chat";
import type {
  ConfigFromSchema,
  ConfigSchema,
  EventName,
  HandlerFn,
} from "~/utils/ai/plugin";
import {
  getDefaultConfig,
  loadPluginFromString,
} from "~/utils/ai/plugin-utils";
import { db, type Provider } from "~/utils/db";

// Conversation atoms:
// sourceOfTruth + currentGeneration + sequelMessages = full chat
export const sourceOfTruthAtom = atom<Conversation | null>(null);
export const currentGenerationAtom = atom<Message | null>(null);
export const sequelMessagesAtom = atom<Message[] | null>(null);
export const fullConversationAtom = atom((get) => {
  const sourceOfTruth = get(sourceOfTruthAtom);
  const currentGeneration = get(currentGenerationAtom);
  const sequelMessages = get(sequelMessagesAtom);

  if (!sourceOfTruth) return null;

  if (!currentGeneration && sequelMessages?.length === 0) {
    return sourceOfTruth;
  }

  return {
    ...sourceOfTruth,
    messages: [
      ...sourceOfTruth.messages,
      currentGeneration,
      ...(sequelMessages || []),
    ].filter(Boolean),
  } as Conversation;
});

// Provider & Chat Plugins
async function preparePluginsFromCfg<TSchema extends ConfigSchema>(
  id: string,
  cfg: Partial<ConfigFromSchema<TSchema>> | null = null,
) {
  const pluginInfo = await db.plugin_infos.get(id);
  if (!pluginInfo) return null;
  const plugin = await loadPluginFromString<TSchema>(pluginInfo.content);

  const defaultConfig = getDefaultConfig(plugin.configSchema);
  const globalConfig = pluginInfo.globalConfig || {};
  const config = merge(
    defaultConfig,
    globalConfig,
    cfg || {},
  ) as unknown as ConfigFromSchema<TSchema>;
  return {
    id: pluginInfo.id,
    name: pluginInfo.name,
    config,
    plugin,
  };
}

async function runHooksOnConversation(
  conversation: Conversation,
  hooks: { handler: HandlerFn<any>; config: any }[],
) {
  for (const hook of hooks) {
    conversation = await hook.handler(conversation, hook.config, {});
  }
  return conversation;
}

export const providerAtom = atom<Provider | null>(null);
export const chatPluginCfgAtom = atom<Record<string, any> | null>(null);
export const allPluginAtom = atom(async (get) => {
  const providerPluginCfg = get(providerAtom);
  const chatPluginCfg = get(chatPluginCfgAtom);

  if (!providerPluginCfg && !chatPluginCfg) return null;

  const pluginCfg = merge(
    providerPluginCfg?.plugins || {},
    chatPluginCfg || {},
  );
  const plugins = await Promise.all(
    Object.entries(pluginCfg).map(async ([id, config]) =>
      preparePluginsFromCfg(id, config),
    ),
  );
  return plugins.filter(Boolean);
});

// All kinds of hooks
export const hooksAtom = atom(async (get) => {
  const plugins = await get(allPluginAtom);
  if (!plugins) return null;

  const inboundHooks = [];
  const outboundHooks = [];
  const anyHooks = {
    onInit: [],
    beforeSend: [],
    afterReceive: [],
  } as Record<EventName, { handler: HandlerFn<any>; config: any }[]>;

  for (const plugin of plugins) {
    if (plugin?.plugin.inboundHooks) {
      inboundHooks.push(
        ...plugin.plugin.inboundHooks.map((hook) => ({
          ...hook,
          config: plugin.config,
        })),
      );
    }
    if (plugin?.plugin.outboundHooks) {
      outboundHooks.push(
        ...plugin.plugin.outboundHooks.map((hook) => ({
          ...hook,
          config: plugin.config,
        })),
      );
    }
    if (plugin?.plugin.anyHooks) {
      for (const hook of plugin.plugin.anyHooks) {
        anyHooks[hook.event].push({
          handler: hook.handler,
          config: plugin.config,
        });
      }
    }
  }

  return { inboundHooks, outboundHooks, anyHooks };
});

export const inboundHooksAtom = atom(
  async (get) => (await get(hooksAtom))?.inboundHooks,
);
export const outboundHooksAtom = atom(
  async (get) => (await get(hooksAtom))?.outboundHooks,
);
export const onInitHooksAtom = atom(
  async (get) => (await get(hooksAtom))?.anyHooks.onInit,
);
export const beforeSendHooksAtom = atom(
  async (get) => (await get(hooksAtom))?.anyHooks.beforeSend,
);
export const afterReceiveHooksAtom = atom(
  async (get) => (await get(hooksAtom))?.anyHooks.afterReceive,
);

// Atom for ui
const uiConversationAtom = atom(async (get) => {
  let fullConversation = get(fullConversationAtom);
  if (!fullConversation) return null;

  const inboundHooks = await get(inboundHooksAtom);
  if (!inboundHooks) return fullConversation;

  return await runHooksOnConversation(fullConversation, inboundHooks);
});
const _uiMessagesAtom = atom(async (get) => {
  const uiConversation = await get(uiConversationAtom);
  return uiConversation?.messages || [];
});
export const uiMessagesAtom = splitAtom(unwrap(_uiMessagesAtom, () => []));

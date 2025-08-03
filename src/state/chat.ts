import { generateText, streamText } from "ai";
import { atom } from "jotai";
import { merge } from "moderndash";
import { v4 as uuidv4 } from "uuid";

import toast from "react-hot-toast";
import type { ChatHistory, Message } from "~/utils/ai/chat";
import {
  getPluginsFromChat,
  runAnyHooks,
  runInboundHooks,
  runOutboundHooks,
} from "~/utils/ai/plugin-utils";
import {
  createProvider,
  getModel,
  type ProviderSettings,
} from "~/utils/ai/provider";
import type { Chat } from "~/utils/db";
import { db } from "~/utils/db";
import { cryptoManagerAtom } from "./crypto";

// =================================================================================================
// Atoms
// =================================================================================================

export const chatIdAtom = atom<string | null>(null);
export const rawChatAtom = atom<Chat | null>(null);

export const chatAtom = atom(async (get) => {
  const chat = get(rawChatAtom);
  if (!chat) return null;

  const provider = chat.providerId
    ? await db.ai_providers.get(chat.providerId)
    : null;
  const plugins = await getPluginsFromChat(chat);

  const mergedPlugins: Record<string, any> = {};
  for (const plugin of plugins) {
    const pluginConfig = plugin.globalConfig ?? {};
    const providerConfig = provider?.plugins?.[plugin.id] ?? {};
    const chatConfig = chat.plugins?.[plugin.id] ?? {};
    mergedPlugins[plugin.id] = merge(
      {},
      pluginConfig,
      providerConfig,
      chatConfig,
    );
  }

  return { ...chat, plugins: mergedPlugins };
});

export const userInputAtom = atom<string>("");
export const isSendingAtom = atom<boolean>(false);
export const abortControllerAtom = atom(new AbortController());

// =================================================================================================
// Write-only atoms for chat operations
// =================================================================================================

export const sendMessageAtom = atom(null, async (get, set) => {
  const chatId = get(chatIdAtom);
  let chat = get(rawChatAtom);
  const userInput = get(userInputAtom);
  const abortController = new AbortController();
  set(abortControllerAtom, abortController);

  if (!chatId || !chat || !userInput.trim()) return;

  set(isSendingAtom, true);
  set(userInputAtom, "");

  const userMessage: Message = {
    id: uuidv4(),
    role: "user",
    content: userInput,
    datetime: new Date().toISOString(),
  };
  chat.history.messages.push(userMessage);
  await db.chats.update(chatId, { history: chat.history });
  set(rawChatAtom, { ...chat });

  chat = await runAnyHooks("after-send", chat);
  await db.chats.update(chatId, { history: chat.history });
  set(rawChatAtom, { ...chat });

  const outboundChat = await runOutboundHooks(chat);

  const providerInfo =
    chat.providerId && (await db.ai_providers.get(chat.providerId!));
  if (!chat.providerId || !providerInfo) {
    console.error("Provider not found for chat");
    toast.error("未设置提供者");
    set(isSendingAtom, false);
    return;
  }

  const cryptoManager = get(cryptoManagerAtom);
  if (!cryptoManager) {
    console.error("CryptoManager not initialized");
    set(isSendingAtom, false);
    return;
  }

  const apiKey = await cryptoManager.decrypt(providerInfo.encryptedApiKey);
  const providerSettings: ProviderSettings = {
    type: providerInfo.providerType,
    apiKey,
    baseURL: providerInfo.baseURL,
  };
  const provider = createProvider(providerSettings);
  const model = getModel(
    provider,
    providerInfo.providerType,
    providerInfo.model,
  );

  const useStreaming = providerInfo.isStreaming;

  const assistantMessage: Message = {
    id: uuidv4(),
    role: "assistant",
    content: "",
    datetime: new Date().toISOString(),
  };
  chat.history.messages.push(assistantMessage);
  set(rawChatAtom, { ...chat }); // Show empty bubble

  if (useStreaming) {
    const stream = await streamText({
      model,
      messages: outboundChat.messages,
      abortSignal: abortController.signal,
    });

    for await (const textPart of stream.textStream) {
      if (abortController.signal.aborted) break;
      assistantMessage.content += textPart;
      await db.chats.update(chatId, { history: chat.history });
      set(rawChatAtom, { ...chat });
    }
  } else {
    const { text } = await generateText({
      model,
      messages: outboundChat.messages,
      abortSignal: abortController.signal,
    });
    assistantMessage.content = text;
  }

  if (abortController.signal.aborted) {
    assistantMessage.content += "\n\n(interrupted)";
  }

  let finalHistory: ChatHistory = {
    ...outboundChat,
    messages: [...outboundChat.messages, assistantMessage],
  };
  finalHistory = await runInboundHooks(chat, finalHistory);
  assistantMessage.content = finalHistory.messages.at(-1)!.content;

  await db.chats.update(chatId, { history: chat.history });
  set(rawChatAtom, { ...chat });

  chat = await runAnyHooks("after-receive", chat);
  await db.chats.update(chatId, { history: chat.history });
  set(rawChatAtom, { ...chat });

  set(isSendingAtom, false);
});

export const deleteMessageAtom = atom(
  null,
  async (get, set, messageId: string) => {
    const chatId = get(chatIdAtom);
    const chat = get(rawChatAtom);

    if (!chatId || !chat) return;

    chat.history.messages = chat.history.messages.filter(
      (msg) => msg.id !== messageId,
    );

    await db.chats.update(chatId, { history: chat.history });
    set(rawChatAtom, { ...chat });
  },
);

export const initChatSessionAtom = atom(null, async (get, set) => {
  const chatId = get(chatIdAtom);
  if (!chatId) return;
  let chat = await db.chats.get(chatId);
  if (!chat) return;

  set(rawChatAtom, chat);
  set(isSendingAtom, false);

  chat = await runAnyHooks("after-page-enter", chat);
  console.log("Chat initialized:", chat);
  await db.chats.update(chatId, { history: chat.history });
  set(rawChatAtom, { ...chat });
});

export const interruptMessageAtom = atom(null, (get, set) => {
  const abortController = get(abortControllerAtom);
  abortController.abort();
  set(isSendingAtom, false);
});

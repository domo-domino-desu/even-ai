import { v7 as uuid } from "uuid";
import { cryptoManagerAtom } from "~/state/crypto";
import type { Role } from "~/utils/ai/chat";
import { loadPluginFromString } from "~/utils/ai/plugin-utils";
import type { PluginInfo } from "~/utils/db";
import { db, type Chat } from "~/utils/db";

function getMockChat(): Chat {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    name: "测试对话 1",
    tags: ["测试", "对话"],
    history: {
      messages: [
        { role: "system", content: "你是一个猫娘", id: uuid(), datetime: now },
        { role: "user", content: "你好！", id: uuid(), datetime: now },
        { role: "assistant", content: "你好喵", id: uuid(), datetime: now },
        ...Array.from({ length: 30 }, (_, i) => ({
          role: (i % 2 === 0 ? "user" : "assistant") as Role,
          content: `这是第 ${i + 1} 条消息`,
          id: uuid(),
          datetime: new Date(Date.now() + i * 1000).toISOString(),
        })),
      ],
    },
    createdAt: now,
    updatedAt: now,
    plugins: {},
  };
}

export function insertMockChats() {
  const mockChats = Array.from({ length: 5 }, () => getMockChat());
  db.chats.bulkAdd(mockChats);
}

export function insertMockProviders() {
  const mockProviders = [
    {
      id: uuid(),
      name: "OpenAI",
      tags: ["official"],
      description: "OpenAI official provider",
      providerType: "openai" as const,
      baseURL:
        import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1",
      encryptedApiKey: import.meta.env.VITE_OPENAI_API_KEY || "...",
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4",
      providerSettings: {},
      plugins: {},
    },
    {
      id: uuid(),
      name: "Google AI",
      tags: ["official"],
      description: "Google AI official provider",
      providerType: "gemini" as const,
      baseURL:
        import.meta.env.VITE_GEMINI_BASE_URL ||
        "https://generativeai.googleapis.com/v1beta",
      encryptedApiKey: import.meta.env.VITE_GEMINI_API_KEY || "...",
      model: import.meta.env.VITE_GEMINI_MODEL || "gemini-pro",
      providerSettings: {},
      plugins: {},
    },
  ];
  db.ai_providers.bulkAdd(mockProviders);
}

export function insertMockPrefabs() {
  const mockPrefabs = [
    {
      id: uuid(),
      name: "编程助手",
      tags: ["dev", "coding"],
      description: "用于编程的预组",
      plugins: {},
    },
    {
      id: uuid(),
      name: "写作助手",
      tags: ["writing"],
      description: "用于写作的预组",
      plugins: {},
    },
  ];
  db.prefabs.bulkAdd(mockPrefabs);
}

export async function insertMockPlugins() {
  const pluginContent1 = `export default createPlugin({
  name: "网页浏览器",
  description: "提供网页浏览功能",
  configSchema: {
    proxy: {
      type: "string",
      default: "",
      description: "代理服务器地址",
    },
    timeout: {
      type: "number",
      default: 30000,
      description: "请求超时时间 (ms)",
    },
    enableJavascript: {
      type: "boolean",
      default: true,
      description: "是否执行 JavaScript",
    },
  },
  inboundHooks: [],
  outboundHooks: [],
  anyHooks: [],
  additionalComponents: {},
});
`;
  const pluginContent2 = `export default createPlugin({
  name: "代码解释器",
  description: "提供代码解释和执行功能",
  configSchema: {},
  inboundHooks: [],
  outboundHooks: [],
  anyHooks: [],
  additionalComponents: {},
});
`;
  const plugin1 = (await loadPluginFromString(pluginContent1)) as PluginInfo<{
    proxy: { type: "string"; default: ""; description: "代理服务器地址" };
    timeout: {
      type: "number";
      default: 30000;
      description: "请求超时时间 (ms)";
    };
    enableJavascript: {
      type: "boolean";
      default: true;
      description: "是否执行 JavaScript";
    };
  }>;
  const plugin2 = (await loadPluginFromString(
    pluginContent2,
  )) as PluginInfo<{}>;
  const pluginSave1: PluginInfo<{
    proxy: { type: "string"; default: ""; description: "代理服务器地址" };
    timeout: {
      type: "number";
      default: 30000;
      description: "请求超时时间 (ms)";
    };
    enableJavascript: {
      type: "boolean";
      default: true;
      description: "是否执行 JavaScript";
    };
  }> = {
    id: uuid(),
    tags: [],
    name: plugin1.name,
    description: plugin1.description,
    globalConfig: {},
    configSchema: plugin1.configSchema,
    content: pluginContent1,
  };
  const pluginSave2: PluginInfo<{}> = {
    id: uuid(),
    tags: [],
    name: plugin2.name,
    description: plugin2.description,
    globalConfig: {},
    configSchema: plugin2.configSchema,
    content: pluginContent2,
  };
  db.plugins.bulkAdd([pluginSave1, pluginSave2]);
}

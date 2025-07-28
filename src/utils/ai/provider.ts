import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderV2 } from "@ai-sdk/provider";

export type ProviderType = (typeof SUPPORTED_PROVIDERS)[number];

export interface ProviderSettings {
  type: ProviderType;
  baseURL: string;
  apiKey: string;
}

export const SUPPORTED_PROVIDERS = ["openai", "gemini"] as const;
export const PROVIDER_INFO: Record<
  ProviderType,
  {
    defaultURL: string;
    constructor: (settings: ProviderSettings) => ProviderV2;
  }
> = {
  openai: {
    defaultURL: "https://api.openai.com/v1",
    constructor: createOpenAI,
  },
  gemini: {
    defaultURL: "https://generativeai.googleapis.com/v1beta",
    constructor: createGoogleGenerativeAI,
  },
};
const clientCache: Map<string, ProviderV2> = new Map();

function createProvider(providerSettings: ProviderSettings) {
  const providerType = providerSettings.type;
  if (!SUPPORTED_PROVIDERS.includes(providerType)) {
    throw new Error(
      `Unsupported provider type: ${providerType}. Supported types are: ${SUPPORTED_PROVIDERS.join(", ")}`,
    );
  }

  const key = JSON.stringify({ providerType, providerSettings });
  if (clientCache.has(key)) {
    return clientCache.get(key)!;
  }

  const providerInfo = PROVIDER_INFO[providerType];
  const client = providerInfo.constructor(providerSettings);
  clientCache.set(key, client);
  return client;
}

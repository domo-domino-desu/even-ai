import React from "react";

import type { ChatHistory } from "./chat";

interface StringConfigItem {
  type: "string";
  default: string;
  description?: string;
}

interface NumberConfigItem {
  type: "number";
  default: number;
  description?: string;
}

interface BooleanConfigItem {
  type: "boolean";
  default: boolean;
  description?: string;
}

export type ConfigItem =
  | StringConfigItem
  | NumberConfigItem
  | BooleanConfigItem;
export type ConfigSchema = Record<string, ConfigItem>;

export type ConfigFromSchema<TSchema extends ConfigSchema> = {
  -readonly [K in keyof TSchema]: TSchema[K] extends { type: "string" }
    ? string
    : TSchema[K] extends { type: "number" }
      ? number
      : TSchema[K] extends { type: "boolean" }
        ? boolean
        : never;
};

export interface Plugin<TSchema extends ConfigSchema> {
  name: string;
  description: string;
  /**
   * Configuration schema for the extension.
   * If the extension does not require any configuration, provide an empty object `{}`.
   */
  configSchema: TSchema;
  /**
   * Allow extension to modify what will be shown in the chat.
   */
  inboundHooks?: {
    order: number;
    /**
     * This handler will be called on the pipeline of receiving data from the AI provider.
     * @param chat The chat object containing messages and metadata.
     * @param config The configuration object based on the schema.
     * @param capabilities An object containing capabilities that the extension can use.
     * @return The modified chat object.
     */
    handler: (
      chat: ChatHistory,
      config: ConfigFromSchema<TSchema>,
      capabilities: Record<any, (...args: any) => any>,
    ) => Promise<ChatHistory>;
  }[];
  /**
   * Allow extension to modify what will be sent to the AI provider.
   */
  outboundHooks?: {
    order: number;
    /**
     * This handler will be called on the pipeline of sending data to the AI provider.
     * @param chat The chat object containing messages and metadata.
     * @param config The configuration object based on the schema.
     * @param capabilities An object containing capabilities that the extension can use.
     * @return The modified chat object.
     */
    handler: (
      chat: ChatHistory,
      config: ConfigFromSchema<TSchema>,
      capabilities: Record<any, (...args: any) => any>,
    ) => Promise<ChatHistory>;
  }[];
  /**
   * Allow extension to modify the source-of-truth chat history.
   */
  anyHooks?: {
    event: "afterPageEnter" | "afterFinishReceive" | "afterUserMessage";
    /**
     * This handler will be called when the specified event occurs. The result will be used as the new source-of-truth chat history.
     * @param chat The source-of-truth chat history.
     * @param config The configuration object based on the schema.
     * @param capabilities An object containing capabilities that the extension can use.
     * @return The modified chat object.
     */
    handler: (
      chat: ChatHistory,
      config: ConfigFromSchema<TSchema>,
      capabilities: Record<any, (...args: any) => any>,
    ) => Promise<ChatHistory>;
  }[];
  /**
   * Allow extension to add additional components to the chat UI.
   */
  additionalComponents?: {
    [key: string]: React.ComponentType<any>;
  };
}

export function createPlugin<const TSchema extends ConfigSchema>(
  plugin: Plugin<TSchema>,
): Plugin<TSchema> {
  return plugin;
}

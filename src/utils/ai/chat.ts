import type { CallSettings } from "ai";

export type Role = "user" | "assistant" | "system";
export type { CallSettings, ModelMessage } from "ai";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  _metadata?: Record<string, any>;
}

export interface Conversation {
  _metadata: CallSettings & Record<string, any>;
  messages: Message[];
}

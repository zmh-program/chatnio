import { Conversation } from "./conversation.ts";

export type Message = {
  content: string;
  keyword?: string;
  quota?: number;
  role: string;
};

export type Id = number;

export type ConversationInstance = {
  id: number;
  name: string;
  message: Message[];
};

export type ConversationMapper = Record<Id, Conversation>;

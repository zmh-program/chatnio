import { Conversation } from "./conversation.ts";

export type Message = {
  content: string;
  keyword?: string;
  role: string;
};

export type Id = number;

export type ConversationInstance = {
  id: number;
  name: string;
  message: Message[];
};

export type ConversationMapper = Record<Id, Conversation>;

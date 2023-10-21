import { Conversation } from "./conversation.ts";

export type Message = {
  role: string;
  content: string;
  keyword?: string;
  quota?: number;
  end?: boolean;
};

export type Model = {
  id: string;
  name: string;
  free: boolean;
  auth: boolean;
};

export type Id = number;

export type ConversationInstance = {
  id: number;
  name: string;
  message: Message[];
};

export type ConversationMapper = Record<Id, Conversation>;

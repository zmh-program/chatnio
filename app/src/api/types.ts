import { Conversation } from "./conversation.ts";

export type Message = {
  role: string;
  content: string;
  keyword?: string;
  quota?: number;
  end?: boolean;
  plan?: boolean;
};

export type Model = {
  id: string;
  name: string;
  free: boolean;
  auth: boolean;
  tag?: string[];
};

export type PlanModel = {
  id: string;
  level: number;
};

export type Id = number;

export type ConversationInstance = {
  id: number;
  name: string;
  message: Message[];
  model?: string;
  shared?: boolean;
};

export type ConversationMapper = Record<Id, Conversation>;

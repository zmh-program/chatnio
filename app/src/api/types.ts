import { Conversation } from "./conversation.ts";
import React from "react";

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
  description?: string;
  free: boolean;
  auth: boolean;
  default: boolean;
  high_context: boolean;
  avatar: string;
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

export type Plan = {
  level: number;
  price: number;
};

export type SubscriptionUsage = Record<
  string,
  {
    icon: React.ReactElement;
    name: string;
  }
>;

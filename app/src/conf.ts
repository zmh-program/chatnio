import axios from "axios";
import { Model, PlanModel, SubscriptionUsage } from "@/api/types.ts";
import {
  deeptrainAppName,
  deeptrainEndpoint,
  getDev,
  getRestApi,
  getTokenField,
  getWebsocketApi,
} from "@/utils/env.ts";
import { getMemory } from "@/utils/memory.ts";
import { Compass, Image, Newspaper } from "lucide-react";
import React from "react";
import { syncSiteInfo } from "@/admin/api/info.ts";
import { getOfflineModels, loadPreferenceModels } from "@/utils/storage.ts";

export const version = "3.8.3";
export const dev: boolean = getDev();
export const deploy: boolean = true;
export let rest_api: string = getRestApi(deploy);
export let ws_api: string = getWebsocketApi(deploy);
export const tokenField = getTokenField(deploy);

export let supportModels: Model[] = loadPreferenceModels(getOfflineModels());

export let allModels: string[] = supportModels.map((model) => model.id);

export const planModels: PlanModel[] = [
  { id: "gpt-4-0613", level: 1 },
  { id: "gpt-4-1106-preview", level: 1 },
  { id: "gpt-4-vision-preview", level: 1 },
  { id: "gpt-4-v", level: 1 },
  { id: "gpt-4-all", level: 1 },
  { id: "gpt-4-dalle", level: 1 },
  { id: "claude-2", level: 1 },
  { id: "claude-2.1", level: 1 },
  { id: "claude-2-100k", level: 1 },
  { id: "midjourney-fast", level: 1 },
];

export const subscriptionPrize: Record<number, number> = {
  1: 42,
  2: 76,
  3: 148,
};

export const subscriptionUsage: SubscriptionUsage = {
  midjourney: { name: "Midjourney", icon: React.createElement(Image) },
  "gpt-4": { name: "GPT-4", icon: React.createElement(Compass) },
  "claude-100k": { name: "Claude 100k", icon: React.createElement(Newspaper) },
};

export function getModelFromId(id: string): Model | undefined {
  return supportModels.find((model) => model.id === id);
}

export function isHighContextModel(id: string): boolean {
  const model = getModelFromId(id);
  return !!model && model.high_context;
}

export function login() {
  location.href = `${deeptrainEndpoint}/login?app=${
    dev ? "dev" : deeptrainAppName
  }`;
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["Authorization"] = getMemory(tokenField);

syncSiteInfo();

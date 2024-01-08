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
import { loadPreferenceModels } from "@/utils/storage.ts";

export const version = "3.8.1";
export const dev: boolean = getDev();
export const deploy: boolean = true;
export let rest_api: string = getRestApi(deploy);
export let ws_api: string = getWebsocketApi(deploy);
export const tokenField = getTokenField(deploy);

export let supportModels: Model[] = loadPreferenceModels([
  // openai models
  {
    id: "gpt-3.5-turbo-0613",
    name: "GPT-3.5",
    avatar: "gpt35turbo.png",
    free: true,
    auth: false,
    high_context: false,
    default: true,
    tag: ["free", "official"],
  },
  {
    id: "gpt-3.5-turbo-16k-0613",
    name: "GPT-3.5-16k",
    avatar: "gpt35turbo16k.webp",
    free: true,
    auth: true,
    high_context: true,
    default: true,
    tag: ["free", "official", "high-context"],
  },
  {
    id: "gpt-3.5-turbo-1106",
    name: "GPT-3.5 1106",
    avatar: "gpt35turbo16k.webp",
    free: true,
    auth: true,
    high_context: true,
    default: true,
    tag: ["free", "official"],
  },
  {
    id: "gpt-3.5-turbo-fast",
    name: "GPT-3.5 Fast",
    avatar: "gpt35turbo16k.webp",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official"],
  },
  {
    id: "gpt-3.5-turbo-16k-fast",
    name: "GPT-3.5 16K Fast",
    avatar: "gpt35turbo16k.webp",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official"],
  },
  {
    id: "gpt-4-0613",
    name: "GPT-4",
    avatar: "gpt4.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "gpt-4-1106-preview",
    name: "GPT-4 Turbo 128k",
    avatar: "gpt432k.webp",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-context", "unstable"],
  },
  {
    id: "gpt-4-vision-preview",
    name: "GPT-4 Vision 128k",
    avatar: "gpt4v.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-context", "multi-modal", "unstable"],
  },
  {
    id: "gpt-4-v",
    name: "GPT-4 Vision",
    avatar: "gpt4v.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "unstable", "multi-modal"],
  },
  {
    id: "gpt-4-dalle",
    name: "GPT-4 DALLE",
    avatar: "gpt4dalle.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "unstable", "image-generation"],
  },

  {
    id: "azure-gpt-3.5-turbo",
    name: "Azure GPT-3.5",
    avatar: "gpt35turbo.png",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official"],
  },
  {
    id: "azure-gpt-3.5-turbo-16k",
    name: "Azure GPT-3.5 16K",
    avatar: "gpt35turbo16k.webp",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official"],
  },
  {
    id: "azure-gpt-4",
    name: "Azure GPT-4",
    avatar: "gpt4.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "azure-gpt-4-1106-preview",
    name: "Azure GPT-4 Turbo 128k",
    avatar: "gpt432k.webp",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-context", "unstable"],
  },
  {
    id: "azure-gpt-4-vision-preview",
    name: "Azure GPT-4 Vision 128k",
    avatar: "gpt4v.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-context", "multi-modal"],
  },
  {
    id: "azure-gpt-4-32k",
    name: "Azure GPT-4 32k",
    avatar: "gpt432k.webp",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "multi-modal"],
  },

  // spark desk
  {
    id: "spark-desk-v3",
    name: "讯飞星火 V3",
    avatar: "sparkdesk.jpg",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "spark-desk-v2",
    name: "讯飞星火 V2",
    avatar: "sparkdesk.jpg",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["official"],
  },
  {
    id: "spark-desk-v1.5",
    name: "讯飞星火 V1.5",
    avatar: "sparkdesk.jpg",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["official"],
  },

  // dashscope models
  {
    id: "qwen-plus-net",
    name: "通义千问 Plus Net",
    avatar: "tongyi.png",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "high-quality", "web"],
  },
  {
    id: "qwen-plus",
    name: "通义千问 Plus",
    avatar: "tongyi.png",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "qwen-turbo-net",
    name: "通义千问 Turbo Net",
    avatar: "tongyi.png",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["official", "web"],
  },
  {
    id: "qwen-turbo",
    name: "通义千问 Turbo",
    avatar: "tongyi.png",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["official"],
  },

  // huyuan models
  {
    id: "hunyuan",
    name: "腾讯混元 Pro",
    avatar: "hunyuan.png",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official"],
  },

  // zhipu models
  {
    id: "zhipu-chatglm-turbo",
    name: "ChatGLM Turbo",
    avatar: "chatglm.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "open-source", "high-context"],
  },

  // baichuan models
  {
    id: "baichuan-53b",
    name: "百川 Baichuan 53B",
    avatar: "baichuan.png",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "open-source"],
  },

  // skylark models
  {
    id: "skylark-chat",
    name: "抖音豆包 Skylark",
    avatar: "skylark.jpg",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official"],
  },

  // 360 models
  {
    id: "360-gpt-v9",
    name: "360 智脑",
    avatar: "360gpt.png",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["official"],
  },

  {
    id: "claude-1-100k",
    name: "Claude",
    avatar: "claude.png",
    free: true,
    auth: true,
    high_context: true,
    default: true,
    tag: ["free", "unstable"],
  },
  {
    id: "claude-2",
    name: "Claude 100k",
    avatar: "claude100k.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-context"],
  },
  {
    id: "claude-2.1",
    name: "Claude 200k",
    avatar: "claude100k.png",
    free: false,
    auth: true,
    high_context: true,
    default: true,
    tag: ["official", "high-context"],
  },

  // llama models
  {
    id: "llama-2-70b",
    name: "LLaMa-2 70B",
    avatar: "llama2.webp",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["open-source", "unstable"],
  },
  {
    id: "llama-2-13b",
    name: "LLaMa-2 13B",
    avatar: "llama2.webp",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["open-source", "unstable"],
  },
  {
    id: "llama-2-7b",
    name: "LLaMa-2 7B",
    avatar: "llama2.webp",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["open-source", "unstable"],
  },

  {
    id: "code-llama-34b",
    name: "Code LLaMa 34B",
    avatar: "llamacode.webp",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["open-source", "unstable"],
  },
  {
    id: "code-llama-13b",
    name: "Code LLaMa 13B",
    avatar: "llamacode.webp",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["open-source", "unstable"],
  },
  {
    id: "code-llama-7b",
    name: "Code LLaMa 7B",
    avatar: "llamacode.webp",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["open-source", "unstable"],
  },

  // new bing
  {
    id: "bing-creative",
    name: "New Bing",
    avatar: "newbing.jpg",
    free: true,
    auth: true,
    high_context: true,
    default: true,
    tag: ["free", "unstable", "web"],
  },

  // google palm2
  {
    id: "chat-bison-001",
    name: "Google PaLM2",
    avatar: "palm2.webp",
    free: true,
    auth: true,
    high_context: false,
    default: false,
    tag: ["free", "english-model"],
  },

  // gemini
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    avatar: "gemini.jpeg",
    free: true,
    auth: true,
    high_context: true,
    default: true,
    tag: ["free", "official"],
  },
  {
    id: "gemini-pro-vision",
    name: "Gemini Pro Vision",
    avatar: "gemini.jpeg",
    free: true,
    auth: true,
    high_context: true,
    default: true,
    tag: ["free", "official", "multi-modal"],
  },

  // drawing models
  {
    id: "midjourney",
    name: "Midjourney",
    avatar: "midjourney.jpg",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "image-generation"],
  },
  {
    id: "midjourney-fast",
    name: "Midjourney Fast",
    avatar: "midjourney.jpg",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "fast", "image-generation"],
  },
  {
    id: "midjourney-turbo",
    name: "Midjourney Turbo",
    avatar: "midjourney.jpg",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "fast", "image-generation"],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion XL",
    avatar: "stablediffusion.jpeg",
    free: false,
    auth: true,
    high_context: false,
    default: false,
    tag: ["open-source", "unstable", "image-generation"],
  },
  {
    id: "dall-e-2",
    name: "DALLE 2",
    avatar: "dalle.jpeg",
    free: true,
    auth: true,
    high_context: false,
    default: true,
    tag: ["free", "official", "image-generation"],
  },
  {
    id: "dall-e-3",
    name: "DALLE 3",
    avatar: "dalle.jpeg",
    free: false,
    auth: true,
    high_context: false,
    default: true,
    tag: ["official", "image-generation"],
  },

  {
    id: "gpt-4-32k-0613",
    name: "GPT-4-32k",
    avatar: "gpt432k.webp",
    free: false,
    auth: true,
    high_context: true,
    default: false,
    tag: ["official", "high-quality", "high-price"],
  },
]);

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

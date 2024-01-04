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
    free: true,
    auth: false,
    high_context: false,
    tag: ["free", "official"],
  },
  {
    id: "gpt-3.5-turbo-16k-0613",
    name: "GPT-3.5-16k",
    free: true,
    auth: true,
    high_context: true,
    tag: ["free", "official", "high-context"],
  },
  {
    id: "gpt-3.5-turbo-1106",
    name: "GPT-3.5 1106",
    free: true,
    auth: true,
    high_context: true,
    tag: ["free", "official"],
  },
  {
    id: "gpt-3.5-turbo-fast",
    name: "GPT-3.5 Fast",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },
  {
    id: "gpt-3.5-turbo-16k-fast",
    name: "GPT-3.5 16K Fast",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official"],
  },
  {
    id: "gpt-4-0613",
    name: "GPT-4",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "gpt-4-1106-preview",
    name: "GPT-4 Turbo 128k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-context", "unstable"],
  },
  {
    id: "gpt-4-vision-preview",
    name: "GPT-4 Vision 128k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-context", "multi-modal", "unstable"],
  },
  {
    id: "gpt-4-v",
    name: "GPT-4 Vision",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "unstable", "multi-modal"],
  },
  {
    id: "gpt-4-dalle",
    name: "GPT-4 DALLE",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "unstable", "image-generation"],
  },

  {
    id: "azure-gpt-3.5-turbo",
    name: "Azure GPT-3.5",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },
  {
    id: "azure-gpt-3.5-turbo-16k",
    name: "Azure GPT-3.5 16K",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official"],
  },
  {
    id: "azure-gpt-4",
    name: "Azure GPT-4",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "azure-gpt-4-1106-preview",
    name: "Azure GPT-4 Turbo 128k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-context", "unstable"],
  },
  {
    id: "azure-gpt-4-vision-preview",
    name: "Azure GPT-4 Vision 128k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-context", "multi-modal"],
  },
  {
    id: "azure-gpt-4-32k",
    name: "Azure GPT-4 32k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "multi-modal"],
  },

  // spark desk
  {
    id: "spark-desk-v3",
    name: "讯飞星火 V3",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "high-quality"],
  },
  {
    id: "spark-desk-v2",
    name: "讯飞星火 V2",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },
  {
    id: "spark-desk-v1.5",
    name: "讯飞星火 V1.5",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },

  // dashscope models
  {
    id: "qwen-plus-net",
    name: "通义千问 Plus Net",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "high-quality", "web"],
  },
  {
    id: "qwen-plus",
    name: "通义千问 Plus",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "high-quality"],
  },
  {
    id: "qwen-turbo-net",
    name: "通义千问 Turbo Net",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "web"],
  },
  {
    id: "qwen-turbo",
    name: "通义千问 Turbo",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },

  // huyuan models
  {
    id: "hunyuan",
    name: "腾讯混元 Pro",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },

  // zhipu models
  {
    id: "zhipu-chatglm-turbo",
    name: "ChatGLM Turbo",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "open-source", "high-context"],
  },

  // baichuan models
  {
    id: "baichuan-53b",
    name: "百川 Baichuan 53B",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "open-source"],
  },

  // skylark models
  {
    id: "skylark-chat",
    name: "抖音豆包 Skylark",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },

  // 360 models
  {
    id: "360-gpt-v9",
    name: "360 智脑",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official"],
  },

  {
    id: "claude-1-100k",
    name: "Claude",
    free: true,
    auth: true,
    high_context: true,
    tag: ["free", "unstable"],
  },
  {
    id: "claude-2",
    name: "Claude 100k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-context"],
  },
  {
    id: "claude-2.1",
    name: "Claude 200k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-context"],
  },

  // llama models
  {
    id: "llama-2-70b",
    name: "LLaMa-2 70B",
    free: false,
    auth: true,
    high_context: false,
    tag: ["open-source", "unstable"],
  },
  {
    id: "llama-2-13b",
    name: "LLaMa-2 13B",
    free: false,
    auth: true,
    high_context: false,
    tag: ["open-source", "unstable"],
  },
  {
    id: "llama-2-7b",
    name: "LLaMa-2 7B",
    free: false,
    auth: true,
    high_context: false,
    tag: ["open-source", "unstable"],
  },

  {
    id: "code-llama-34b",
    name: "Code LLaMa 34B",
    free: false,
    auth: true,
    high_context: false,
    tag: ["open-source", "unstable"],
  },
  {
    id: "code-llama-13b",
    name: "Code LLaMa 13B",
    free: false,
    auth: true,
    high_context: false,
    tag: ["open-source", "unstable"],
  },
  {
    id: "code-llama-7b",
    name: "Code LLaMa 7B",
    free: false,
    auth: true,
    high_context: false,
    tag: ["open-source", "unstable"],
  },

  // new bing
  {
    id: "bing-creative",
    name: "New Bing",
    free: true,
    auth: true,
    high_context: true,
    tag: ["free", "unstable", "web"],
  },

  // google palm2
  {
    id: "chat-bison-001",
    name: "Google PaLM2",
    free: true,
    auth: true,
    high_context: false,
    tag: ["free", "english-model"],
  },

  // gemini
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    free: true,
    auth: true,
    high_context: true,
    tag: ["free", "official"],
  },
  {
    id: "gemini-pro-vision",
    name: "Gemini Pro Vision",
    free: true,
    auth: true,
    high_context: true,
    tag: ["free", "official", "multi-modal"],
  },

  // drawing models
  {
    id: "midjourney",
    name: "Midjourney",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "image-generation"],
  },
  {
    id: "midjourney-fast",
    name: "Midjourney Fast",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "fast", "image-generation"],
  },
  {
    id: "midjourney-turbo",
    name: "Midjourney Turbo",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "fast", "image-generation"],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion XL",
    free: false,
    auth: true,
    high_context: false,
    tag: ["open-source", "unstable", "image-generation"],
  },
  {
    id: "dall-e-2",
    name: "DALLE 2",
    free: true,
    auth: true,
    high_context: false,
    tag: ["free", "official", "image-generation"],
  },
  {
    id: "dall-e-3",
    name: "DALLE 3",
    free: false,
    auth: true,
    high_context: false,
    tag: ["official", "image-generation"],
  },

  {
    id: "gpt-4-32k-0613",
    name: "GPT-4-32k",
    free: false,
    auth: true,
    high_context: true,
    tag: ["official", "high-quality", "high-price"],
  },
]);

export const defaultModels = [
  "gpt-3.5-turbo-0613",
  "gpt-3.5-turbo-16k-0613",
  "gpt-4-0613",
  "gpt-4-1106-preview",

  "gpt-4-v",
  "gpt-4-dalle",

  "azure-gpt-3.5-turbo",
  "azure-gpt-3.5-turbo-16k",
  "azure-gpt-4",
  "azure-gpt-4-1106-preview",
  "azure-gpt-4-vision-preview",
  "azure-gpt-4-32k",

  "claude-1-100k",
  "claude-2",
  "claude-2.1",

  "spark-desk-v3",
  "qwen-plus",
  "hunyuan",
  "zhipu-chatglm-turbo",
  "baichuan-53b",

  "gemini-pro",
  "gemini-pro-vision",

  "dall-e-2",
  "midjourney-fast",
  "stable-diffusion",
];

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

export const modelAvatars: Record<string, string> = {
  "gpt-3.5-turbo-0613": "gpt35turbo.png",
  "gpt-3.5-turbo-16k-0613": "gpt35turbo16k.webp",
  "gpt-3.5-turbo-1106": "gpt35turbo16k.webp",
  "gpt-3.5-turbo-fast": "gpt35turbo16k.webp",
  "gpt-3.5-turbo-16k-fast": "gpt35turbo16k.webp",
  "gpt-4-0613": "gpt4.png",
  "gpt-4-1106-preview": "gpt432k.webp",
  "gpt-4-vision-preview": "gpt4v.png",
  "gpt-4-all": "gpt4.png",
  "gpt-4-32k-0613": "gpt432k.webp",
  "gpt-4-v": "gpt4v.png",
  "gpt-4-dalle": "gpt4dalle.png",
  "azure-gpt-3.5-turbo": "gpt35turbo.png",
  "azure-gpt-3.5-turbo-16k": "gpt35turbo16k.webp",
  "azure-gpt-4": "gpt4.png",
  "azure-gpt-4-1106-preview": "gpt432k.webp",
  "azure-gpt-4-vision-preview": "gpt4v.png",
  "azure-gpt-4-32k": "gpt432k.webp",
  "claude-1-100k": "claude.png",
  "claude-2": "claude100k.png",
  "claude-2.1": "claude100k.png",
  "stable-diffusion": "stablediffusion.jpeg",
  "llama-2-70b": "llama2.webp",
  "llama-2-13b": "llama2.webp",
  "llama-2-7b": "llama2.webp",
  "code-llama-34b": "llamacode.webp",
  "code-llama-13b": "llamacode.webp",
  "code-llama-7b": "llamacode.webp",
  "dall-e-3": "dalle.jpeg",
  "dall-e-2": "dalle.jpeg",
  midjourney: "midjourney.jpg",
  "midjourney-fast": "midjourney.jpg",
  "midjourney-turbo": "midjourney.jpg",
  "bing-creative": "newbing.jpg",
  "chat-bison-001": "palm2.webp",
  "gemini-pro": "gemini.jpeg",
  "gemini-pro-vision": "gemini.jpeg",
  "zhipu-chatglm-turbo": "chatglm.png",
  "qwen-plus-net": "tongyi.png",
  "qwen-plus": "tongyi.png",
  "qwen-turbo-net": "tongyi.png",
  "qwen-turbo": "tongyi.png",
  "spark-desk-v3": "sparkdesk.jpg",
  "spark-desk-v2": "sparkdesk.jpg",
  "spark-desk-v1.5": "sparkdesk.jpg",
  hunyuan: "hunyuan.png",
  "360-gpt-v9": "360gpt.png",
  "baichuan-53b": "baichuan.png",
  "skylark-chat": "skylark.jpg",
};

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

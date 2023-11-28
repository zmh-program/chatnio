import axios from "axios";
import { Model, PlanModel } from "@/api/types.ts";
import {
  getDev,
  getRestApi,
  getTokenField,
  getWebsocketApi,
} from "@/utils/env.ts";
import { getMemory } from "@/utils/memory.ts";

export const version = "3.7.0";
export const dev: boolean = getDev();
export const deploy: boolean = true;
export let rest_api: string = getRestApi(deploy);
export let ws_api: string = getWebsocketApi(deploy);
export const tokenField = getTokenField(deploy);
export const supportModels: Model[] = [
  // openai models
  {
    id: "gpt-3.5-turbo-0613",
    name: "GPT-3.5",
    free: true,
    auth: false,
    tag: ["free", "official"],
  },
  {
    id: "gpt-3.5-turbo-16k-0613",
    name: "GPT-3.5-16k",
    free: true,
    auth: true,
    tag: ["free", "official", "high-context"],
  },
  {
    id: "gpt-3.5-turbo-1106",
    name: "GPT-3.5 1106",
    free: true,
    auth: true,
    tag: ["free", "official"],
  },
  {
    id: "gpt-4-0613",
    name: "GPT-4",
    free: false,
    auth: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "gpt-4-1106-preview",
    name: "GPT-4 Turbo 128k",
    free: false,
    auth: true,
    tag: ["official", "high-context", "unstable"],
  },
  {
    id: "gpt-4-vision-preview",
    name: "GPT-4 Vision 128k",
    free: false,
    auth: true,
    tag: ["official", "high-context", "multi-modal", "unstable"],
  },
  {
    id: "gpt-4-v",
    name: "GPT-4 Vision",
    free: false,
    auth: true,
    tag: ["official", "unstable", "multi-modal"],
  },
  {
    id: "gpt-4-dalle",
    name: "GPT-4 DALLE",
    free: false,
    auth: true,
    tag: ["official", "unstable", "image-generation"],
  },

  // spark desk
  {
    id: "spark-desk-v3",
    name: "讯飞星火 V3",
    free: false,
    auth: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "spark-desk-v2",
    name: "讯飞星火 V2",
    free: false,
    auth: true,
    tag: ["official"],
  },
  {
    id: "spark-desk-v1.5",
    name: "讯飞星火 V1.5",
    free: false,
    auth: true,
    tag: ["official"],
  },

  // dashscope models
  {
    id: "qwen-plus-net",
    name: "通义千问 Plus Net",
    free: false,
    auth: true,
    tag: ["official", "high-quality", "web"],
  },
  {
    id: "qwen-plus",
    name: "通义千问 Plus",
    free: false,
    auth: true,
    tag: ["official", "high-quality"],
  },
  {
    id: "qwen-turbo-net",
    name: "通义千问 Turbo Net",
    free: false,
    auth: true,
    tag: ["official", "web"],
  },
  {
    id: "qwen-turbo",
    name: "通义千问 Turbo",
    free: false,
    auth: true,
    tag: ["official"],
  },

  // huyuan models
  {
    id: "hunyuan",
    name: "腾讯混元 Pro",
    free: false,
    auth: true,
    tag: ["official"],
  },

  // zhipu models
  {
    id: "zhipu-chatglm-turbo",
    name: "ChatGLM Turbo",
    free: false,
    auth: true,
    tag: ["official", "open-source", "high-context"],
  },

  // baichuan models
  {
    id: "baichuan-53b",
    name: "百川 Baichuan 53B",
    free: false,
    auth: true,
    tag: ["official", "open-source"],
  },

  // skylark models
  {
    id: "skylark-chat",
    name: "抖音豆包 Skylark",
    free: false,
    auth: true,
    tag: ["official"],
  },

  // 360 models
  {
    id: "360-gpt-v9",
    name: "360 智脑",
    free: false,
    auth: true,
    tag: ["official"],
  },

  {
    id: "claude-1-100k",
    name: "Claude",
    free: true,
    auth: true,
    tag: ["free", "unstable"],
  },
  {
    id: "claude-2",
    name: "Claude 100k",
    free: false,
    auth: true,
    tag: ["official", "high-context"],
  },

  // llama models
  {
    id: "llama-2-70b",
    name: "LLaMa-2 70B",
    free: false,
    auth: true,
    tag: ["open-source", "unstable"],
  },
  {
    id: "llama-2-13b",
    name: "LLaMa-2 13B",
    free: false,
    auth: true,
    tag: ["open-source", "unstable"],
  },
  {
    id: "llama-2-7b",
    name: "LLaMa-2 7B",
    free: false,
    auth: true,
    tag: ["open-source", "unstable"],
  },

  {
    id: "code-llama-34b",
    name: "Code LLaMa 34B",
    free: false,
    auth: true,
    tag: ["open-source", "unstable"],
  },
  {
    id: "code-llama-13b",
    name: "Code LLaMa 13B",
    free: false,
    auth: true,
    tag: ["open-source", "unstable"],
  },
  {
    id: "code-llama-7b",
    name: "Code LLaMa 7B",
    free: false,
    auth: true,
    tag: ["open-source", "unstable"],
  },

  // new bing
  {
    id: "bing-creative",
    name: "New Bing",
    free: true,
    auth: true,
    tag: ["free", "unstable", "web"],
  },

  // google palm2
  {
    id: "chat-bison-001",
    name: "Google PaLM2",
    free: true,
    auth: true,
    tag: ["free", "english-model"],
  },

  // drawing models
  {
    id: "midjourney",
    name: "Midjourney",
    free: false,
    auth: true,
    tag: ["official", "image-generation"],
  },
  {
    id: "midjourney-fast",
    name: "Midjourney Fast",
    free: false,
    auth: true,
    tag: ["official", "fast", "image-generation"],
  },
  {
    id: "midjourney-turbo",
    name: "Midjourney Turbo",
    free: false,
    auth: true,
    tag: ["official", "fast", "image-generation"],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion XL",
    free: false,
    auth: true,
    tag: ["open-source", "unstable", "image-generation"],
  },
  {
    id: "dall-e-3",
    name: "DALLE 3",
    free: false,
    auth: true,
    tag: ["official", "high-price", "image-generation"],
  },
  {
    id: "dall-e-2",
    name: "DALLE 2",
    free: true,
    auth: true,
    tag: ["free", "official", "image-generation"],
  },

  {
    id: "gpt-4-32k-0613",
    name: "GPT-4-32k",
    free: false,
    auth: true,
    tag: ["official", "high-quality", "high-price"],
  },
];

export const defaultModels = [
  "gpt-3.5-turbo-0613",
  "gpt-3.5-turbo-16k-0613",
  "gpt-4-0613",
  "gpt-4-1106-preview",

  "gpt-4-v",
  "gpt-4-dalle",

  "claude-1-100k",
  "claude-2",

  "spark-desk-v3",
  "qwen-plus",
  "hunyuan",
  "zhipu-chatglm-turbo",
  "baichuan-53b",

  "dall-e-2",
  "midjourney-fast",
  "stable-diffusion",
];

export const largeContextModels = [
  "gpt-3.5-turbo-16k-0613",
  "gpt-4-1106-preview",
  "gpt-4-vision-preview",
  "gpt-4-all",
  "gpt-4-32k-0613",
  "claude-1",
  "claude-1-100k",
  "claude-2",
  "claude-2-100k",
  "zhipu-chatglm-turbo",
];

export const planModels: PlanModel[] = [
  { id: "gpt-4-0613", level: 1 },
  { id: "gpt-4-1106-preview", level: 1 },
  { id: "gpt-4-vision-preview", level: 1 },
  { id: "gpt-4-v", level: 1 },
  { id: "gpt-4-all", level: 1 },
  { id: "gpt-4-dalle", level: 1 },
  { id: "claude-2", level: 1 },
  { id: "claude-2-100k", level: 1 },
  { id: "midjourney-fast", level: 2 },
];

export const expensiveModels = [
  "dall-e-3",
  "midjourney-turbo",
  "gpt-4-32k-0613",
];

export const modelAvatars: Record<string, string> = {
  "gpt-3.5-turbo-0613": "gpt35turbo.png",
  "gpt-3.5-turbo-16k-0613": "gpt35turbo16k.webp",
  "gpt-3.5-turbo-1106": "gpt35turbo16k.webp",
  "gpt-4-0613": "gpt4.png",
  "gpt-4-1106-preview": "gpt432k.webp",
  "gpt-4-vision-preview": "gpt4v.png",
  "gpt-4-all": "gpt4.png",
  "gpt-4-32k-0613": "gpt432k.webp",
  "gpt-4-v": "gpt4v.png",
  "gpt-4-dalle": "gpt4dalle.png",
  "claude-1-100k": "claude.png",
  "claude-2": "claude100k.png",
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
  1: 18,
  2: 36,
  3: 72,
};

export function login() {
  location.href = `https://deeptrain.net/login?app=${dev ? "dev" : "chatnio"}`;
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["Authorization"] = getMemory(tokenField);

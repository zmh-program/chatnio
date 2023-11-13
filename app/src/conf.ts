import axios from "axios";
import { Model } from "./conversation/types.ts";
import {
  getDev,
  getRestApi,
  getTokenField,
  getWebsocketApi,
} from "@/utils/env.ts";
import { getMemory } from "@/utils/memory.ts";

export const version = "3.6.21";
export const dev: boolean = getDev();
export const deploy: boolean = true;
export let rest_api: string = getRestApi(deploy);
export let ws_api: string = getWebsocketApi(deploy);
export let blob_api: string = "https://blob.chatnio.net";
export const tokenField = getTokenField(deploy);

export const supportModels: Model[] = [
  // openai models
  { id: "gpt-3.5-turbo-0613", name: "GPT-3.5", free: true, auth: false },
  { id: "gpt-3.5-turbo-16k-0613", name: "GPT-3.5-16k", free: true, auth: true },
  { id: "gpt-3.5-turbo-1106", name: "GPT-3.5 1106", free: true, auth: false },
  { id: "gpt-4-0613", name: "GPT-4", free: false, auth: true },
  { id: "gpt-4-1106-preview", name: "GPT-4 Turbo", free: false, auth: true },

  // anthropic models
  { id: "claude-1-100k", name: "Claude-2", free: true, auth: true },
  { id: "claude-2", name: "Claude-2-100k", free: false, auth: true },

  // spark desk
  { id: "spark-desk-v3", name: "讯飞星火 V3", free: true, auth: true },
  { id: "spark-desk-v2", name: "讯飞星火 V2", free: true, auth: true },
  { id: "spark-desk-v1.5", name: "讯飞星火 V1.5", free: true, auth: true },

  // dashscope models
  { id: "qwen-plus-net", name: "通义千问 Plus X", free: false, auth: true },
  { id: "qwen-plus", name: "通义千问 Plus", free: false, auth: true },
  { id: "qwen-turbo-net", name: "通义千问 Turbo X", free: false, auth: true },
  { id: "qwen-turbo", name: "通义千问 Turbo", free: false, auth: true },

  // zhipu models
  {
    id: "zhipu-chatglm-turbo",
    name: "ChatGLM Turbo 32k",
    free: false,
    auth: true,
  },

  // llama models
  { id: "llama-2-70b", name: "LLaMa-2 70B", free: false, auth: true },
  { id: "llama-2-13b", name: "LLaMa-2 13B", free: false, auth: true },
  { id: "llama-2-7b", name: "LLaMa-2 7B", free: false, auth: true },

  { id: "code-llama-34b", name: "Code LLaMa 34B", free: false, auth: true },
  { id: "code-llama-13b", name: "Code LLaMa 13B", free: false, auth: true },
  { id: "code-llama-7b", name: "Code LLaMa 7B", free: false, auth: true },

  // drawing models
  {
    id: "stable-diffusion",
    name: "Stable Diffusion XL",
    free: false,
    auth: true,
  },

  // new bing
  { id: "bing-creative", name: "New Bing", free: true, auth: true },

  // google palm2
  { id: "chat-bison-001", name: "Palm2", free: true, auth: true },

  // dalle models
  { id: "dall-e-3", name: "DALLE 3", free: false, auth: true },
  { id: "dall-e-2", name: "DALLE 2", free: true, auth: true },

  { id: "midjourney", name: "Midjourney", free: false, auth: true },
  { id: "midjourney-fast", name: "Midjourney Fast", free: false, auth: true },
  { id: "midjourney-turbo", name: "Midjourney Turbo", free: false, auth: true },

  // reverse models
  { id: "gpt-4-v", name: "GPT-4 Vision", free: false, auth: true },
  { id: "gpt-4-dalle", name: "GPT-4 DALLE", free: false, auth: true },

  // high price models
  { id: "gpt-4-32k-0613", name: "GPT-4-32k", free: false, auth: true },
];

export const largeContextModels = [
  "gpt-3.5-turbo-16k-0613",
  "gpt-4-1106-preview",
  "gpt-4-all",
  "gpt-4-32k-0613",
  "claude-1",
  "claude-1-100k",
  "claude-2",
  "claude-2-100k",
  "zhipu-chatglm-turbo",
];

export const studentModels = ["claude-1-100k", "claude-2-100k", "claude-2"];

export const planModels = [
  "gpt-4-0613",
  "gpt-4-1106-preview",
  "gpt-4-v",
  "gpt-4-all",
  "gpt-4-dalle",
  "claude-2",
  "claude-1-100k",
  "claude-2-100k",
];

export const expensiveModels = [
  "dall-e-3",
  "midjourney-turbo",
  "gpt-4-32k-0613",
];

export function login() {
  location.href = `https://deeptrain.net/login?app=${dev ? "dev" : "chatnio"}`;
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["Authorization"] = getMemory(tokenField);

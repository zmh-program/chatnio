import axios from "axios";
import { Model } from "./conversation/types.ts";
import {
  getDev,
  getRestApi,
  getTokenField,
  getWebsocketApi,
} from "@/utils/env.ts";
import { getMemory } from "@/utils/memory.ts";

export const version = "3.6.15easter";
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
  { id: "gpt-4-1106-preview", name: "GPT-4 1106 Preview", free: false, auth: true },
  { id: "gpt-4-v", name: "GPT-4 Vision", free: false, auth: true },
  { id: "gpt-4-dalle", name: "GPT-4 DALLE", free: false, auth: true },

  // anthropic models
  { id: "claude-2", name: "Claude-2", free: true, auth: true },
  { id: "claude-1-100k", name: "Claude-1-100k", free: false, auth: true },
  { id: "claude-2-100k", name: "Claude-2-100k", free: false, auth: true },

  // spark desk
  { id: "spark-desk-v3", name: "讯飞星火 V3", free: true, auth: true },
  { id: "spark-desk-v2", name: "讯飞星火 V2", free: true, auth: true },
  { id: "spark-desk-v1.5", name: "讯飞星火 V1.5", free: true, auth: true },

  // dashscope models
  { id: "qwen-plus-net", name: "通义千问 Plus X", free: false, auth: true },
  { id: "qwen-plus", name: "通义千问 Plus", free: false, auth: true },
  { id: "qwen-turbo-net", name: "通义千问 Turbo X", free: false, auth: true },
  { id: "qwen-turbo", name: "通义千问 Turbo", free: false, auth: true },

  // google palm2
  { id: "chat-bison-001", name: "Palm2", free: true, auth: true },

  // new bing
  { id: "bing-creative", name: "New Bing", free: true, auth: true },

  // zhipu models
  { id: "zhipu-chatglm-pro", name: "ChatGLM Pro", free: false, auth: true },
  { id: "zhipu-chatglm-std", name: "ChatGLM Std", free: false, auth: true },
  { id: "zhipu-chatglm-lite", name: "ChatGLM Lite", free: true, auth: true },

  { id: "dalle", name: "DALLE2", free: true, auth: true },
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
];

export const studentModels = ["claude-1-100k", "claude-2-100k"];

export const planModels = [
  "gpt-4-0613",
  "gpt-4-1106-preview",
  "gpt-4-v",
  "gpt-4-all",
  "gpt-4-dalle",
  "claude-1-100k",
  "claude-2-100k",
];

export const expensiveModels = ["gpt-4-32k-0613"];

export function login() {
  location.href = `https://deeptrain.net/login?app=${dev ? "dev" : "chatnio"}`;
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["Authorization"] = getMemory(tokenField);

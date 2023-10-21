import axios from "axios";
import { Model } from "./conversation/types.ts";

export const version = "3.4.6";
export const deploy: boolean = true;
export let rest_api: string = "http://localhost:8094";
export let ws_api: string = "ws://localhost:8094";

if (deploy) {
  rest_api = "https://api.chatnio.net";
  ws_api = "wss://api.chatnio.net";
}

export const tokenField = deploy ? "token" : "token-dev";
export const supportModels: Model[] = [
  // openai models
  { id: "gpt-3.5-turbo", name: "GPT-3.5", free: true, auth: false },
  { id: "gpt-3.5-turbo-16k", name: "GPT-3.5-16k", free: true, auth: true },
  { id: "gpt-4", name: "GPT-4", free: false, auth: true },
  { id: "gpt-4-32k", name: "GPT-4-32k", free: false, auth: true },

  // anthropic models
  { id: "claude-1", name: "Claude-2", free: true, auth: false },
  { id: "claude-2", name: "Claude-2-100k", free: false, auth: true }, // not claude-2-100k

  // spark desk
  { id: "spark-desk", name: "SparkDesk 讯飞星火", free: false, auth: true },

  // google palm2
  { id: "chat-bison-001", name: "Palm2", free: true, auth: true },

  // new bing
  { id: "bing-creative", name: "New Bing", free: true, auth: true },

  // zhipu models
  {
    id: "zhipu-chatglm-pro",
    name: "智谱 ChatGLM Pro",
    free: false,
    auth: true,
  },
  {
    id: "zhipu-chatglm-std",
    name: "智谱 ChatGLM Std",
    free: false,
    auth: true,
  },
  {
    id: "zhipu-chatglm-lite",
    name: "智谱 ChatGLM Lite",
    free: true,
    auth: true,
  },
];

export const supportModelConvertor: Record<string, string> = {
  "GPT-3.5": "gpt-3.5-turbo",
  "GPT-3.5-16k": "gpt-3.5-turbo-16k",
  "GPT-4": "gpt-4",
  "GPT-4-32k": "gpt-4-32k",
  "Claude-2": "claude-1",
  "Claude-2-100k": "claude-2", // not claude-2-100k
  "SparkDesk 讯飞星火": "spark-desk",
  Palm2: "chat-bison-001",
  "New Bing": "bing-creative",
  "智谱 ChatGLM Pro": "zhipu-chatglm-pro",
  "智谱 ChatGLM Std": "zhipu-chatglm-std",
  "智谱 ChatGLM Lite": "zhipu-chatglm-lite",
};

export function login() {
  location.href = "https://deeptrain.net/login?app=chatnio";
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";

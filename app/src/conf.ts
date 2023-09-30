import axios from "axios";

export const version: string = "3.2.0";
export const deploy: boolean = true;
export let rest_api: string = "http://localhost:8094";
export let ws_api: string = "ws://localhost:8094";

if (deploy) {
  rest_api = "https://api.chatnio.net";
  ws_api = "wss://api.chatnio.net";
}

export const tokenField = deploy ? "token" : "token-dev";
export const supportModels: string[] = [
  "GPT-3.5",
  "GPT-3.5-16k",
  "GPT-4",
  "GPT-4-32k",
  "SparkDesk 讯飞星火",
  "Palm2"
  // "Claude-2",
  // "Claude-2-100k",
];

export const supportModelConvertor: Record<string, string> = {
  "GPT-3.5": "gpt-3.5-turbo",
  "GPT-3.5-16k": "gpt-3.5-turbo-16k",
  "GPT-4": "gpt-4",
  "GPT-4-32k": "gpt-4-32k",
  "Claude-2": "claude-2",
  "Claude-2-100k": "claude-2-100k",
  "SparkDesk 讯飞星火": "spark-desk",
  "Palm2": "chat-bison-001"
};

export function login() {
  location.href = "https://deeptrain.lightxi.com/login?app=chatnio";
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";

console.debug(`chatnio application (version: ${version})`);

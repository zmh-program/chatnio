export const modelColorMapper: Record<string, string> = {
  "gpt-3.5-turbo": "#34bf49",
  "gpt-3.5-turbo-instruct": "#34bf49",
  "gpt-3.5-turbo-0613": "#34bf49",
  "gpt-3.5-turbo-0301": "#34bf49",
  "gpt-3.5-turbo-1106": "#11ba2b",
  dalle: "#e4e5e5",
  "dall-e-2": "#e4e5e5",
  "dall-e-3": "#e4e5e5",

  midjourney: "#7300ff",
  "midjourney-fast": "#7300ff",
  "midjourney-turbo": "#7300ff",
  "stable-diffusion": "#d4d4d4",

  "gpt-3.5-turbo-16k": "#0abf53",
  "gpt-3.5-turbo-16k-0613": "#0abf53",
  "gpt-3.5-turbo-16k-0301": "#0abf53",

  "gpt-4": "#8e43e7",
  "gpt-4-1106-preview": "#8e43e7",
  "gpt-4-vision-preview": "#8e43e7",
  "gpt-4-0613": "#8e43e7",
  "gpt-4-0314": "#8e43e7",
  "gpt-4-all": "#8e43e7",
  "gpt-4-v": "#8e43e7",
  "gpt-4-dalle": "#8e43e7",
  "gpt-4-free": "#424242",

  "gpt-4-32k": "#8329f1",
  "gpt-4-32k-0613": "#8329f1",
  "gpt-4-32k-0314": "#8329f1",

  "claude-1": "#ff9d3b",
  "claude-1-100k": "#ff9d3b",
  "claude-slack": "#ff9d3b",
  "claude-2": "#ff840b",
  "claude-2.1": "#ff840b",
  "claude-2-100k": "#ff840b",

  "spark-desk-v1.5": "#06b3e8",
  "spark-desk-v2": "#06b3e8",
  "spark-desk-v3": "#06b3e8",

  "chat-bison-001": "#f82a53",
  "gemini-pro": "#f82a53",
  "gemini-pro-vision": "#f82a53",

  "bing-creative": "#2673e7",
  "bing-balanced": "#2673e7",
  "bing-precise": "#2673e7",

  "zhipu-chatglm-turbo": "#008272",
  "zhipu-chatglm-pro": "#008272",
  "zhipu-chatglm-std": "#008272",
  "zhipu-chatglm-lite": "#008272",

  "qwen-plus": "#615ced",
  "qwen-plus-net": "#615ced",
  "qwen-turbo": "#716cfd",
  "qwen-turbo-net": "#716cfd",

  "llama-2-70b": "#01a9f0",
  "llama-2-13b": "#01a9f0",
  "llama-2-7b": "#01a9f0",
  "code-llama-34b": "#01a9f0",
  "code-llama-13b": "#01a9f0",
  "code-llama-7b": "#01a9f0",

  hunyuan: "#0052d9",
  "360-gpt-v9": "#1db91e",
  "baichuan-53b": "#ff9800",
  "skylark-lite-public": "#a4f2ff",
  "skylark-plus-public": "#a4f2ff",
  "skylark-pro-public": "#a4f2ff",
  "skylark-chat": "#a4f2ff",
};

export function getModelColor(model: string): string {
  return modelColorMapper[model] || "#111";
}

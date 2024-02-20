export const modelColorMapper: Record<string, string> = {
  "gpt-3.5-turbo": "green-500",
  "gpt-3.5-turbo-instruct": "green-500",
  "gpt-3.5-turbo-0613": "green-500",
  "gpt-3.5-turbo-0301": "green-500",
  "gpt-3.5-turbo-1106": "green-500",
  "gpt-3.5-turbo-0125": "green-500",
  dalle: "green-600",
  "dall-e-2": "green-600",

  midjourney: "#7300ff",
  "midjourney-fast": "#7300ff",
  "midjourney-turbo": "#7300ff",
  "stable-diffusion": "#d4d4d4",

  "gpt-3.5-turbo-16k": "#0abf53",
  "gpt-3.5-turbo-16k-0613": "#0abf53",
  "gpt-3.5-turbo-16k-0301": "#0abf53",

  "gpt-4": "purple-600",
  "gpt-4-1106-preview": "purple-600",
  "gpt-4-0125-preview": "purple-600",
  "gpt-4-turbo-preview": "purple-600",
  "gpt-4-1106-vision-preview": "purple-600",
  "gpt-4-vision-preview": "purple-600",
  "gpt-4-0613": "purple-600",
  "gpt-4-0314": "purple-600",
  "gpt-4-all": "purple-600",
  "gpt-4-v": "purple-600",
  "gpt-4-dalle": "purple-600",
  "gpt-4-32k": "purple-600",
  "gpt-4-32k-0613": "purple-600",
  "gpt-4-32k-0314": "purple-600",

  "dall-e-3": "purple-700",

  "claude-1": "orange-400",
  "claude-1-100k": "orange-400",
  "claude-slack": "orange-400",
  "claude-2": "orange-400",
  "claude-2.1": "orange-400",
  "claude-2-100k": "orange-400",

  "spark-desk-v1.5": "blue-400",
  "spark-desk-v2": "blue-400",
  "spark-desk-v3": "blue-400",
  "spark-desk-v3.5": "blue-400",

  "chat-bison-001": "red-500",
  "gemini-pro": "red-500",
  "gemini-pro-vision": "red-500",

  "bing-creative": "blue-700",
  "bing-balanced": "blue-700",
  "bing-precise": "blue-700",

  "zhipu-chatglm-turbo": "lime-500",
  "zhipu-chatglm-pro": "lime-500",
  "zhipu-chatglm-std": "lime-500",
  "zhipu-chatglm-lite": "lime-500",

  "qwen-plus": "indigo-600",
  "qwen-plus-net": "indigo-600",
  "qwen-turbo": "indigo-600",
  "qwen-turbo-net": "indigo-600",

  "llama-2-70b": "sky-400",
  "llama-2-13b": "sky-400",
  "llama-2-7b": "sky-400",
  "code-llama-34b": "sky-400",
  "code-llama-13b": "sky-400",
  "code-llama-7b": "sky-400",

  hunyuan: "blue-500",
  "360-gpt-v9": "stone-500",
  "baichuan-53b": "orange-700",

  "skylark-lite-public": "sky-300",
  "skylark-plus-public": "sky-300",
  "skylark-pro-public": "sky-300",
  "skylark-chat": "sky-300",
};

export function getModelColor(model: string): string {
  return modelColorMapper[model] || "gray-700";
}

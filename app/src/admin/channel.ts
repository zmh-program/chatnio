export type Channel = {
  id: number;
  name: string;
  type: string;
  models: string[];
  priority: number;
  weight: number;
  retry: number;
  secret: string;
  endpoint: string;
  mapper: string;
  state: boolean;
  group?: string[];
};

export type ChannelInfo = {
  description?: string;
  endpoint: string;
  format: string;
  models: string[];
};

export const ChannelTypes: Record<string, string> = {
  openai: "OpenAI",
  azure: "Azure OpenAI",
  claude: "Claude",
  slack: "Slack",
  sparkdesk: "讯飞星火",
  chatglm: "智谱 ChatGLM",
  qwen: "通义千问",
  hunyuan: "腾讯混元",
  zhinao: "360 智脑",
  baichuan: "百川 AI",
  skylark: "火山方舟",
  bing: "New Bing",
  palm: "Google Gemini",
  midjourney: "Midjourney",
  oneapi: "Nio API",
};

export const ChannelInfos: Record<string, ChannelInfo> = {
  openai: {
    endpoint: "https://api.openai.com",
    format: "<api-key>",
    models: [
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-instruct",
      "gpt-3.5-turbo-0613",
      "gpt-3.5-turbo-0301",
      "gpt-3.5-turbo-1106",
      "gpt-3.5-turbo-16k",
      "gpt-3.5-turbo-16k-0613",
      "gpt-3.5-turbo-16k-0301",
      "gpt-4",
      "gpt-4-0314",
      "gpt-4-0613",
      "gpt-4-1106-preview",
      "gpt-4-vision-preview",
      "gpt-4-32k",
      "gpt-4-32k-0314",
      "gpt-4-32k-0613",
      "dalle",
      "dall-e-2",
      "dall-e-3",
    ],
  },
  azure: {
    endpoint: "2023-12-01-preview",
    format: "<api-key>|<api-endpoint>",
    description:
      "> Azure 密钥 API Key 1 和 API Key 2 任填一个即可，密钥格式为 **<api-key>|<api-endpoint>**, api-endpoint 为 Azure 的 **API 端点**。\n" +
      "> 接入点填 **API Version**，如 2023-12-01-preview。\n" +
      "Azure 模型名称忽略点号等问题内部已经进行适配，无需额外任何设置。",
    models: [
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-instruct",
      "gpt-3.5-turbo-0613",
      "gpt-3.5-turbo-0301",
      "gpt-3.5-turbo-1106",
      "gpt-3.5-turbo-16k",
      "gpt-3.5-turbo-16k-0613",
      "gpt-3.5-turbo-16k-0301",
      "gpt-4",
      "gpt-4-0314",
      "gpt-4-0613",
      "gpt-4-1106-preview",
      "gpt-4-vision-preview",
      "gpt-4-32k",
      "gpt-4-32k-0314",
      "gpt-4-32k-0613",
      "dalle",
      "dall-e-2",
      "dall-e-3",
    ],
  },
  claude: {
    endpoint: "https://api.anthropic.com",
    format: "<x-api-key>",
    models: ["claude-instant-1", "claude-2", "claude-2.1"],
  },
  slack: {
    endpoint: "your-channel",
    format: "<bot-id>|<xoxp-token>",
    models: ["claude-slack"],
  },
  sparkdesk: {
    endpoint: "wss://spark-api.xf-yun.com",
    format: "<app-id>|<api-secret>|<api-key>",
    models: ["spark-desk-v1.5", "spark-desk-v2", "spark-desk-v3"],
  },
  chatglm: {
    endpoint: "https://open.bigmodel.cn",
    format: "<api-key>",
    models: [
      "zhipu-chatglm-turbo",
      "zhipu-chatglm-pro",
      "zhipu-chatglm-std",
      "zhipu-chatglm-lite",
    ],
  },
  qwen: {
    endpoint: "https://dashscope.aliyuncs.com",
    format: "<api-key>",
    models: ["qwen-turbo", "qwen-plus", "qwen-turbo-net", "qwen-plus-net"],
  },
  hunyuan: {
    endpoint: "https://hunyuan.cloud.tencent.com",
    format: "<app-id>|<secret-id>|<secret-key>",
    models: ["hunyuan"],
    // endpoint
  },
  zhinao: {
    endpoint: "https://api.360.cn",
    format: "<api-key>",
    models: ["360-gpt-v9"],
  },
  baichuan: {
    endpoint: "https://api.baichuan-ai.com",
    format: "<api-key>",
    models: ["baichuan-53b"],
  },
  skylark: {
    endpoint: "https://maas-api.ml-platform-cn-beijing.volces.com",
    format: "<access-key>|<secret-key>",
    models: [
      "skylark-lite-public",
      "skylark-plus-public",
      "skylark-pro-public",
      "skylark-chat",
    ],
  },
  bing: {
    endpoint: "wss://your.bing.service",
    format: "<secret>",
    models: ["bing-creative", "bing-balanced", "bing-precise"],
    description:
      "> Bing 服务需要自行搭建，详情请参考 [chatnio-bing-service](https://github.com/Deeptrain-Community/chatnio-bing-service) \n > bing2api (如 [bingo](https://github.com/weaigc/bingo)) 可直接使用 OpenAI 格式",
  },
  palm: {
    endpoint: "https://generativelanguage.googleapis.com",
    format: "<api-key>",
    models: ["chat-bison-001", "gemini-pro", "gemini-pro-vision"],
  },
  midjourney: {
    endpoint: "https://your.midjourney.proxy",
    format: "<mj-api-secret>|<white-list>",
    models: ["midjourney", "midjourney-fast", "midjourney-turbo"],
    description:
      "> 请参考 [midjourney-proxy](https://github.com/novicezk/midjourney-proxy) 项目填入参数，可设置白名单 *white-list* 以限制回调 IP \n" +
      "> 密钥举例： password|localhost,127.0.0.1,196.128.0.31\n" +
      "> 注意：**请在系统设置中设置后端的公网 IP / 域名，否则无法接收回调**",
  },
  oneapi: {
    endpoint: "https://openai.justsong.cn/api",
    format: "<api-key>",
    models: [],
  },
};

export const channelModels: string[] = Object.values(ChannelInfos).flatMap(
  (info) => info.models,
);

export const channelGroups: string[] = [
  "anonymous",
  "normal",
  "basic",
  "standard",
  "pro",
];

export function getChannelInfo(type?: string): ChannelInfo {
  if (type && type in ChannelInfos) return ChannelInfos[type];
  return ChannelInfos.openai;
}

export function getChannelType(type?: string): string {
  if (type && type in ChannelTypes) return ChannelTypes[type];
  return ChannelTypes.openai;
}

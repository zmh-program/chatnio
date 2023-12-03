import { ChannelCommonResponse } from "@/admin/api/channel.ts";

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
};

export type ChannelInfo = {
  id: number;
  description?: string;
  endpoint: string;
  format: string;
  models: string[];
};

export const ChannelTypes: Record<string, string> = {
  openai: "OpenAI",
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
  palm: "Google PaLM2",
  midjourney: "Midjourney",
  oneapi: "One API",
};

export const ChannelInfos: Record<string, ChannelInfo> = {
  openai: {
    id: 0,
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
      "dall-e-2",
      "dall-e-3",
    ],
  },
  claude: {
    id: 1,
    endpoint: "https://api.anthropic.com",
    format: "<x-api-key>",
    models: ["claude-instant-1", "claude-2", "claude-2.1"],
  },
  slack: {
    id: 2,
    endpoint: "your-channel",
    format: "<bot-id>|<xoxp-token>",
    models: ["claude-slack"],
  },
  sparkdesk: {
    id: 3,
    endpoint: "wss://spark-api.xf-yun.com",
    format: "<app-id>|<api-secret>|<api-key>",
    models: ["spark-desk-v1.5", "spark-desk-v2", "spark-desk-v3"],
  },
  chatglm: {
    id: 4,
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
    id: 5,
    endpoint: "https://dashscope.aliyuncs.com",
    format: "<api-key>",
    models: ["qwen-turbo", "qwen-plus", "qwen-turbo-net", "qwen-plus-net"],
  },
  hunyuan: {
    id: 6,
    endpoint: "https://hunyuan.cloud.tencent.com",
    format: "<app-id>|<secret-id>|<secret-key>",
    models: ["hunyuan"],
    // endpoint
  },
  zhinao: {
    id: 7,
    endpoint: "https://api.360.cn",
    format: "<api-key>",
    models: ["360-gpt-v9"],
  },
  baichuan: {
    id: 8,
    endpoint: "https://api.baichuan-ai.com",
    format: "<api-key>",
    models: ["baichuan-53b"],
  },
  skylark: {
    id: 9,
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
    id: 10,
    endpoint: "wss://your.bing.service",
    format: "<secret>",
    models: ["bing-creative", "bing-balanced", "bing-precise"],
    description:
      "> Bing 服务需要自行搭建，详情请参考 [chatnio-bing-service](https://github.com/Deeptrain-Community/chatnio-bing-service) （如为 bing2api 可直接使用 OpenAI 格式映射）",
  },
  palm: {
    id: 11,
    endpoint: "https://generativelanguage.googleapis.com",
    format: "<api-key>",
    models: ["chat-bison-001"],
  },
  midjourney: {
    id: 12,
    endpoint: "https://your.midjourney.proxy",
    format: "<mj-api-secret>|<white-list>",
    models: ["midjourney", "midjourney-fast", "midjourney-turbo"],
    description:
      "> 请参考 [midjourney-proxy](https://github.com/novicezk/midjourney-proxy) 项目填入参数，可设置白名单 *white-list* 以限制回调 IP \n" +
      "> 密钥举例： password|localhost,127.0.0.1,196.128.0.31\n" +
      "> 注意：**请在系统设置中设置后端的公网 IP / 域名，否则无法接收回调**",
  },
  oneapi: {
    id: 13,
    endpoint: "https://openai.justsong.cn/api",
    format: "<api-key>",
    models: [],
  },
};

export const ChannelModels: string[] = Object.values(ChannelInfos).flatMap(
  (info) => info.models,
);

export function getChannelInfo(type?: string): ChannelInfo {
  if (type && type in ChannelInfos) return ChannelInfos[type];
  return ChannelInfos.openai;
}

export function getChannelType(type?: string): string {
  if (type && type in ChannelTypes) return ChannelTypes[type];
  return ChannelTypes.openai;
}

export function toastState(
  toast: any,
  t: any,
  state: ChannelCommonResponse,
  toastSuccess?: boolean,
) {
  if (state.status)
    toastSuccess &&
      toast({ title: t("success"), description: t("request-success") });
  else toast({ title: t("error"), description: state.error });
}

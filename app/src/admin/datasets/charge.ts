import {
  ChargeProps,
  ChargeType,
  timesBilling,
  tokenBilling,
} from "@/admin/charge.ts";

export enum Currency {
  CNY = "CNY",
  USD = "USD",
}

export type PricingItem = {
  models: string[];
  input?: number;
  output: number;
  currency?: Currency;
  billing_type?: ChargeType;
};

export type PricingDataset = PricingItem[];

export const pricing: PricingDataset = [
  {
    models: [
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-0301",
      "gpt-3.5-turbo-0613",
      "gpt-3.5-turbo-instruct",
    ],
    input: 0.0015,
    output: 0.002,
  },
  {
    models: ["gpt-3.5-turbo-1106"],
    input: 0.001,
    output: 0.002,
  },
  {
    models: ["gpt-3.5-turbo-0125"],
    input: 0.0005,
    output: 0.0015,
  },
  {
    models: [
      "gpt-3.5-turbo-16k",
      "gpt-3.5-turbo-16k-0301",
      "gpt-3.5-turbo-16k-0613",
    ],
    input: 0.003,
    output: 0.004,
  },
  {
    models: ["gpt-4", "gpt-4-0314", "gpt-4-0613"],
    input: 0.03,
    output: 0.06,
  },
  {
    models: [
      "gpt-4-1106-preview",
      "gpt-4-0125-preview",
      "gpt-4-turbo-preview",
      "gpt-4-1106-vision-preview",
      "gpt-4-vision-preview",
      "gpt-4-turbo",
      "gpt-4-turbo-2024-04-09",
    ],
    input: 0.01,
    output: 0.03,
  },
  {
    models: ["gpt-4o", "gpt-4o-2024-05-13", "chatgpt-4o-latest"],
    input: 0.005,
    output: 0.015,
  },
  {
    models: ["gpt-4o-2024-08-06"],
    input: 0.0025,
    output: 0.01,
  },
  {
    models: ["gpt-4o-mini", "gpt-4o-mini-2024-07-18"],
    input: 0.00015,
    output: 0.0006,
  },

  {
    models: ["gpt-4-32k", "gpt-4-32k-0314", "gpt-4-32k-0613"],
    input: 0.06,
    output: 0.12,
  },
  {
    models: ["dalle", "dall-e-2"], // dall-e-2 512x512 size
    output: 0.018,
    billing_type: timesBilling,
  },
  {
    models: ["dall-e-3"], // dall-e-3 HD 1024x1024 size
    output: 0.08,
    billing_type: timesBilling,
  },
  {
    models: [
      "claude-1",
      "claude-1-100k",
      "claude-1.2",
      "claude-1.3",
      "claude-instant",
      "claude-instant-1.2",
      "claude-slack",
    ],
    input: 0.0008,
    output: 0.0024,
    // input: $0.8/1m tokens, output: $2.4/1m tokens
  },
  {
    models: ["claude-2", "claude-2-100k", "claude-2.1"],
    input: 0.008,
    output: 0.024,
  },
  // claude 3 haiku $0.25/1m tokens input & $1.25/1m tokens output
  {
    models: ["claude-3-haiku-20240307"],
    input: 0.00025,
    output: 0.00125,
  },
  // claude 3 sonnet $3/1m tokens input & $15/1m tokens output
  {
    models: ["claude-3-sonnet-20240229"],
    input: 0.003,
    output: 0.015,
  },
  // claude 3 sonnet $15/1m tokens input & $75/1m tokens output
  {
    models: ["claude-3-opus-20240229"],
    input: 0.015,
    output: 0.075,
  },
  {
    models: ["midjourney"],
    output: 0.1,
    currency: Currency.CNY,
    billing_type: timesBilling,
  },
  {
    models: ["midjourney-fast"],
    output: 0.2,
    currency: Currency.CNY,
    billing_type: timesBilling,
  },
  {
    models: ["midjourney-turbo"],
    output: 0.5,
    currency: Currency.CNY,
    billing_type: timesBilling,
  },
  {
    models: ["spark-desk-lite"], // free
    input: 0.001,
    output: 0.001,
    currency: Currency.CNY,
  },
  {
    models: ["spark-desk-pro", "spark-desk-pro-128k","spark-desk-max"],
    input: 0.03,
    output: 0.03,
    currency: Currency.CNY,
  },
  {
    models: ["spark-desk-max-32k"],
    input: 0.032,
    output: 0.032,
    currency: Currency.CNY,
  },
  {
    models: ["spark-desk-4.0-ultra"],
    input: 0.1,
    output: 0.1,
    currency: Currency.CNY,
  },
  {
    models: ["moonshot-v1-8k"],
    input: 0.012,
    output: 0.012,
    currency: Currency.CNY,
  },
  {
    models: ["moonshot-v1-32k"],
    input: 0.024,
    output: 0.024,
    currency: Currency.CNY,
  },
  {
    models: ["moonshot-v1-128k"],
    input: 0.06,
    output: 0.06,
    currency: Currency.CNY,
  },
  {
    models: ["glm-4", "glm-4v"],
    input: 0.1,
    output: 0.1,
    currency: Currency.CNY,
  },
  {
    models: [
      "zhipu-chatglm-lite",
      "zhipu-chatglm-std",
      "zhipu-chatglm-turbo",
      "glm-3-turbo",
    ],
    input: 0.005,
    output: 0.005,
    currency: Currency.CNY,
  },
  {
    models: ["zhipu-chatglm-pro"],
    input: 0.01,
    output: 0.01,
    currency: Currency.CNY,
  },
  {
    models: ["qwen-plus", "qwen-plus-net"],
    input: 0.02,
    output: 0.02,
    currency: Currency.CNY,
  },
  {
    models: ["qwen-turbo", "qwen-turbo-net"],
    input: 0.008,
    output: 0.008,
    currency: Currency.CNY,
  },
  {
    models: ["chat-bison-001"], // free marked as $0.001
    output: 0.001,
  },
  {
    models: [
      "gemini-pro",
      "gemini-pro-vision",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
    ],
    input: 0.000125,
    output: 0.000375,
  },
  {
    models: ["hunyuan"],
    input: 0.1,
    output: 0.1,
    currency: Currency.CNY,
  },
  {
    models: ["deepseek-chat", "deepseek-coder"],
    input: 0.001,
    output: 0.002,
    currency: Currency.CNY,
  },
  {
    models: ["360-gpt-v9"],
    input: 0.12,
    output: 0.12,
    currency: Currency.CNY,
  },
  {
    models: ["baichuan-53b"],
    input: 0.02,
    output: 0.02,
    currency: Currency.CNY,
  },
  {
    models: ["skylark-lite-public"],
    input: 0.004,
    output: 0.004,
    currency: Currency.CNY,
  },
  {
    models: ["skylark-plus-public"],
    input: 0.008,
    output: 0.008,
    currency: Currency.CNY,
  },
  {
    models: ["skylark-pro-public", "skylark-chat"],
    input: 0.011,
    output: 0.011,
    currency: Currency.CNY,
  },
  {
    models: ["llama2-70b-4096", "mixtral-8x7b-32768", "gemma-7b-it"],
    output: 0.001, // free marked as $0.001
    currency: Currency.USD,
  },
];

const countPricing = (
  _price?: number,
  _currency?: Currency,
  usd?: number,
): number => {
  const price = _price ?? 0;
  const currency = _currency ?? Currency.USD;

  switch (currency) {
    case Currency.CNY:
      return price * 10; // 1 cny = 10 quota
    case Currency.USD:
      return price * 10 * (usd ?? 1);
    default:
      return countPricing(price, Currency.USD, usd);
  }
};

export const getPricing = (currency: number): ChargeProps[] =>
  pricing.map(
    (item, index): ChargeProps => ({
      id: index,
      models: item.models,
      type: item.billing_type ?? tokenBilling,
      anonymous: false,
      input: countPricing(item.input, item.currency, currency),
      output: countPricing(item.output, item.currency, currency),
    }),
  );

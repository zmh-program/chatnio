import { Model, Plans } from "@/api/types.ts";
import {
  getDev,
  getRestApi,
  getTokenField,
  getWebsocketApi,
} from "@/conf/env.ts";
import { syncSiteInfo } from "@/admin/api/info.ts";
import { getOfflineModels, loadPreferenceModels } from "@/utils/storage.ts";
import { setAxiosConfig } from "@/conf/api.ts";

export const version = "3.8.6"; // version of the current build
export const dev: boolean = getDev(); // is in development mode (for debugging, in localhost origin)
export const deploy: boolean = true; // is production environment (for api endpoint)

export let apiEndpoint: string = getRestApi(deploy); // api endpoint for rest api calls
export let websocketEndpoint: string = getWebsocketApi(deploy); // api endpoint for websocket calls
export const tokenField = getTokenField(deploy); // token field name for storing token

export let supportModels: Model[] = loadPreferenceModels(getOfflineModels()); // support models in model market of the current site
export let allModels: string[] = supportModels.map((model) => model.id); // all support model id list of the current site

const GPT4Array = [
  "gpt-4",
  "gpt-4-0314",
  "gpt-4-0613",
  "gpt-4-1106-preview",
  "gpt-4-vision-preview",
  "gpt-4-v",
  "gpt-4-dalle",
  "gpt-4-all",
];
const Claude100kArray = ["claude-1.3", "claude-2", "claude-2.1"];
const MidjourneyArray = ["midjourney-fast"];

export const subscriptionData: Plans = [
  {
    level: 1,
    price: 42,
    items: [
      {
        id: "gpt-4",
        icon: "compass",
        name: "GPT-4",
        value: 150,
        models: GPT4Array,
      },
      {
        id: "midjourney",
        icon: "image-plus",
        name: "Midjourney",
        value: 50,
        models: MidjourneyArray,
      },
      {
        id: "claude-100k",
        icon: "book-text",
        name: "Claude 100k",
        value: 300,
        models: Claude100kArray,
      },
    ],
  },
  {
    level: 2,
    price: 76,
    items: [
      {
        id: "gpt-4",
        icon: "compass",
        name: "GPT-4",
        value: 300,
        models: GPT4Array,
      },
      {
        id: "midjourney",
        icon: "image-plus",
        name: "Midjourney",
        value: 100,
        models: MidjourneyArray,
      },
      {
        id: "claude-100k",
        icon: "book-text",
        name: "Claude 100k",
        value: 600,
        models: Claude100kArray,
      },
    ],
  },
  {
    level: 3,
    price: 148,
    items: [
      {
        id: "gpt-4",
        icon: "compass",
        name: "GPT-4",
        value: 600,
        models: GPT4Array,
      },
      {
        id: "midjourney",
        icon: "image-plus",
        name: "Midjourney",
        value: 200,
        models: MidjourneyArray,
      },
      {
        id: "claude-100k",
        icon: "book-text",
        name: "Claude 100k",
        value: 1200,
        models: Claude100kArray,
      },
    ],
  },
];

setAxiosConfig({
  endpoint: apiEndpoint,
  token: tokenField,
});

syncSiteInfo();

import { Model } from "@/api/types.ts";
import {
  getDev,
  getRestApi,
  getTokenField,
  getWebsocketApi,
} from "@/conf/env.ts";
import { syncSiteInfo } from "@/admin/api/info.ts";
import { getOfflineModels, loadPreferenceModels } from "@/conf/storage.ts";
import { setAxiosConfig } from "@/conf/api.ts";

export const version = "3.9.1"; // version of the current build
export const dev: boolean = getDev(); // is in development mode (for debugging, in localhost origin)
export const deploy: boolean = true; // is production environment (for api endpoint)
export const tokenField = getTokenField(deploy); // token field name for storing token

export let apiEndpoint: string = getRestApi(deploy); // api endpoint for rest api calls
export let websocketEndpoint: string = getWebsocketApi(deploy); // api endpoint for websocket calls

export let supportModels: Model[] = loadPreferenceModels(getOfflineModels()); // support models in model market of the current site
export let allModels: string[] = supportModels.map((model) => model.id); // all support model id list of the current site

setAxiosConfig({
  endpoint: apiEndpoint,
  token: tokenField,
});

syncSiteInfo();

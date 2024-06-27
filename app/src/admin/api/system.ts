import { CommonResponse } from "@/api/common.ts";
import { getErrorMessage } from "@/utils/base.ts";
import axios from "axios";

export type TestWebSearchResponse = CommonResponse & {
  result: string;
};

export type whiteList = {
  enabled: boolean;
  custom: string;
  white_list: string[];
};

export type GeneralState = {
  title: string;
  logo: string;
  backend: string;
  docs: string;
  file: string;
  pwa_manifest: string;
  debug_mode: boolean;
};

export type MailState = {
  host: string;
  protocol: boolean;
  port: number;
  username: string;
  password: string;
  from: string;
  white_list: whiteList;
};

export type SearchState = {
  endpoint: string;
  crop: boolean;
  crop_len: number;
  engines: string[];
  image_proxy: boolean;
  safe_search: number;
};

export type SiteState = {
  close_register: boolean;
  close_relay: boolean;
  relay_plan: boolean;
  quota: number;
  buy_link: string;
  announcement: string;
  contact: string;
  footer: string;
  auth_footer: boolean;
};

export type CommonState = {
  cache: string[];
  expire: number;
  size: number;

  article: string[];
  generation: string[];

  image_store: boolean;
};

export type SystemProps = {
  general: GeneralState;
  site: SiteState;
  mail: MailState;
  search: SearchState;
  common: CommonState;
};

export type SystemResponse = CommonResponse & {
  data?: SystemProps;
};

export async function getConfig(): Promise<SystemResponse> {
  try {
    const response = await axios.get("/admin/config/view");
    const data = response.data as SystemResponse;
    if (data.status && data.data) {
      // init system data pre-format

      data.data.mail.white_list.white_list =
        data.data.mail.white_list.white_list || commonWhiteList;
      data.data.search.engines = data.data.search.engines || [];
      data.data.search.crop_len =
        data.data.search.crop_len && data.data.search.crop_len > 0
          ? data.data.search.crop_len
          : 1000;
    }

    return data;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function setConfig(config: SystemProps): Promise<CommonResponse> {
  try {
    const response = await axios.post(`/admin/config/update`, config);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function updateRootPassword(
  password: string,
): Promise<CommonResponse> {
  try {
    const response = await axios.post(`/admin/user/root`, { password });
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function testWebSearching(
  query: string,
): Promise<TestWebSearchResponse> {
  try {
    const response = await axios.get(
      `/admin/config/test/search?query=${encodeURIComponent(query)}`,
    );
    return response.data as TestWebSearchResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e), result: "" };
  }
}

export const commonWhiteList: string[] = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "hotmail.com",
  "foxmail.com",
  "icloud.com",
  "qq.com",
  "163.com",
  "126.com",
];

export const initialSystemState: SystemProps = {
  general: {
    logo: "",
    title: "",
    backend: "",
    docs: "",
    file: "",
    pwa_manifest: "",
    debug_mode: false,
  },
  site: {
    close_register: false,
    close_relay: false,
    relay_plan: false,
    quota: 0,
    buy_link: "",
    announcement: "",
    contact: "",
    footer: "",
    auth_footer: false,
  },
  mail: {
    protocol: false,
    host: "",
    port: 465,
    username: "",
    password: "",
    from: "",
    white_list: {
      enabled: false,
      custom: "",
      white_list: [],
    },
  },
  search: {
    endpoint: "",
    crop: false,
    crop_len: 1000,
    engines: [],
    image_proxy: false,
    safe_search: 0,
  },
  common: {
    article: [],
    generation: [],
    cache: [],
    expire: 3600,
    size: 1,
    image_store: false,
  },
};

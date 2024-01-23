import { CommonResponse } from "@/admin/utils.ts";
import { getErrorMessage } from "@/utils/base.ts";
import axios from "axios";

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
};

export type MailState = {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  white_list: whiteList;
};

export type SearchState = {
  endpoint: string;
  query: number;
};

export type SiteState = {
  quota: number;
  buy_link: string;
  announcement: string;
};

export type SystemProps = {
  general: GeneralState;
  site: SiteState;
  mail: MailState;
  search: SearchState;
};

export type SystemResponse = CommonResponse & {
  data?: SystemProps;
};

export async function getConfig(): Promise<SystemResponse> {
  try {
    const response = await axios.get("/admin/config/view");
    const data = response.data as SystemResponse;
    if (data.status) {
      data.data &&
        (data.data.mail.white_list.white_list =
          data.data.mail.white_list.white_list || commonWhiteList);
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
  },
  site: {
    quota: 0,
    buy_link: "",
    announcement: "",
  },
  mail: {
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
    endpoint: "https://duckduckgo-api.vercel.app",
    query: 5,
  },
};

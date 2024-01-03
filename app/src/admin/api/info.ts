import axios from "axios";
import { setAppLogo, setAppName } from "@/utils/env.ts";

export type SiteInfo = {
  title: string;
  logo: string;
};

export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const response = await axios.get("/info");
    return response.data as SiteInfo;
  } catch (e) {
    console.warn(e);
    return { title: "", logo: "" };
  }
}

export function syncSiteInfo() {
  getSiteInfo().then((info) => {
    setAppName(info.title);
    setAppLogo(info.logo);
  });
}

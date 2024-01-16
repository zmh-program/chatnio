import axios from "axios";
import {
  setAppLogo,
  setAppName,
  setBlobEndpoint,
  setDocsUrl,
} from "@/conf/env.ts";

export type SiteInfo = {
  title: string;
  logo: string;
  docs: string;
  file: string;
};

export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const response = await axios.get("/info");
    return response.data as SiteInfo;
  } catch (e) {
    console.warn(e);
    return { title: "", logo: "", docs: "", file: "" };
  }
}

export function syncSiteInfo() {
  getSiteInfo().then((info) => {
    setAppName(info.title);
    setAppLogo(info.logo);
    setDocsUrl(info.docs);
    setBlobEndpoint(info.file);
  });
}

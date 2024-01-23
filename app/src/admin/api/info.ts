import axios from "axios";
import {
  setAnnouncement,
  setAppLogo,
  setAppName,
  setBlobEndpoint,
  setBuyLink,
  setDocsUrl,
} from "@/conf/env.ts";

export type SiteInfo = {
  title: string;
  logo: string;
  docs: string;
  file: string;
  announcement: string;
  buy_link: string;
};

export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const response = await axios.get("/info");
    return response.data as SiteInfo;
  } catch (e) {
    console.warn(e);
    return {
      title: "",
      logo: "",
      docs: "",
      file: "",
      announcement: "",
      buy_link: "",
    };
  }
}

export function syncSiteInfo() {
  getSiteInfo().then((info) => {
    setAppName(info.title);
    setAppLogo(info.logo);
    setDocsUrl(info.docs);
    setBlobEndpoint(info.file);
    setAnnouncement(info.announcement);
    setBuyLink(info.buy_link);
  });
}

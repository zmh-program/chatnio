import axios from "axios";
import {
  setAnnouncement,
  setAppLogo,
  setAppName,
  setBlobEndpoint,
  setBuyLink,
  setDocsUrl,
} from "@/conf/env.ts";
import { infoEvent, InfoForm } from "@/events/info.ts";

export type SiteInfo = {
  title: string;
  logo: string;
  docs: string;
  file: string;
  announcement: string;
  buy_link: string;
  mail: boolean;
  contact: string;
  article: string[];
  generation: string[];
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
      contact: "",
      mail: false,
      article: [],
      generation: [],
    };
  }
}

export function syncSiteInfo() {
  setTimeout(async () => {
    const info = await getSiteInfo();

    setAppName(info.title);
    setAppLogo(info.logo);
    setDocsUrl(info.docs);
    setBlobEndpoint(info.file);
    setAnnouncement(info.announcement);
    setBuyLink(info.buy_link);

    infoEvent.emit(info as InfoForm);
  }, 25);
}

import { EventCommitter } from "@/events/struct.ts";

export type InfoForm = {
  mail: boolean;
  contact: string;
  footer: string;
  auth_footer: boolean;
  article: string[];
  generation: string[];
  relay_plan: boolean;
};

export const infoEvent = new EventCommitter<InfoForm>({
  name: "info",
});

import { EventCommitter } from "@/events/struct.ts";

export type InfoForm = {
  mail: boolean;
  contact: string;
  article: string[];
  generation: string[];
};

export const infoEvent = new EventCommitter<InfoForm>({
  name: "info",
});

import { EventCommitter } from "@/events/struct.ts";

export type InfoForm = {
  mail: boolean;
  contact: string;
};

export const infoEvent = new EventCommitter<InfoForm>({
  name: "info",
});

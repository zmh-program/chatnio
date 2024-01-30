import { EventCommitter } from "@/events/struct.ts";

export type InfoForm = {
  mail: boolean;
};

export const infoEvent = new EventCommitter<InfoForm>({
  name: "info",
});

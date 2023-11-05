import { EventCommitter } from "@/events/struct.ts";

export const chatEvent = new EventCommitter<void>({
  name: "chat",
});

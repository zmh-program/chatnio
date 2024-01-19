import { EventCommitter } from "@/events/struct.ts";

export const marketEvent = new EventCommitter<boolean>({
  name: "market",
});

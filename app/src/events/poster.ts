import { EventCommitter } from "@/events/struct.ts";

export const posterEvent = new EventCommitter<string>({
  name: "poster",
});

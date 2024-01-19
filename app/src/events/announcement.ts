import { EventCommitter } from "@/events/struct.ts";

export const announcementEvent = new EventCommitter<string>({
  name: "announcement",
});

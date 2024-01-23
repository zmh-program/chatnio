import { EventCommitter } from "@/events/struct.ts";

export type AnnouncementEvent = {
  message: string;
  firstReceived: boolean;
};

export const announcementEvent = new EventCommitter<AnnouncementEvent>({
  name: "announcement",
});

import { EventCommitter } from "@/events/struct.ts";

export const themeEvent = new EventCommitter<string>({
  name: "theme",
});

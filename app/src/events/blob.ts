import { EventCommitter } from "@/events/struct.ts";

export const blobEvent = new EventCommitter<File | File[]>({
  name: "blob",
});

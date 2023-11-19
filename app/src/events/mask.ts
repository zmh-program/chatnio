import { Mask } from "@/masks/types.ts";
import { EventCommitter } from "@/events/struct.ts";

export const maskEvent = new EventCommitter<Mask>({
  name: "mask",
  destroyedAfterTrigger: true,
});

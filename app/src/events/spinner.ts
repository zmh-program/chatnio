import { EventCommitter } from "@/events/struct.ts";

export type SpinnerEvent = {
  id: number;
  type: boolean;
};

export const openSpinnerType = true;
export const closeSpinnerType = false;

export const spinnerEvent = new EventCommitter<SpinnerEvent>({
  name: "spinner",
});

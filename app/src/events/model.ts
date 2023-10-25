import { EventCommitter } from "./struct.ts";

export const modelEvent = new EventCommitter<string>({
  name: "model",
});

export const toggleEvent = new EventCommitter<number>({
  name: "toggle",
});

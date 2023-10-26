import { EventCommitter } from "./struct.ts";

export const modelEvent = new EventCommitter<string>({
  name: "model",
});

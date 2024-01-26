import { EventCommitter } from "./struct.ts";

export type ConnectionEvent = {
  id: number;
  event: string;
  index?: number;
  message?: string;
};

export const connectionEvent = new EventCommitter<ConnectionEvent>({
  name: "connection",
});

import { EventCommitter } from "./struct.ts";

export type ConnectionEvent = {
  id: number;
  event: string;
};

export const connectionEvent = new EventCommitter<ConnectionEvent>({
  name: "connection",
});

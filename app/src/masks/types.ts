import { Message } from "@/api/types.ts";

export type Mask = {
  avatar: string;
  name: string;
  lang: string;
  builtin: boolean;
  context: Message[];
};

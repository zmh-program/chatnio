import { Message } from "@/conversation/types.ts";

export type Mask = {
  avatar: string;
  name: string;
  lang: string;
  builtin: boolean;
  context: Message[];
};

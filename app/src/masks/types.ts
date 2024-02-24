import { UserRole } from "@/api/types.ts";

export type MaskMessage = {
  role: string;
  content: string;
  id?: number;
};

export type Mask = {
  avatar: string;
  name: string;
  description?: string;
  lang?: string;
  builtin?: boolean;
  context: MaskMessage[];
};

export type CustomMask = Mask & {
  id: number;
};

export const initialCustomMask: CustomMask = {
  id: -1,
  avatar: "1f9d0",
  name: "",
  context: [{ role: UserRole, content: "", id: 0 }],
};

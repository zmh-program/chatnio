import { UserRole } from "@/api/types.tsx";

export type MaskMessage = {
  role: string;
  content: string;
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
  context: [{ role: UserRole, content: "" }],
};

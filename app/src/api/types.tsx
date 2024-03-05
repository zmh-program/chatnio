import { ChargeBaseProps } from "@/admin/charge.ts";
import { useMemo } from "react";
import { BotIcon, ServerIcon, UserIcon } from "lucide-react";

export const UserRole = "user";
export const AssistantRole = "assistant";
export const SystemRole = "system";
export type Role = typeof UserRole | typeof AssistantRole | typeof SystemRole;
export const Roles = [UserRole, AssistantRole, SystemRole];

export const getRoleIcon = (role: string) => {
  return useMemo(() => {
    switch (role) {
      case UserRole:
        return <UserIcon />;
      case AssistantRole:
        return <BotIcon />;
      case SystemRole:
        return <ServerIcon />;
      default:
        return <UserIcon />;
    }
  }, [role]);
};

export type Message = {
  role: string;
  content: string;
  keyword?: string;
  quota?: number;
  end?: boolean;
  plan?: boolean;
};

export type Model = {
  id: string;
  name: string;
  description?: string;
  free: boolean;
  auth: boolean;
  default: boolean;
  high_context: boolean;
  avatar: string;
  tag?: string[];

  price?: ChargeBaseProps;
};

export type Id = number;

export type ConversationInstance = {
  id: number;
  name: string;
  message: Message[];
  model?: string;
  shared?: boolean;
};

export type PlanItem = {
  id: string;
  name: string;
  value: number;
  icon: string;
  models: string[];
};

export type Plan = {
  level: number;
  price: number;
  items: PlanItem[];
};

export type Plans = Plan[];

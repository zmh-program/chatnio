import {
  BookText,
  Compass,
  Image,
  ImagePlus,
  Video,
  AudioLines,
} from "lucide-react";
import React, { useMemo } from "react";
import { subscriptionData } from "@/conf/index.ts";
import { Plan } from "@/api/types.ts";
import Icon from "@/components/utils/Icon.tsx";

export const subscriptionIcons: Record<string, React.ReactElement> = {
  compass: <Compass />,
  image: <Image />,
  imageplus: <ImagePlus />,
  booktext: <BookText />,
  video: <Video />,
  audio: <AudioLines />,
};

export const subscriptionType: Record<number, string> = {
  1: "basic",
  2: "standard",
  3: "pro",
};

type SubscriptionIconProps = {
  type: string;
  className?: string;
};

export function SubscriptionIcon({ type, className }: SubscriptionIconProps) {
  const icon = useMemo(() => {
    return subscriptionIcons[type.toLowerCase()] || subscriptionIcons.compass;
  }, [type]);

  return <Icon icon={icon} className={className} />;
}

export function getPlan(level: number): Plan {
  const raw = subscriptionData.filter((item) => item.level === level);
  return raw.length > 0
    ? raw[0]
    : subscriptionData.length
    ? subscriptionData[0]
    : { level: 0, price: 0, items: [] };
}

export function getPlanModels(level: number): string[] {
  return getPlan(level).items.flatMap((item) => item.models);
}

export function includingModelFromPlan(level: number, model: string): boolean {
  return getPlanModels(level).includes(model);
}

export function getPlanPrice(level: number): number {
  return getPlan(level).price;
}

export function getPlanName(level: number): string {
  return subscriptionType[level] || "none";
}

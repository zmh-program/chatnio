import {
  BookText,
  Compass,
  Image,
  ImagePlus,
  Video,
  AudioLines,
  Container,
  Archive,
  Flame,
} from "lucide-react";
import React, { useMemo } from "react";
import { Plan, Plans } from "@/api/types.tsx";
import Icon from "@/components/utils/Icon.tsx";

export const subscriptionIcons: Record<string, React.ReactElement> = {
  compass: <Compass />,
  image: <Image />,
  imageplus: <ImagePlus />,
  booktext: <BookText />,
  video: <Video />,
  audio: <AudioLines />,
  flame: <Flame />,
  archive: <Archive />,
  container: <Container />,
};

export const subscriptionIconsList: string[] = Object.keys(subscriptionIcons);

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

export function getPlan(data: Plans, level: number): Plan {
  const raw = data.filter((item) => item.level === level);
  return raw.length > 0 ? raw[0] : { level: 0, price: 0, items: [] };
}

export function getPlanModels(data: Plans, level: number): string[] {
  return getPlan(data, level).items.flatMap((item) => item.models);
}

export function includingModelFromPlan(
  data: Plans,
  level: number,
  model: string,
): boolean {
  return getPlanModels(data, level).includes(model);
}

export function getPlanPrice(data: Plans, level: number): number {
  return getPlan(data, level).price;
}

export function getPlanName(level: number): string {
  return subscriptionType[level] || "none";
}

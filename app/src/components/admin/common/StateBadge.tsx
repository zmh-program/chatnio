import { Badge } from "@/components/ui/badge.tsx";
import { useTranslation } from "react-i18next";

export type StateBadgeProps = {
  state: boolean;
};

export default function StateBadge({ state }: StateBadgeProps) {
  const { t } = useTranslation();

  return <Badge variant="outline">{t(`admin.used-${state}`)}</Badge>;
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import ChannelSettings from "@/components/admin/ChannelSettings.tsx";

function Channel() {
  const { t } = useTranslation();

  return (
    <div className={`channel`}>
      <Card className={`admin-card channel-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.channel")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChannelSettings />
        </CardContent>
      </Card>
    </div>
  );
}

export default Channel;

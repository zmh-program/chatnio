import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";

function Subscription() {
  const { t } = useTranslation();
  return (
    <div className={`admin-subscription`}>
      <Card className={`sub-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.subscription")}</CardTitle>
        </CardHeader>
        <CardContent>in development</CardContent>
      </Card>
    </div>
  );
}

export default Subscription;

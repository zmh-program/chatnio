import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import ChargeWidget from "@/components/admin/ChargeWidget.tsx";

function Charge() {
  const { t } = useTranslation();

  return (
    <div className={`charge`}>
      <Card className={`admin-card charge-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.prize")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChargeWidget />
        </CardContent>
      </Card>
    </div>
  );
}

export default Charge;

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import BroadcastTable from "@/components/admin/assemblies/BroadcastTable.tsx";

function Broadcast() {
  const { t } = useTranslation();
  return (
    <div className={`broadcast`}>
      <Card className={`admin-card broadcast-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.broadcast")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BroadcastTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default Broadcast;

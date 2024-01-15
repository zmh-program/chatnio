import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import InvitationTable from "@/components/admin/InvitationTable.tsx";
import UserTable from "@/components/admin/UserTable.tsx";
import { mobile } from "@/utils/device.ts";
import Tips from "@/components/Tips.tsx";
import RedeemTable from "@/components/admin/RedeemTable.tsx";
import { cn } from "@/components/ui/lib/utils.ts";

function Users() {
  const { t } = useTranslation();

  return (
    <div className={cn("user-interface", mobile && "mobile")}>
      <Card className={`admin-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.user")}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
      <Card className={`admin-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle className={`flex items-center`}>
            {t("admin.invitation-manage")}
            <Tips
              content={t("admin.invitation-tips")}
              className={`ml-2 h-6 w-6 translate-y-0.5`}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationTable />
        </CardContent>
      </Card>
      <Card className={`admin-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle className={`flex items-center`}>
            {t("admin.invitation")}
            <Tips
              content={t("admin.redeem-tips")}
              className={`ml-2 h-6 w-6 translate-y-0.5`}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RedeemTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default Users;

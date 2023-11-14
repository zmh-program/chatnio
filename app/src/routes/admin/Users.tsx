import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import InvitationTable from "@/components/admin/InvitationTable.tsx";
import UserTable from "@/components/admin/UserTable.tsx";
import {mobile} from "@/utils/device.ts";

function Users() {
  const { t } = useTranslation();

  return (
    <div className={`user-interface ${mobile ? 'mobile' : ''}`}>
      <Card>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.users")}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.invitation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default Users;

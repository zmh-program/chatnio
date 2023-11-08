import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast.ts";
import { useState } from "react";
import { UserForm, UserResponse } from "@/admin/types.ts";
import { getUserList } from "@/admin/api.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

function UserTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<UserForm>({
    total: 0,
    data: [],
  });
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  async function update() {
    const resp = await getUserList(page, search);
    if (resp.status) setData(resp as UserResponse);
    else
      toast({
        title: t("admin.error"),
        description: resp.message,
      });
  }
  useEffectAsync(update, [page]);

  return (
    <div className={`user-table`}>
      {(data.data && data.data.length > 0) || page > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className={`select-none whitespace-nowrap`}>
                <TableHead>{t("admin.code")}</TableHead>
                <TableHead>{t("admin.quota")}</TableHead>
                <TableHead>{t("admin.type")}</TableHead>
                <TableHead>{t("admin.used")}</TableHead>
                <TableHead>{t("admin.updated-at")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell>{user.code}</TableCell>
                  <TableCell>{user.quota}</TableCell>
                  <TableCell>{user.type}</TableCell>
                  <TableCell>{t(`admin.used-${user.used}`)}</TableCell>
                  <TableCell>{user.updated_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className={`pagination`}>
            <Button
              variant={`default`}
              size={`icon`}
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className={`h-4 w-4`} />
            </Button>
            <Button variant={`ghost`} size={`icon`}>
              {page + 1}
            </Button>
            <Button
              variant={`default`}
              size={`icon`}
              onClick={() => setPage(page + 1)}
              disabled={page + 1 === data.total}
            >
              <ChevronRight className={`h-4 w-4`} />
            </Button>
          </div>
        </>
      ) : (
        <div className={`empty`}>
          <p>{t("admin.empty")}</p>
        </div>
      )}
      <div className={`user-action`}>
        <div className={`grow`} />
        <Button variant={`outline`} size={`icon`} onClick={update}>
          <RotateCw className={`h-4 w-4`} />
        </Button>
      </div>
    </div>
  );
}

export default UserTable;

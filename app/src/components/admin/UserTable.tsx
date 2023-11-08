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
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RotateCw,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";

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
      <div className={`flex flex-row mb-6`}>
        <Input
          className={`search`}
          placeholder={t("admin.search-username")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button size={`icon`} className={`flex-shrink-0 ml-2`} onClick={update}>
          <Search className={`h-4 w-4`} />
        </Button>
      </div>
      {(data.data && data.data.length > 0) || page > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className={`select-none whitespace-nowrap`}>
                <TableHead>ID</TableHead>
                <TableHead>{t("admin.username")}</TableHead>
                <TableHead>{t("admin.quota")}</TableHead>
                <TableHead>{t("admin.used-quota")}</TableHead>
                <TableHead>{t("admin.is-subscribed")}</TableHead>
                <TableHead>{t("admin.total-month")}</TableHead>
                <TableHead>{t("admin.enterprise")}</TableHead>
                <TableHead>{t("admin.is-admin")}</TableHead>
                <TableHead>{t("admin.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.quota}</TableCell>
                  <TableCell>{user.used_quota}</TableCell>
                  <TableCell>{t(user.is_subscribed.toString())}</TableCell>
                  <TableCell>{user.total_month}</TableCell>
                  <TableCell>{t(user.enterprise.toString())}</TableCell>
                  <TableCell>{t(user.is_admin.toString())}</TableCell>
                  <TableCell>
                    <Button variant={`outline`} size={`icon`}>
                      <MoreHorizontal className={`h-4 w-4`} />
                    </Button>
                  </TableCell>
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

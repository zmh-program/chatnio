import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast.ts";
import { useState } from "react";
import { CommonResponse, UserForm, UserResponse } from "@/admin/types.ts";
import {
  getUserList,
  quotaOperation,
  subscriptionOperation,
} from "@/admin/api/chart.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CloudCog,
  Loader2,
  MoreHorizontal,
  RotateCw,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import PopupDialog from "@/components/PopupDialog.tsx";
import { getNumber, parseNumber } from "@/utils/base.ts";

type OperationMenuProps = {
  id: number;
};

function doToast(t: any, toast: any, resp: CommonResponse) {
  if (!resp.status)
    toast({
      title: t("admin.operate-failed"),
      description: t("admin.operate-failed-prompt", { reason: resp.message }),
    });
  else
    toast({
      title: t("admin.operate-success"),
      description: t("admin.operate-success-prompt"),
    });
}

function OperationMenu({ id }: OperationMenuProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [quotaOpen, setQuotaOpen] = useState<boolean>(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState<boolean>(false);

  return (
    <>
      <PopupDialog
        title={t("admin.quota-action")}
        name={t("admin.quota")}
        description={t("admin.quota-action-desc")}
        defaultValue={"0"}
        onValueChange={getNumber}
        open={quotaOpen}
        setOpen={setQuotaOpen}
        onSubmit={async (value) => {
          const quota = parseNumber(value);
          const resp = await quotaOperation(id, quota);
          doToast(t, toast, resp);
          return resp.status;
        }}
      />
      <PopupDialog
        title={t("admin.subscription-action")}
        name={t("admin.month")}
        description={t("admin.subscription-action-desc")}
        defaultValue={"0"}
        onValueChange={getNumber}
        open={subscriptionOpen}
        setOpen={setSubscriptionOpen}
        onSubmit={async (value) => {
          const month = parseNumber(value);
          const resp = await subscriptionOperation(id, month);
          doToast(t, toast, resp);
          return resp.status;
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={`outline`} size={`icon`}>
            <MoreHorizontal className={`h-4 w-4`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setQuotaOpen(true)}>
            <CloudCog className={`h-4 w-4 mr-2`} />
            {t("admin.quota-action")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSubscriptionOpen(true)}>
            <CalendarClock className={`h-4 w-4 mr-2`} />
            {t("admin.subscription-action")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function UserTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<UserForm>({
    total: 0,
    data: [],
  });
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function update() {
    setLoading(true);
    const resp = await getUserList(page, search);
    setLoading(false);
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
                <TableHead>{t("admin.level")}</TableHead>
                <TableHead>{t("admin.total-month")}</TableHead>
                <TableHead>{t("admin.enterprise")}</TableHead>
                <TableHead>{t("admin.is-admin")}</TableHead>
                <TableHead>{t("admin.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data || []).map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className={`whitespace-nowrap`}>
                    {user.username}
                  </TableCell>
                  <TableCell>{user.quota}</TableCell>
                  <TableCell>{user.used_quota}</TableCell>
                  <TableCell>{t(user.is_subscribed.toString())}</TableCell>
                  <TableCell>{user.level}</TableCell>
                  <TableCell>{user.total_month}</TableCell>
                  <TableCell>{t(user.enterprise.toString())}</TableCell>
                  <TableCell>{t(user.is_admin.toString())}</TableCell>
                  <TableCell>
                    <OperationMenu id={user.id} />
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
      ) : loading ? (
        <div className={`flex flex-col mb-4 mt-12 items-center`}>
          <Loader2 className={`w-6 h-6 inline-block animate-spin`} />
        </div>
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

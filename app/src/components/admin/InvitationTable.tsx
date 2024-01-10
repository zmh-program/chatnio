import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { InvitationForm, InvitationResponse } from "@/admin/types.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RotateCw,
} from "lucide-react";
import { useEffectAsync } from "@/utils/hook.ts";
import { generateInvitation, getInvitationList } from "@/admin/api/chart.ts";
import { Input } from "@/components/ui/input.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { saveAsFile } from "@/utils/dom.ts";

function GenerateDialog() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>("");
  const [quota, setQuota] = useState<string>("5");
  const [number, setNumber] = useState<string>("1");
  const [data, setData] = useState<string>("");

  function getNumber(value: string): string {
    return value.replace(/[^\d.]/g, "");
  }

  async function generateCode() {
    const data = await generateInvitation(type, Number(quota), Number(number));
    if (data.status) setData(data.data.join("\n"));
    else
      toast({
        title: t("admin.error"),
        description: data.message,
      });
  }

  function close() {
    setType("");
    setQuota("5");
    setNumber("1");

    setOpen(false);
    setData("");
  }

  function downloadCode() {
    return saveAsFile("invitation.txt", data);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>{t("admin.generate")}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.generate")}</DialogTitle>
            <DialogDescription className={`pt-2`}>
              <div className={`invitation-row`}>
                <p className={`mr-4`}>{t("admin.type")}</p>
                <Input value={type} onChange={(e) => setType(e.target.value)} />
              </div>
              <div className={`invitation-row`}>
                <p className={`mr-4`}>{t("admin.quota")}</p>
                <Input
                  value={quota}
                  onChange={(e) => setQuota(getNumber(e.target.value))}
                />
              </div>
              <div className={`invitation-row`}>
                <p className={`mr-4`}>{t("admin.number")}</p>
                <Input
                  value={number}
                  onChange={(e) => setNumber(getNumber(e.target.value))}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant={`outline`} onClick={() => setOpen(false)}>
              {t("admin.cancel")}
            </Button>
            <Button variant={`default`} loading={true} onClick={generateCode}>
              {t("admin.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={data !== ""}
        onOpenChange={(state: boolean) => {
          if (!state) close();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.generate-result")}</DialogTitle>
            <DialogDescription className={`pt-4`}>
              <Textarea value={data} rows={12} readOnly />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant={`outline`} onClick={close}>
              {t("close")}
            </Button>
            <Button variant={`default`} onClick={downloadCode}>
              <Download className={`h-4 w-4 mr-2`} />
              {t("download")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InvitationTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<InvitationForm>({
    total: 0,
    data: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

  async function update() {
    setLoading(true);
    const resp = await getInvitationList(page);
    setLoading(false);
    if (resp.status) setData(resp as InvitationResponse);
    else
      toast({
        title: t("admin.error"),
        description: resp.message,
      });
  }
  useEffectAsync(update, [page]);

  return (
    <div className={`invitation-table`}>
      {(data.data && data.data.length > 0) || page > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className={`select-none whitespace-nowrap`}>
                <TableHead>{t("admin.invitation-code")}</TableHead>
                <TableHead>{t("admin.quota")}</TableHead>
                <TableHead>{t("admin.type")}</TableHead>
                <TableHead>{t("admin.used")}</TableHead>
                <TableHead>{t("admin.updated-at")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data || []).map((invitation, idx) => (
                <TableRow key={idx} className={`whitespace-nowrap`}>
                  <TableCell>{invitation.code}</TableCell>
                  <TableCell>{invitation.quota}</TableCell>
                  <TableCell>{invitation.type}</TableCell>
                  <TableCell>{t(`admin.used-${invitation.used}`)}</TableCell>
                  <TableCell>{invitation.updated_at}</TableCell>
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
          {loading ? (
            <Loader2 className={`w-6 h-6 inline-block animate-spin`} />
          ) : (
            <p>{t("admin.empty")}</p>
          )}
        </div>
      )}
      <div className={`invitation-action`}>
        <div className={`grow`} />
        <Button variant={`outline`} size={`icon`} onClick={update}>
          <RotateCw className={`h-4 w-4`} />
        </Button>
        <GenerateDialog />
      </div>
    </div>
  );
}

export default InvitationTable;

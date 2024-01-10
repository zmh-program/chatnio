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
import { RedeemResponse } from "@/admin/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Download, Loader2, RotateCw } from "lucide-react";
import { generateRedeem, getRedeemList } from "@/admin/api/chart.ts";
import { Input } from "@/components/ui/input.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { saveAsFile } from "@/utils/dom.ts";
import { useEffectAsync } from "@/utils/hook.ts";

function GenerateDialog() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const [quota, setQuota] = useState<string>("5");
  const [number, setNumber] = useState<string>("1");
  const [data, setData] = useState<string>("");

  function getNumber(value: string): string {
    return value.replace(/[^\d.]/g, "");
  }

  async function generateCode() {
    const data = await generateRedeem(Number(quota), Number(number));
    if (data.status) setData(data.data.join("\n"));
    else
      toast({
        title: t("admin.error"),
        description: data.message,
      });
  }

  function close() {
    setQuota("5");
    setNumber("1");

    setOpen(false);
    setData("");
  }

  function downloadCode() {
    return saveAsFile("code.txt", data);
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

function RedeemTable() {
  const { t } = useTranslation();
  const [data, setData] = useState<RedeemResponse>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sync = async () => {
    setLoading(true);
    const resp = await getRedeemList();
    setLoading(false);
    setData(resp ?? []);
  };

  useEffectAsync(sync, []);

  return (
    <div className={`redeem-table`}>
      {data.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className={`select-none whitespace-nowrap`}>
                <TableHead>{t("admin.redeem.quota")}</TableHead>
                <TableHead>{t("admin.redeem.total")}</TableHead>
                <TableHead>{t("admin.redeem.used")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((redeem, idx) => (
                <TableRow key={idx} className={`whitespace-nowrap`}>
                  <TableCell>{redeem.quota}</TableCell>
                  <TableCell>{redeem.total}</TableCell>
                  <TableCell>{redeem.used}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : loading ? (
        <div className={`flex flex-col my-4 items-center`}>
          <Loader2 className={`w-6 h-6 inline-block animate-spin`} />
        </div>
      ) : (
        <p className={`empty`}>{t("admin.empty")}</p>
      )}
      <div className={`redeem-action`}>
        <div className={`grow`} />
        <Button variant={`outline`} size={`icon`} onClick={sync}>
          <RotateCw className={`h-4 w-4`} />
        </Button>
        <GenerateDialog />
      </div>
    </div>
  );
}

export default RedeemTable;

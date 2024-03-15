import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Activity,
  Check,
  Plus,
  RotateCw,
  Settings2,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import OperationAction from "@/components/OperationAction.tsx";
import { Dispatch, useEffect, useMemo, useState } from "react";
import { Channel, getShortChannelType } from "@/admin/channel.ts";
import { toastState } from "@/api/common.ts";
import { useTranslation } from "react-i18next";
import { useEffectAsync } from "@/utils/hook.ts";
import {
  activateChannel,
  deactivateChannel,
  deleteChannel,
  listChannel,
} from "@/admin/api/channel.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { cn } from "@/components/ui/lib/utils.ts";
import { getApiModels } from "@/api/v1.ts";
import { getHostName } from "@/utils/base.ts";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { DialogClose } from "@radix-ui/react-dialog";

type ChannelTableProps = {
  display: boolean;
  dispatch: Dispatch<any>;
  setId: (id: number) => void;
  setEnabled: (enabled: boolean) => void;
};

type TypeBadgeProps = {
  type: string;
};

function TypeBadge({ type }: TypeBadgeProps) {
  const content = useMemo(() => getShortChannelType(type), [type]);

  return (
    <Badge className={`select-none w-max cursor-pointer`}>
      {content || type}
    </Badge>
  );
}

type SyncDialogProps = {
  dispatch: Dispatch<any>;
  open: boolean;
  setOpen: (open: boolean) => void;
};

function SyncDialog({ dispatch, open, setOpen }: SyncDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [endpoint, setEndpoint] = useState<string>("https://api.openai.com");
  const [secret, setSecret] = useState<string>("");

  const submit = async (endpoint: string): Promise<boolean> => {
    endpoint = endpoint.trim();
    endpoint.endsWith("/") && (endpoint = endpoint.slice(0, -1));

    const resp = await getApiModels(secret, { endpoint });
    toastState(toast, t, resp, true);

    if (!resp.status) return false;

    const name = getHostName(endpoint).replace(/\./g, "-");
    const data: Channel = {
      id: -1,
      name,
      type: "openai",
      models: resp.data,
      priority: 0,
      weight: 1,
      retry: 1,
      secret,
      endpoint,
      mapper: "",
      state: true,
      group: [],
      proxy: { proxy: "", proxy_type: 0, username: "", password: "" },
    };

    dispatch({ type: "set", value: data });
    return true;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.channels.joint")}</DialogTitle>
          </DialogHeader>
          <div className={`pt-2 flex flex-col`}>
            <div className={`flex flex-row items-center mb-4`}>
              <Label className={`mr-2 whitespace-nowrap`}>
                {t("admin.channels.joint-endpoint")}
              </Label>
              <Input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder={t("admin.channels.upstream-endpoint-placeholder")}
              />
            </div>
            <div className={`flex flex-row items-center`}>
              <Label className={`mr-2 whitespace-nowrap`}>
                {t("admin.channels.secret")}
              </Label>
              <Input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={t("admin.channels.sync-secret-placeholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={`outline`}>{t("cancel")}</Button>
            </DialogClose>
            <Button
              className={`mb-1`}
              onClick={async () => {
                const status = await submit(endpoint);
                status && setOpen(false);
              }}
            >
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChannelTable({
  display,
  dispatch,
  setId,
  setEnabled,
}: ChannelTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    const resp = await listChannel();
    setLoading(false);
    if (!resp.status) toastState(toast, t, resp);
    else setData(resp.data);
  };
  useEffectAsync(refresh, []);
  useEffectAsync(refresh, [display]);

  useEffect(() => {
    if (display) setId(-1);
  }, [display]);

  return (
    display && (
      <div>
        <SyncDialog
          open={open}
          setOpen={setOpen}
          dispatch={(action) => {
            dispatch(action);
            setEnabled(true);
            setId(-1);
          }}
        />
        <div className={`flex flex-row w-full h-max`}>
          <Button
            className={`mr-2`}
            onClick={() => {
              setEnabled(true);
              setId(-1);
            }}
          >
            <Plus className={`h-4 w-4 mr-1`} />
            {t("admin.channels.create")}
          </Button>
          <Button
            className={`mr-2`}
            variant={`outline`}
            onClick={() => setOpen(true)}
          >
            <Activity className={`h-4 w-4 mr-1`} />
            {t("admin.channels.joint")}
          </Button>
          <div className={`grow`} />
          <Button
            variant={`outline`}
            size={`icon`}
            className={`mr-2`}
            onClick={refresh}
          >
            <RotateCw className={cn(`h-4 w-4`, loading && `animate-spin`)} />
          </Button>
        </div>
        <Table className={`channel-table mt-4`}>
          <TableHeader>
            <TableRow className={`select-none whitespace-nowrap`}>
              <TableCell>{t("admin.channels.id")}</TableCell>
              <TableCell>{t("admin.channels.name")}</TableCell>
              <TableCell>{t("admin.channels.type")}</TableCell>
              <TableCell>{t("admin.channels.priority")}</TableCell>
              <TableCell>{t("admin.channels.weight")}</TableCell>
              <TableCell>{t("admin.channels.state")}</TableCell>
              <TableCell>{t("admin.channels.action")}</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).map((chan, idx) => (
              <TableRow key={idx}>
                <TableCell className={`channel-id select-none`}>
                  #{chan.id}
                </TableCell>
                <TableCell>{chan.name}</TableCell>
                <TableCell>
                  <TypeBadge type={chan.type} />
                </TableCell>
                <TableCell>{chan.priority}</TableCell>
                <TableCell>{chan.weight}</TableCell>
                <TableCell>
                  {chan.state ? (
                    <Check className={`h-4 w-4 text-green-500`} />
                  ) : (
                    <X className={`h-4 w-4 text-destructive`} />
                  )}
                </TableCell>
                <TableCell className={`flex flex-row flex-wrap gap-2`}>
                  <OperationAction
                    tooltip={t("admin.channels.edit")}
                    onClick={() => {
                      setEnabled(true);
                      setId(chan.id);
                    }}
                  >
                    <Settings2 className={`h-4 w-4`} />
                  </OperationAction>
                  {chan.state ? (
                    <OperationAction
                      tooltip={t("admin.channels.disable")}
                      variant={`destructive`}
                      onClick={async () => {
                        const resp = await deactivateChannel(chan.id);
                        toastState(toast, t, resp, true);
                        await refresh();
                      }}
                    >
                      <X className={`h-4 w-4`} />
                    </OperationAction>
                  ) : (
                    <OperationAction
                      tooltip={t("admin.channels.enable")}
                      onClick={async () => {
                        const resp = await activateChannel(chan.id);
                        toastState(toast, t, resp, true);
                        await refresh();
                      }}
                    >
                      <Check className={`h-4 w-4`} />
                    </OperationAction>
                  )}
                  <OperationAction
                    tooltip={t("admin.channels.delete")}
                    variant={`destructive`}
                    onClick={async () => {
                      const resp = await deleteChannel(chan.id);
                      toastState(toast, t, resp, true);
                      await refresh();
                    }}
                  >
                    <Trash className={`h-4 w-4`} />
                  </OperationAction>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  );
}

export default ChannelTable;

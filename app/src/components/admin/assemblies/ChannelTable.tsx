import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Check, Plus, RotateCw, Settings2, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import OperationAction from "@/components/OperationAction.tsx";
import { useEffect, useMemo, useState } from "react";
import { Channel, getChannelType } from "@/admin/channel.ts";
import { toastState } from "@/admin/utils.ts";
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

type ChannelTableProps = {
  display: boolean;
  setId: (id: number) => void;
  setEnabled: (enabled: boolean) => void;
};

type TypeBadgeProps = {
  type: string;
};

function TypeBadge({ type }: TypeBadgeProps) {
  const content = useMemo(() => getChannelType(type), [type]);

  return (
    <Badge className={`select-none w-max cursor-pointer`}>
      {content || type}
    </Badge>
  );
}

function ChannelTable({ display, setId, setEnabled }: ChannelTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      <div className={`channel-table`}>
        <Table>
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
                <TableCell>{chan.id}</TableCell>
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
        <div className={`mt-6 pr-2 flex flex-row w-full h-max`}>
          <div className={`grow`} />
          <Button
            variant={`outline`}
            size={`icon`}
            className={`mr-2`}
            onClick={refresh}
          >
            <RotateCw className={cn(`h-4 w-4`, loading && `animate-spin`)} />
          </Button>
          <Button
            onClick={() => {
              setEnabled(true);
              setId(-1);
            }}
          >
            <Plus className={`h-4 w-4 mr-1`} />
            {t("admin.channels.create")}
          </Button>
        </div>
      </div>
    )
  );
}

export default ChannelTable;

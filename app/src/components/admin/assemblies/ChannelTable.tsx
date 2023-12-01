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
import { useState } from "react";
import { Channel } from "@/admin/channel.ts";
import { useTranslation } from "react-i18next";

type ChannelTableProps = {
  setEnabled: (enabled: boolean) => void;
};

function ChannelTable({ setEnabled }: ChannelTableProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<Channel[]>([]);

  return (
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
                <Badge className={`select-none w-max`}>{chan.type}</Badge>
              </TableCell>
              <TableCell>{chan.priority}</TableCell>
              <TableCell>{chan.weight}</TableCell>
              <TableCell>
                {chan.state ? (
                  <Check className={`h-4 w-4 text-green-500`} />
                ) : (
                  <X className={`h-4 w-4 text-red-500`} />
                )}
              </TableCell>
              <TableCell>
                <OperationAction tooltip={t("admin.channels.edit")}>
                  <Settings2 className={`h-4 w-4`} />
                </OperationAction>
                {chan.state ? (
                  <OperationAction
                    tooltip={t("admin.channels.disable")}
                    variant={`destructive`}
                  >
                    <X className={`h-4 w-4`} />
                  </OperationAction>
                ) : (
                  <OperationAction tooltip={t("admin.channels.enable")}>
                    <Check className={`h-4 w-4`} />
                  </OperationAction>
                )}
                <OperationAction
                  tooltip={t("admin.channels.delete")}
                  variant={`destructive`}
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
        <Button variant={`outline`} size={`icon`} className={`mr-2`}>
          <RotateCw className={`h-4 w-4`} />
        </Button>
        <Button onClick={() => setEnabled(true)}>
          <Plus className={`h-4 w-4 mr-1`} />
          {t("admin.channels.create")}
        </Button>
      </div>
    </div>
  );
}

export default ChannelTable;

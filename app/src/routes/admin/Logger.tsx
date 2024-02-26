import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useEffectAsync } from "@/utils/hook.ts";
import {
  Logger,
  listLoggers,
  downloadLogger,
  deleteLogger,
  getLoggerConsole,
} from "@/admin/api/logger.ts";
import { getSizeUnit } from "@/utils/base.ts";
import { Download, RotateCcw, Terminal, Trash } from "lucide-react";
import { toastState } from "@/api/common.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import Paragraph from "@/components/Paragraph.tsx";
import { Label } from "@/components/ui/label.tsx";
import { NumberInput } from "@/components/ui/number-input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/components/ui/lib/utils.ts";

type LoggerItemProps = Logger & {
  onUpdate: () => void;
};
function LoggerItem({ path, size, onUpdate }: LoggerItemProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const loggerSize = useMemo(() => getSizeUnit(size), [size]);

  return (
    <div className={`logger-item`}>
      <div className={`logger-item-title`}>{path}</div>
      <div className={`grow`} />
      <div className={`logger-item-size`}>{loggerSize}</div>
      <div
        className={`logger-item-action`}
        onClick={async () => downloadLogger(path)}
      >
        <Download className={`w-3 h-3`} />
      </div>
      <div className={`logger-item-action`}>
        <Trash
          className={`w-3 h-3 text-red-600`}
          onClick={async () => {
            const resp = await deleteLogger(path);
            if (resp) onUpdate();
            toastState(toast, t, resp, true);
          }}
        />
      </div>
    </div>
  );
}

function LoggerList() {
  const [data, setData] = useState<Logger[]>([]);

  const sync = async () => setData(await listLoggers());

  useEffectAsync(async () => {
    await sync();
  }, []);

  return (
    <div className={`logger-list`}>
      {data.map((logger, i) => (
        <LoggerItem {...logger} key={i} onUpdate={sync} />
      ))}
    </div>
  );
}

function LoggerConsole() {
  const { t } = useTranslation();
  const [data, setData] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [length, setLength] = useState<number>(100);

  const sync = async () => {
    if (loading) return;
    setLoading(true);
    setData(await getLoggerConsole(length));
    setLoading(false);
  };
  useEffectAsync(sync, []);

  return (
    <Paragraph
      title={t("admin.logger.console")}
      className={`logger-container mb-2`}
      isCollapsed={true}
    >
      <div className={`logger-toolbar`}>
        <Label>{t("admin.logger.consoleLength")}</Label>
        <NumberInput
          value={length}
          onValueChange={setLength}
          min={1}
          max={1000}
        />
        <div className={`grow`} />
        <Button onClick={sync} variant={`outline`} size={`icon`}>
          <RotateCcw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>
      <div className={`logger-console`}>
        <Terminal className={`w-4 h-4 console-icon`} />
        <pre className={`thin-scrollbar`}>{data}</pre>
      </div>
    </Paragraph>
  );
}

function Logger() {
  const { t } = useTranslation();
  return (
    <div className={`logger`}>
      <Card className={`admin-card logger-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.logger.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoggerConsole />
          <LoggerList />
        </CardContent>
      </Card>
    </div>
  );
}

export default Logger;

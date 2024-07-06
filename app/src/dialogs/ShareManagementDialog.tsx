import "@/assets/pages/share-manager.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  dialogSelector,
  dataSelector,
  syncData,
  deleteData,
} from "@/store/sharing.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { selectAuthenticated, selectInit } from "@/store/auth.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { setDialog } from "@/store/sharing.ts";
import { Button } from "@/components/ui/button.tsx";
import { useMemo } from "react";
import {
  Clock,
  ExternalLink,
  Eye,
  HelpCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { getSharedLink, SharingPreviewForm } from "@/api/sharing.ts";
import { openWindow } from "@/utils/device.ts";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

type ShareTableProps = {
  data: SharingPreviewForm[];
};

function ShareContent({ data }: ShareTableProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const time = useMemo(() => {
    return data.map((row) => {
      const date = new Date(row.time);
      return `${
        date.getMonth() + 1
      }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    });
  }, [data]);

  return (
    <div className={`w-full h-max pt-2 pb-6`}>
      {data.map((row, idx) => (
        <div
          key={idx}
          className={`flex flex-row w-full h-max border boder-input p-4 rounded-md mb-2 last:mb-0`}
        >
          <div className={`flex flex-col flex-grow mr-1`}>
            <div className={`flex flex-row text-md items-start mb-1`}>
              <span
                className={`text-secondary mr-2 select-none text-xs border rounded-md py-1 px-2`}
              >
                #{row.conversation_id}
              </span>
              <span className={`text-common py-0.5 text-ellipsis`}>
                {row.name}
              </span>
            </div>
            <div
              className={`flex flex-row items-center text-xs text-gray-500 select-none`}
            >
              <Clock className={`h-3.5 w-3.5 mr-1`} />
              {time[idx]}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={`outline`} size={`icon`} className={`shrink-0`}>
                <MoreHorizontal className={`h-4 w-4`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`min-w-[5rem]`} align={`end`}>
              <DropdownMenuItem
                onClick={() => {
                  openWindow(getSharedLink(row.hash), "_blank");
                }}
              >
                <Eye className={`h-4 w-4 mr-1.5`} />
                {t("share.view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await deleteData(dispatch, row.hash);
                }}
              >
                <Trash2 className={`h-4 w-4 mr-1.5`} />
                {t("conversation.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}

function ShareManagementDialog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);
  const data = useSelector(dataSelector);
  const { toast } = useToast();
  const init = useSelector(selectInit);
  const auth = useSelector(selectAuthenticated);

  useEffectAsync(async () => {
    if (init && auth) {
      if (data.length > 0) return;
      const resp = await syncData(dispatch);
      if (resp) {
        toast({
          title: t("share.sync-error"),
          description: resp,
        });
      }
    }
  }, [init, auth]);

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent className={`flex-dialog share-dialog`}>
        <DialogHeader>
          <DialogTitle className={`mb-4`} asChild>
            <div
              className={`flex flex-row items-center justify-center md:justify-normal select-none`}
            >
              <ExternalLink className={`h-4 w-4 mr-1.5`} />
              {t("share.manage")}
            </div>
          </DialogTitle>
          {data.length > 0 ? (
            <ScrollArea className={`max-h-[60vh] pr-4`}>
              <DialogDescription asChild>
                <div className={`w-full`}>
                  <ShareContent data={data} />
                </div>
              </DialogDescription>
            </ScrollArea>
          ) : (
            <div
              className={`text-center text-sm text-secondary select-none py-8`}
            >
              <p>{t("share.empty")}</p>
              <p
                className={`mt-4 flex flex-row items-center justify-center text-common`}
              >
                <HelpCircle className={`h-4 w-4 mr-1.5`} />
                {t("share.share-tip")}
              </p>
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ShareManagementDialog;

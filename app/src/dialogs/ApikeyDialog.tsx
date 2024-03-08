import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import "@/assets/pages/api.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  dialogSelector,
  setDialog,
  keySelector,
  getApiKey,
  regenerateApiKey,
} from "@/store/api.ts";
import { Input } from "@/components/ui/input.tsx";
import { Copy, ExternalLink, Power, RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";
import { copyClipboard } from "@/utils/dom.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { selectInit } from "@/store/auth.ts";
import { docsEndpoint } from "@/conf/env.ts";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { useState } from "react";
import { CommonResponse, toastState } from "@/api/common.ts";
import { cn } from "@/components/ui/lib/utils.ts";

function ApikeyDialog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);
  const key = useSelector(keySelector);
  const { toast } = useToast();
  const init = useSelector(selectInit);

  const [loading, setLoading] = useState(false);
  const [openReset, setOpenReset] = useState(false);

  const getKey = async () => {
    if (!init) return;

    setLoading(true);
    await getApiKey(dispatch);
    setLoading(false);
  };

  useEffectAsync(getKey, [init]);

  async function copyKey() {
    await copyClipboard(key);
    toast({
      title: t("api.copied"),
      description: t("api.copied-description"),
    });
  }

  async function resetKey() {
    const resp = await regenerateApiKey(dispatch);
    toastState(toast, t, resp as CommonResponse, true);

    if (resp.status) {
      setOpenReset(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("api.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`api-dialog`}>
              <div className={`api-wrapper`}>
                <Button variant={`outline`} size={`icon`} onClick={getKey}>
                  <RotateCw
                    className={cn("h-4 w-4", loading && "animate-spin")}
                  />
                </Button>
                <Input value={key} readOnly={true} />
                <Button variant={`default`} size={`icon`} onClick={copyKey}>
                  <Copy className={`h-4 w-4`} />
                </Button>
              </div>
              <div className={`flex flex-row`}>
                <AlertDialog open={openReset} onOpenChange={setOpenReset}>
                  <AlertDialogTrigger asChild>
                    <Button variant={`destructive`} className={`mr-2`}>
                      <Power className={`h-4 w-4 mr-2`} />
                      {t("api.reset")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("api.reset")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("api.reset-description")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <Button
                        variant={`destructive`}
                        loading={true}
                        onClick={resetKey}
                      >
                        {t("confirm")}
                      </Button>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button variant={`outline`} asChild>
                  <a href={docsEndpoint} target={`_blank`}>
                    <ExternalLink className={`h-4 w-4 mr-2`} />
                    {t("api.learn-more")}
                  </a>
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ApikeyDialog;

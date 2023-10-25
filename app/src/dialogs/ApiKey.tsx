import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.tsx";
import { Button } from "../components/ui/button.tsx";
import "../assets/api.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  closeDialog,
  dialogSelector,
  setDialog,
  keySelector,
  getApiKey,
} from "../store/api.ts";
import { Input } from "../components/ui/input.tsx";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "../components/ui/use-toast.ts";
import { copyClipboard, useEffectAsync } from "../utils.ts";
import { selectInit } from "../store/auth.ts";

function ApiKey() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);
  const key = useSelector(keySelector);
  const { toast } = useToast();
  const init = useSelector(selectInit);

  useEffectAsync(async () => {
    if (init) await getApiKey(dispatch);
  }, [init]);

  async function copyKey() {
    await copyClipboard(key);
    toast({
      title: t("api.copied"),
      description: t("api.copied-description"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("api.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`api-dialog`}>
              <div className={`api-wrapper`}>
                <Input value={key} />
                <Button variant={`default`} size={`icon`} onClick={copyKey}>
                  <Copy className={`h-4 w-4`} />
                </Button>
              </div>
              <Button variant={`outline`} asChild>
                <a href={`https://docs.chatnio.net`} target={`_blank`}>
                  <ExternalLink className={`h-4 w-4 mr-2`} />
                  {t("buy.learn-more")}
                </a>
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={`outline`} onClick={() => dispatch(closeDialog())}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApiKey;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.tsx";
import { Button } from "../components/ui/button.tsx";
import "../assets/package.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  certSelector,
  closeDialog,
  dialogSelector,
  refreshPackageTask,
  setDialog,
  teenagerSelector,
} from "../store/package.ts";
import { useEffect } from "react";
import { Gift } from "lucide-react";
import { Separator } from "../components/ui/separator.tsx";
import { Badge } from "../components/ui/badge.tsx";

function Package() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);
  const cert = useSelector(certSelector);
  const teenager = useSelector(teenagerSelector);

  useEffect(() => {
    refreshPackageTask(dispatch);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pkg.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`package-wrapper`}>
              <div className={`package`}>
                <div className={`package-title`}>
                  <Gift className={`h-4 w-4`} />
                  {t("pkg.cert")}
                  <Badge variant={cert ? "default" : "outline"}>
                    {t(`pkg.state.${Boolean(cert)}`)}
                  </Badge>
                </div>
                <div className={`package-content`}>{t("pkg.cert-desc")}</div>
              </div>
              <Separator orientation={`horizontal`} />
              <div className={`package`}>
                <div className={`package-title`}>
                  <Gift className={`h-4 w-4`} />
                  {t("pkg.teen")}
                  <Badge variant={teenager ? "default" : "outline"}>
                    {t(`pkg.state.${Boolean(teenager)}`)}
                  </Badge>
                </div>
                <div className={`package-content`}>{t("pkg.teen-desc")}</div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={`outline`} onClick={() => dispatch(closeDialog())}>
            {t("pkg.close")}
          </Button>
          <Button
            variant={`default`}
            onClick={() =>
              window.open("https://deeptrain.lightxi.com/home/package")
            }
          >
            {t("pkg.go")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Package;

import "@/assets/pages/settings.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  alignSelector,
  contextSelector,
  dialogSelector,
  setAlign,
  setContext,
  setDialog,
} from "@/store/settings.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {useEffect, useState} from "react";
import {getMemoryPerformance} from "@/utils/app.ts";
import {version} from "@/conf.ts";

function Settings() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);

  const align = useSelector(alignSelector);
  const context = useSelector(contextSelector);
  const [memorySize, setMemorySize] = useState(getMemoryPerformance());

  useEffect(() => {
    const interval = setInterval(() => {
      setMemorySize(getMemoryPerformance());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`settings-container`}>
              <div className={`settings-wrapper`}>
                <div className={`item`}>
                  <div className={`name`}>{t("settings.align")}</div>
                  <div className={`grow`} />
                  <Checkbox
                    className={`value`}
                    checked={align}
                    onCheckedChange={(state: boolean) => {
                      dispatch(setAlign(state));
                    }}
                  />
                </div>
                <div className={`item`}>
                  <div className={`name`}>{t("settings.context")}</div>
                  <div className={`grow`} />
                  <Checkbox
                    className={`value`}
                    checked={context}
                    onCheckedChange={(state: boolean) => {
                      dispatch(setContext(state));
                    }}
                  />
                </div>
                <div className={`info-box`}>
                  <p>
                    {t('settings.memory')}
                    &nbsp;
                    {
                      !isNaN(memorySize) ?
                        memorySize.toFixed(2) + ' MB'
                        : t('unknown')
                    }
                  </p>
                  <p>
                    chatnio v{version}
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default Settings;

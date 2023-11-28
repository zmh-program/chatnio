import "@/assets/pages/settings.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  alignSelector,
  contextSelector,
  dialogSelector,
  historySelector,
  setAlign,
  setContext,
  setDialog, setHistory,
} from "@/store/settings.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import React, { useEffect, useState } from "react";
import { getMemoryPerformance } from "@/utils/app.ts";
import { version } from "@/conf.ts";
import {NumberInput} from "@/components/ui/number-input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {SelectItemProps} from "@/components/SelectGroup.tsx";
import {langs, setLanguage} from "@/i18n.ts";

function SettingsDialog() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);

  const align = useSelector(alignSelector);
  const context = useSelector(contextSelector);
  const history = useSelector(historySelector);
  const [memorySize, setMemorySize] = useState(getMemoryPerformance());

  useEffect(() => {
    const interval = setInterval(() => {
      setMemorySize(getMemoryPerformance());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent className={`fixed-dialog settings-dialog`}>
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`settings-container`}>
              <div className={`settings-wrapper`}>
                <div className={`settings-segment`}>
                  <div className={`item`}>
                    <div className={`name`}>{t("settings.version")}</div>
                    <div className={`grow`} />
                    <div className={`value`}>
                      v{version}
                    </div>
                  </div>
                  <div className={`item`}>
                    <div className={`name`}>{t("settings.language")}</div>
                    <div className={`grow`} />
                    <div className={`value`}>
                      <Select
                        value={i18n.language}
                        onValueChange={(value: string) => setLanguage(i18n, value)}
                      >
                        <SelectTrigger className={`select`}>
                          <SelectValue placeholder={langs[i18n.language]} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(langs).map(([key, value], idx) => (
                            <SelectItem key={idx} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className={`settings-segment`}>
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
                  {
                    context && (
                      <div className={`item`}>
                        <div className={`name`}>{t("settings.history")}</div>
                        <div className={`grow`} />
                        <NumberInput
                          className={`value`}
                          value={history}
                          acceptNaN={false}
                          min={0}
                          max={100}
                          onValueChange={(value: number) => {
                            dispatch(setHistory(value));
                          }}
                        />
                      </div>
                    )
                  }
                </div>
              </div>
              <div className={`grow`} />
              <div className={`info-box`}>
                <p>
                  {t("settings.memory")}
                  &nbsp;
                  {!isNaN(memorySize)
                    ? memorySize.toFixed(2) + " MB"
                    : t("unknown")}
                </p>
                <p>chatnio v{version}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;

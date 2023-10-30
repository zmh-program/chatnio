import "@/assets/settings.less";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {alignSelector, contextSelector, dialogSelector, setAlign, setContext, setDialog} from "@/store/settings.ts";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

function Settings() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);

  const align = useSelector(alignSelector);
  const context = useSelector(contextSelector);

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription>
            <div className={`settings-container`}>
              <div className={`settings-wrapper`}>
                <div className={`item`}>
                  <div className={`name`}>
                    {t('settings.align')}
                  </div>
                  <div className={`grow`} />
                  <Checkbox className={`value`} checked={align} onCheckedChange={(state: boolean) => {
                    dispatch(setAlign(state));
                  }} />
                </div>
                <div className={`item`}>
                  <div className={`name`}>
                    {t('settings.context')}
                  </div>
                  <div className={`grow`} />
                  <Checkbox className={`value`} checked={context} onCheckedChange={(state: boolean) => {
                    dispatch(setContext(state));
                  }} />
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default Settings;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectMask, setMask } from "@/store/chat.ts";

function MaskDialog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(selectMask);

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setMask(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("mask.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`mask-dialog`}>
              <div className={`mask-wrapper`}></div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default MaskDialog;

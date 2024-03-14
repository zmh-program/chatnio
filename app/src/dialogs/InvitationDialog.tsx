import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, dialogSelector, setDialog } from "@/store/invitation.ts";
import { Input } from "@/components/ui/input.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { useState } from "react";
import { getInvitation } from "@/api/invitation.ts";

function InvitationDialog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);
  const { toast } = useToast();
  const [code, setCode] = useState("");

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setDialog(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("invitation.invitation")}</DialogTitle>
          <DialogDescription>
            <Input
              value={code}
              placeholder={t("invitation.input-placeholder")}
              className={`w-full mt-6 text-center`}
              onChange={(e) => setCode(e.target.value)}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className={`mt-2 sm:mt-0`}
            variant={`outline`}
            onClick={() => dispatch(closeDialog())}
          >
            {t("invitation.cancel")}
          </Button>
          <Button
            onClick={async () => {
              const resp = await getInvitation(code.trim());
              if (resp.status) {
                toast({
                  title: t("invitation.check-success"),
                  description: t("invitation.check-success-description", {
                    amount: resp.quota,
                  }),
                });
                dispatch(closeDialog());
              } else
                toast({
                  title: t("invitation.check-failed"),
                  description: resp.error,
                });
            }}
          >
            {t("invitation.check")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InvitationDialog;

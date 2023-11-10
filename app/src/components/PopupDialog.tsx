import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useState } from "react";

export type PopupDialogProps = {
  title: string;
  description?: string;
  name: string;
  defaultValue?: string;
  onValueChange?: (value: string) => string;
  onSubmit?: (value: string) => Promise<boolean>;

  open: boolean;
  setOpen: (open: boolean) => void;
};

function PopupDialog({
  title,
  description,
  name,
  defaultValue,
  onValueChange,
  onSubmit,
  open,
  setOpen,
}: PopupDialogProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(defaultValue || "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className={`pt-1.5`}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className={`pt-1 flex flex-row items-center justify-center`}>
          <span className={`mr-4 whitespace-nowrap`}>{name}</span>
          <Input
            onChange={(e) => {
              setValue(
                onValueChange ? onValueChange(e.target.value) : e.target.value,
              );
            }}
            value={value}
          />
        </div>
        <DialogFooter>
          <Button variant={`outline`} onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => {
              onSubmit &&
                onSubmit(value).then((success) => {
                  if (success) {
                    setOpen(false);
                    setValue(defaultValue || "");
                  }
                });
            }}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PopupDialog;

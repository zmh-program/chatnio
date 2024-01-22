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
  placeholder?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => string;
  onSubmit?: (value: string) => Promise<boolean>;

  open: boolean;
  setOpen: (open: boolean) => void;

  cancelLabel?: string;
  confirmLabel?: string;
};

export type PopupFieldProps<T> = {
  name: string;
  type: string;
  value: T;
  onChange: (value: T) => void;
  defaultValue?: T;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  classNameInput?: string;
  classNameLabel?: string;
};

export type PopupFieldTextProps = PopupFieldProps<string>;
export type PopupFieldNumberProps = PopupFieldProps<number>;

function PopupDialog({
  title,
  description,
  name,
  placeholder,
  defaultValue,
  onValueChange,
  onSubmit,
  open,
  setOpen,
  cancelLabel,
  confirmLabel,
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
            placeholder={placeholder}
          />
        </div>
        <DialogFooter>
          <Button variant={`outline`} onClick={() => setOpen(false)}>
            {cancelLabel || t("cancel")}
          </Button>
          <Button
            loading={true}
            onClick={async () => {
              if (!onSubmit) return;

              const status: boolean = await onSubmit(value);
              if (status) {
                setOpen(false);
                setValue(defaultValue || "");
              }
            }}
          >
            {confirmLabel || t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PopupDialog;

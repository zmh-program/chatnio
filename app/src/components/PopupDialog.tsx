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
import { NumberInput } from "@/components/ui/number-input.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export enum popupTypes {
  Text = "text",
  Number = "number",
  Switch = "switch",
  Empty = "empty",
}

export type PopupDialogProps = {
  title: string;
  description?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => string;
  onSubmit?: (value: string) => Promise<boolean>;
  destructive?: boolean;
  disabled?: boolean;

  type?: popupTypes;

  open: boolean;
  setOpen: (open: boolean) => void;

  cancelLabel?: string;
  confirmLabel?: string;

  componentProps?: any;
  alert?: string;
};

type PopupFieldProps = PopupDialogProps & {
  value: string;
  setValue: (value: string) => void;
};

function PopupField({
  type,
  setValue,
  onValueChange,
  value,
  placeholder,
  componentProps,
}: PopupFieldProps) {
  switch (type) {
    case popupTypes.Text:
      return (
        <Input
          onChange={(e) => {
            setValue(
              onValueChange ? onValueChange(e.target.value) : e.target.value,
            );
          }}
          value={value}
          placeholder={placeholder}
          {...componentProps}
        />
      );

    case popupTypes.Number:
      return (
        <NumberInput
          type={`number`}
          value={parseFloat(value)}
          onValueChange={(v) => setValue(v.toString())}
          placeholder={placeholder}
          {...componentProps}
        />
      );

    case popupTypes.Switch:
      return (
        <Switch
          checked={value === "true"}
          onCheckedChange={(state: boolean) => {
            setValue(state.toString());
          }}
          {...componentProps}
        />
      );

    case popupTypes.Empty:
      return null;

    default:
      return null;
  }
}

function PopupDialog(props: PopupDialogProps) {
  const {
    title,
    description,
    name,
    type,
    defaultValue,
    onSubmit,
    open,
    setOpen,
    cancelLabel,
    confirmLabel,
    destructive,
    disabled,
    alert,
  } = props;

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
        {!(type === popupTypes.Empty) && (
          <div className={`pt-1 flex flex-row items-center justify-center`}>
            <span className={`mr-4 whitespace-nowrap`}>{name}</span>
            <PopupField {...props} value={value} setValue={setValue} />
          </div>
        )}
        {alert && (
          <Alert className={`pb-3 select-none text-secondary`}>
            <AlertCircle className="text-secondary mt-[1px] h-4 w-4" />
            <AlertDescription className={`mt-[1px]`}>{alert}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant={`outline`} onClick={() => setOpen(false)}>
            {cancelLabel || t("cancel")}
          </Button>
          <Button
            disabled={disabled}
            variant={destructive ? `destructive` : `default`}
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

type PopupAlertDialogProps = {
  title: string;
  description?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSubmit?: () => Promise<boolean>;
};

export function PopupAlertDialog({
  title,
  description,
  open,
  setOpen,
  cancelLabel,
  confirmLabel,
  destructive,
  disabled,
  onSubmit,
}: PopupAlertDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel || t("cancel")}</AlertDialogCancel>
          <Button
            disabled={disabled}
            variant={destructive ? `destructive` : `default`}
            loading={true}
            onClick={async () => {
              if (!onSubmit) return;
              const status: boolean = await onSubmit();
              if (status) {
                setOpen(false);
              }
            }}
          >
            {confirmLabel || t("confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PopupDialog;

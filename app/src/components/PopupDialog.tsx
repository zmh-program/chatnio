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

export enum popupTypes {
  Text = "text",
  Number = "number",
  Switch = "switch",
  Empty = "empty",
}

export type PopupDialogProps = {
  title: string;
  description?: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => string;
  onSubmit?: (value: string) => Promise<boolean>;
  destructive?: boolean;

  type?: popupTypes;

  open: boolean;
  setOpen: (open: boolean) => void;

  cancelLabel?: string;
  confirmLabel?: string;
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
        />
      );

    case popupTypes.Number:
      return (
        <NumberInput
          type={`number`}
          value={parseFloat(value)}
          onValueChange={(v) => setValue(v.toString())}
          placeholder={placeholder}
        />
      );

    case popupTypes.Switch:
      return (
        <Switch
          checked={value === "true"}
          onCheckedChange={(state: boolean) => {
            setValue(state.toString());
          }}
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
        <DialogFooter>
          <Button variant={`outline`} onClick={() => setOpen(false)}>
            {cancelLabel || t("cancel")}
          </Button>
          <Button
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

export default PopupDialog;

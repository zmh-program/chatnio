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
import { useEffect, useMemo, useState } from "react";
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
import { Calendar } from "@/components/ui/calendar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Combobox } from "@/components/ui/combo-box.tsx";

export enum popupTypes {
  Text = "text",
  Number = "number",
  Switch = "switch",
  Clock = "clock",
  List = "list",
  Empty = "empty",
}
type ParamProps = {
  dataList?: string[];
  dataListTranslated?: string;
};

export type PopupDialogProps = {
  title: string;
  description?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => string;
  params?: ParamProps;
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
  params,
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
    case popupTypes.Clock:
      return <CalendarComp value={value} onValueChange={(v) => setValue(v)} />;

    case popupTypes.List:
      return (
        <Combobox
          value={value}
          onChange={(v) => setValue(v)}
          list={params?.dataList || []}
          listTranslated={params?.dataListTranslated || ""}
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
function fixedZero(val: number) {
  return val < 10 ? `0${val}` : val.toString();
}

function CalendarComp(props: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  const { value, onValueChange } = props;
  const { t } = useTranslation();

  const convertedDate = useMemo(() => {
    const date = new Date(value.split(" ")[0] || "1970-01-01");
    console.log(`[calendar] converted date:`, date);
    return date;
  }, [value]);

  const onDateChange = (date: Date, overrideTime?: boolean) => {
    const v = `${date.getFullYear()}-${fixedZero(
      date.getMonth() + 1,
    )}-${fixedZero(date.getDate())}`;
    const t = !overrideTime
      ? value.split(" ")[1] || "00:00:00"
      : `${fixedZero(date.getHours())}:${fixedZero(
          date.getMinutes(),
        )}:${fixedZero(date.getSeconds())}`;

    console.log(`[calendar] clicked date: [${v} ${t}]`);
    onValueChange(`${v} ${t}`);
  };

  const [month, setMonth] = useState(convertedDate);
  useEffect(() => {
    setMonth(convertedDate);
  }, [convertedDate]);

  return (
    <div
      className={`flex flex-col gap-2 items-center justify-center px-2 w-full h-fit`}
    >
      <Calendar
        className={`scale-90 md:scale-100`}
        mode="single"
        month={month}
        onMonthChange={(date) => date && setMonth(date)}
        selected={convertedDate}
        onSelect={(date) => date && onDateChange(date)}
      />
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={t("date.pick")}
        className={`w-full text-center`}
      />
      <Separator />
      <div className={`flex flex-row w-full flex-wrap`}>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() => onDateChange(new Date("1970-01-01 00:00:00"), true)}
        >
          {t("date.clean")}
        </Button>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() => onDateChange(new Date(), true)}
        >
          {t("date.today")}
        </Button>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() =>
            onDateChange(
              new Date(convertedDate.setDate(convertedDate.getDate() + 1)),
            )
          }
        >
          {t("date.add-day")}
        </Button>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() =>
            onDateChange(
              new Date(convertedDate.setDate(convertedDate.getDate() - 1)),
            )
          }
        >
          {t("date.sub-day")}
        </Button>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() =>
            onDateChange(
              new Date(convertedDate.setMonth(convertedDate.getMonth() + 1)),
            )
          }
        >
          {t("date.add-month")}
        </Button>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() =>
            onDateChange(
              new Date(convertedDate.setMonth(convertedDate.getMonth() - 1)),
            )
          }
        >
          {t("date.sub-month")}
        </Button>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() =>
            onDateChange(
              new Date(
                convertedDate.setFullYear(convertedDate.getFullYear() + 1),
              ),
            )
          }
        >
          {t("date.add-year")}
        </Button>
        <Button
          variant={`outline`}
          className={`m-0.5 shrink-0`}
          onClick={() =>
            onDateChange(
              new Date(
                convertedDate.setFullYear(convertedDate.getFullYear() - 1),
              ),
            )
          }
        >
          {t("date.sub-year")}
        </Button>
      </div>
    </div>
  );
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

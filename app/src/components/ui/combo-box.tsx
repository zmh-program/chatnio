import React from "react";

import { cn } from "@/components/ui/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type ComboBoxProps = {
  value: string;
  onChange: (value: string) => void;
  list: string[];
  listTranslated?: string;
  placeholder?: string;
  defaultOpen?: boolean;
  className?: string;
  classNameContent?: string;
  align?: "start" | "end" | "center" | undefined;
  hideSearchBar?: boolean;
};

export function Combobox({
  value,
  onChange,
  list,
  listTranslated,
  placeholder,
  defaultOpen,
  className,
  classNameContent,
  align,
  hideSearchBar,
}: ComboBoxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(defaultOpen ?? false);
  const valueList = React.useMemo((): string[] => {
    // list set (if some element in current value is not in list, it will be added)
    const seq = [...list, value ?? ""].filter((v) => v);
    const set = new Set(seq);
    return [...set];
  }, [list, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[320px] max-w-[60vw] justify-between", className)}
        >
          {value
            ? listTranslated
              ? t(`${listTranslated}.${value}`)
              : value
            : placeholder ?? ""}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[320px] max-w-[60vw] p-0", classNameContent)}
        align={align}
      >
        <Command>
          {!hideSearchBar && <CommandInput placeholder={placeholder} />}
          <CommandEmpty>{t("admin.empty")}</CommandEmpty>
          <CommandList>
            {valueList.map((key) => (
              <CommandItem
                key={key}
                value={key}
                onSelect={() => {
                  if (key === value) return setOpen(false);

                  onChange(key);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    key === value ? "opacity-100" : "opacity-0",
                  )}
                />
                {listTranslated ? t(`${listTranslated}.${key}`) : key}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

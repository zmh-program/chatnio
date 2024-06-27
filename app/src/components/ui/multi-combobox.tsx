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

type MultiComboBoxProps = {
  value: string[];
  onChange: (value: string[]) => void;
  list: string[];
  listTranslate?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  defaultOpen?: boolean;
  className?: string;
  align?: "start" | "end" | "center" | undefined;
  disabled?: boolean;
  disabledSearch?: boolean;
  children?: React.ReactNode;
};

export function MultiCombobox({
  value,
  onChange,
  list,
  listTranslate,
  placeholder,
  searchPlaceholder,
  defaultOpen,
  className,
  align,
  disabled,
  disabledSearch,
  children,
}: MultiComboBoxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(defaultOpen ?? false);
  const valueList = React.useMemo((): string[] => {
    // list set (if some element in current value is not in list, it will be added)
    const seq = [...list, ...(value ?? [])].filter((v) => v);
    const set = new Set(seq);
    return [...set];
  }, [list]);

  const v = value ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            variant={`outline`}
            role={`combobox`}
            aria-expanded={open}
            className={cn("w-[320px] max-w-[60vw] justify-between", className)}
            disabled={disabled}
          >
            <Check className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            {placeholder ?? `${v.length} Items Selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[320px] max-w-[60vw] p-0" align={align}>
        <Command>
          {!disabledSearch && <CommandInput placeholder={searchPlaceholder} />}
          <CommandEmpty>{t("admin.empty")}</CommandEmpty>
          <CommandList className={`thin-scrollbar`}>
            {valueList.map((key) => (
              <CommandItem
                key={key}
                value={key}
                onSelect={(current) => {
                  if (v.includes(current)) {
                    onChange(v.filter((item) => item !== current));
                  } else {
                    onChange([...v, current]);
                  }
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    v.includes(key) ? "opacity-100" : "opacity-0",
                  )}
                />
                {listTranslate ? t(`${listTranslate}.${key}`) : key}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

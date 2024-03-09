import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { mobile } from "@/utils/device.ts";
import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge.tsx";

export type SelectItemBadgeProps = {
  variant: "default" | "gold";
  name: string;
};

export type SelectItemProps = {
  name: string;
  value: string;
  badge?: SelectItemBadgeProps;
  tag?: any;
  icon?: React.ReactNode;
};

type SelectGroupProps = {
  current: SelectItemProps;
  list: SelectItemProps[];
  onChange?: (select: string) => void;
  maxElements?: number;
  className?: string;
  classNameDesktop?: string;
  classNameMobile?: string;
  side?: "left" | "right" | "top" | "bottom";

  selectGroupTop?: SelectItemProps;
  selectGroupBottom?: SelectItemProps;
};

function GroupSelectItem(props: SelectItemProps) {
  return (
    <div className={`mr-1 flex flex-row items-center align-center`}>
      {props.icon && <div className={`mr-1`}>{props.icon}</div>}
      {props.value}
      {props.badge && (
        <Badge
          className={`select-element badge ml-1 badge-${props.badge.variant}`}
        >
          {props.badge.name}
        </Badge>
      )}
    </div>
  );
}

function SelectGroupDesktop(props: SelectGroupProps) {
  const max: number = props.maxElements || 5;
  const range = props.list.length > max ? max : props.list.length;
  const display = props.list.slice(0, range);
  const hidden = props.list.slice(range);

  return (
    <div className={`select-group`}>
      {display.map((select: SelectItemProps, idx: number) => (
        <div
          key={idx}
          onClick={() => props.onChange?.(select.name)}
          className={`select-group-item ${
            select == props.current ? "active" : ""
          }`}
        >
          <GroupSelectItem {...select} />
        </div>
      ))}

      {props.list.length > max && (
        <Select
          defaultValue={"..."}
          value={props.current?.name || "..."}
          onValueChange={(value: string) => props.onChange?.(value)}
        >
          <SelectTrigger
            className={`w-max gap-1 select-group-item ${
              hidden.includes(props.current) ? "active" : ""
            }`}
          >
            <SelectValue asChild>
              <span>
                {hidden.includes(props.current) ? props.current.value : "..."}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            className={`${props.className} ${props.classNameDesktop}`}
          >
            {props.selectGroupTop && (
              <SelectItem
                value={props.selectGroupTop.name}
                onClick={() => props.onChange?.(props.selectGroupTop!.name)}
              >
                <GroupSelectItem {...props.selectGroupTop} />
              </SelectItem>
            )}

            {hidden.map((select: SelectItemProps, idx: number) => (
              <SelectItem key={idx} value={select.name}>
                <GroupSelectItem {...select} />
              </SelectItem>
            ))}

            {props.selectGroupBottom && (
              <SelectItem
                value={props.selectGroupBottom.name}
                onClick={() => props.onChange?.(props.selectGroupBottom!.name)}
              >
                <GroupSelectItem {...props.selectGroupBottom} />
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function SelectGroupMobile(props: SelectGroupProps) {
  return (
    <div className={`mb-2 w-full`}>
      <Select
        value={props.current?.name || ""}
        onValueChange={(value: string) => {
          props.onChange?.(value);
        }}
      >
        <SelectTrigger className="select-group mobile whitespace-nowrap flex-nowrap">
          <SelectValue placeholder={props.current?.value || ""} />
        </SelectTrigger>
        <SelectContent
          className={`${props.className} ${props.classNameMobile}`}
        >
          {props.selectGroupTop && (
            <SelectItem
              value={props.selectGroupTop.name}
              onClick={() => props.onChange?.(props.selectGroupTop!.name)}
            >
              <GroupSelectItem {...props.selectGroupTop} />
            </SelectItem>
          )}

          {props.list.map((select: SelectItemProps, idx: number) => (
            <SelectItem
              className={`whitespace-nowrap`}
              key={idx}
              value={select.name}
            >
              <GroupSelectItem {...select} />
            </SelectItem>
          ))}

          {props.selectGroupBottom && (
            <SelectItem
              value={props.selectGroupBottom.name}
              onClick={() => props.onChange?.(props.selectGroupBottom!.name)}
            >
              <GroupSelectItem {...props.selectGroupBottom} />
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

function SelectGroup(props: SelectGroupProps) {
  const [state, setState] = useState(mobile);
  useEffect(() => {
    window.addEventListener("resize", () => {
      setState(mobile);
    });
  }, []);

  return state ? (
    <SelectGroupMobile {...props} />
  ) : (
    <SelectGroupDesktop {...props} />
  );
}

export default SelectGroup;

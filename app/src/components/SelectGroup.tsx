import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { mobile } from "../utils.ts";
import { useEffect, useState } from "react";

type SelectGroupProps = {
  current: string;
  list: string[];
  onChange?: (select: string) => void;
};

function SelectGroup(props: SelectGroupProps) {
  const [state, setState] = useState(mobile);
  useEffect(() => {
    window.addEventListener("resize", () => {
      setState(mobile);
    });
  }, []);

  return state ? (
    <Select
      value={props.current}
      onValueChange={(value: string) => props.onChange?.(value)}
    >
      <SelectTrigger className="select-group mobile">
        <SelectValue placeholder={props.current} />
      </SelectTrigger>
      <SelectContent>
        {props.list.map((select: string, idx: number) => (
          <SelectItem key={idx} value={select}>
            {select}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    <div className={`select-group`}>
      {props.list.map((select: string, idx: number) => (
        <div
          key={idx}
          onClick={() => props.onChange?.(select)}
          className={`select-group-item ${
            select == props.current ? "active" : ""
          }`}
        >
          {select}
        </div>
      ))}
    </div>
  );
}

export default SelectGroup;

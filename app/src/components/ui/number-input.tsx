import * as React from "react";
import {Input, InputProps} from "@/components/ui/input.tsx";
import {getNumber} from "@/utils/base.ts";
import {useEffect, useState} from "react";

export interface NumberInputProps
  extends InputProps {
  value: number;
  max?: number;
  min?: number;
  onValueChange: (value: number) => void;
  acceptNegative?: boolean;
  acceptNaN?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, type, ...props }, ref) => {
    const [value, setValue] = useState("");
    useEffect(() => {
      setValue(props.value.toString());
    }, [props.value]);

    return (
      <Input
        ref={ref}
        className={`number-input ${className}`}
        id={props.id}
        value={value}
        onChange={(e) => {
          const raw = getNumber(e.target.value, props.acceptNegative);
          let value = parseFloat(raw);
          if (isNaN(value) && !props.acceptNaN) value = 0;
          if (props.max !== undefined && value > props.max) value = props.max;
          else if (props.min !== undefined && value < props.min) value = props.min;
          props.onValueChange(value);
        }}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };

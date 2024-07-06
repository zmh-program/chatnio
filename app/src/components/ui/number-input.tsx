import * as React from "react";
import { Input, InputProps } from "@/components/ui/input.tsx";
import { getNumber } from "@/utils/base.ts";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/components/ui/lib/utils.ts";

export interface NumberInputProps extends InputProps {
  value: number;
  max?: number;
  min?: number;
  onValueChange: (value: number) => void;
  acceptNegative?: boolean;
  acceptNaN?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, type, ...props }, ref) => {
    const [value, setValue] = useState(props.value.toString());
    useEffect(() => {
      // fix life cycle: update value when props.value changed
      if (getValue(value.toString()) !== props.value) {
        setValue(props.value.toString());
      }
    }, [props.value]);

    const getValue = (v: string) => {
      const raw = getNumber(v, props.acceptNegative);
      let val = parseFloat(raw);
      if (isNaN(val) && !props.acceptNaN) val = 0;
      if (props.max !== undefined && val > props.max) val = props.max;
      else if (props.min !== undefined && val < props.min) val = props.min;
      return val;
    };

    const formatValue = (v: string) => {
      if (v.trim().length === 0) return v.trim();

      if (!/^[-+]?(?:[0-9]*(?:\.[0-9]*)?)?$/.test(v)) {
        const exp = /[-+]?[0-9]+(\.[0-9]+)?/g;
        return v.match(exp)?.join("") || "";
      }

      if (v === "-" && props.acceptNegative) return v;

      // replace -0124.5 to -124.5, 0043 to 43, 2.000 to 2.000
      const exp = /^[-+]?0+(?=[0-9]+(\.[0-9]+)?$)/;
      v = v.replace(exp, "");

      const raw = getNumber(v, props.acceptNegative);
      let val = parseFloat(raw);
      if (isNaN(val) && !props.acceptNaN) return (props.min ?? 0).toString();
      if (props.max !== undefined && val > props.max)
        return props.max.toString();
      else if (props.min !== undefined && val < props.min)
        return props.min.toString();

      return v;
    };

    const isValid = useMemo((): boolean => {
      if (!/^[-+]?[0-9]+(\.[0-9]+)?$/.test(value)) return false;
      const val = getValue(value);
      if (props.max !== undefined && val > props.max) return false;
      else if (props.min !== undefined && val < props.min) return false;
      return true;
    }, [value]);

    return (
      <Input
        {...props}
        ref={ref}
        className={cn(
          "number-input transition",
          className,
          !isValid && "border-red-600 focus:border-red-700",
        )}
        id={props.id}
        value={value}
        onChange={(e) => {
          setValue(formatValue(e.target.value));
          props.onValueChange(getValue(e.target.value));
        }}
        min={props.min}
        max={props.max}
        onWheel={(e) => {
          e.stopPropagation();
        }}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };

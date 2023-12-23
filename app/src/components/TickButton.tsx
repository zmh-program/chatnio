import { Button, ButtonProps } from "@/components/ui/button.tsx";
import React, { useEffect, useRef, useState } from "react";
import { isAsyncFunc } from "@/utils/base.ts";

export interface TickButtonProps extends ButtonProps {
  tick: number;
  onTickChange?: (tick: number) => void;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => boolean | Promise<boolean>;
}

function TickButton({
  tick,
  onTickChange,
  onClick,
  children,
  ...props
}: TickButtonProps) {
  const stamp = useRef(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    setInterval(() => {
      const offset = Math.floor((Number(Date.now()) - stamp.current) / 1000);
      let value = tick - offset;
      if (value <= 0) value = 0;
      setTimer(value);
      onTickChange && onTickChange(value);
    }, 250);
  }, []);

  const onReset = () => (stamp.current = Number(Date.now()));

  // if is async function, use this:
  const onTrigger = isAsyncFunc(onClick)
    ? async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (timer !== 0 || !onClick) return;
        if (await onClick(e)) onReset();
      }
    : (e: React.MouseEvent<HTMLButtonElement>) => {
        if (timer !== 0 || !onClick) return;
        if (onClick(e)) onReset();
      };

  return (
    <Button {...props} onClick={onTrigger}>
      {timer === 0 ? children : `${timer}s`}
    </Button>
  );
}

export default TickButton;

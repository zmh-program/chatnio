import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useTemporaryState } from "@/utils/hook.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-10 rounded-md px-4",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "default-sm": "h-8 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      onClick,
      disabled,
      children,
      asChild = false,
      loading = false,
      onLoadingChange,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const [working, setWorking] = useState<boolean>(false);
    const onTrigger =
      loading && onClick
        ? (e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();

            if (working) return;
            setWorking(true);

            // execute the onClick handler (detecting if it's a promise or not)
            const result: Promise<any> | any = onClick && onClick(e);
            if (result instanceof Promise)
              result.finally(() => setWorking(false));
            else setWorking(false);
          }
        : onClick;

    loading &&
      onLoadingChange &&
      useEffect(() => {
        onLoadingChange(working);
      }, [working]);

    const child = useMemo(() => {
      if (asChild) return children;
      if (size === "icon" || size === "icon-sm") {
        if (loading && working) {
          return <Loader2 className={`animate-spin w-4 h-4`} />;
        }
      }

      return (
        <>
          {loading && working && (
            <Loader2 className={`animate-spin w-4 h-4 mr-2`} />
          )}
          {children}
        </>
      );
    }, [asChild, children, loading, working]);

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={onTrigger}
        disabled={disabled || working}
        {...props}
      >
        {child}
      </Comp>
    );
  },
);
Button.displayName = "Button";

type TemporaryButtonProps = ButtonProps & {
  interval?: number;
};

const TemporaryButton = React.forwardRef<
  HTMLButtonElement,
  TemporaryButtonProps
>(({ interval, children, onClick, ...props }, ref) => {
  const { state, triggerState } = useTemporaryState(interval);

  const event = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    triggerState();
  };

  return (
    <Button ref={ref} onClick={event} {...props}>
      {state ? <Check className={`h-4 w-4`} /> : children}
    </Button>
  );
});

export { Button, TemporaryButton, buttonVariants };

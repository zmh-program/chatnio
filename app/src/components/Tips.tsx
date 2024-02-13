import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { HelpCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/components/ui/lib/utils.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

type TipsProps = {
  content?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  classNamePopup?: string;
  hideTimeout?: number;
};

function Tips({
  content,
  trigger,
  children,
  className,
  classNamePopup,
  hideTimeout,
}: TipsProps) {
  const timeout = hideTimeout ?? 2500;
  const comp = useMemo(
    () => (
      <>
        {content && <p className={`text-center`}>{content}</p>}
        {children}
      </>
    ),
    [content, children],
  );

  const [drop, setDrop] = React.useState(false);
  const [tooltip, setTooltip] = React.useState(false);

  const task = useRef<NodeJS.Timeout>();

  useEffect(() => {
    drop
      ? (task.current = setTimeout(() => setDrop(false), timeout))
      : clearTimeout(task.current);
  }, [drop]);

  useEffect(() => {
    if (!tooltip) return;

    setTooltip(false);
    !drop && setDrop(true);
  }, [drop, tooltip]);

  return (
    <DropdownMenu open={drop} onOpenChange={setDrop}>
      <DropdownMenuTrigger className={`tips-trigger select-none outline-none`}>
        <TooltipProvider>
          <Tooltip open={tooltip} onOpenChange={setTooltip}>
            <TooltipTrigger asChild>
              {trigger ?? <HelpCircle className={cn("tips-icon", className)} />}
            </TooltipTrigger>
            <TooltipContent className="hidden" />
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "px-3 py-1.5 cursor-pointer text-sm min-w-0 max-w-[90vw]",
          classNamePopup,
        )}
        side={`top`}
      >
        {comp}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Tips;

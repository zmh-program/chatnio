import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { HelpCircle } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { cn } from "@/components/ui/lib/utils.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

type TipsProps = {
  content?: string;
  children?: React.ReactNode;
  className?: string;
  hideTimeout?: number;
};

function Tips({ content, children, className, hideTimeout }: TipsProps) {
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

  useEffect(() => {
    drop && setTimeout(() => setDrop(false), timeout);
  }, [drop]);

  useEffect(() => {
    tooltip && drop && setTooltip(false);
  }, [drop, tooltip]);

  return (
    <DropdownMenu open={drop} onOpenChange={setDrop}>
      <DropdownMenuTrigger className={`select-none outline-none`}>
        <TooltipProvider>
          <Tooltip open={tooltip} onOpenChange={setTooltip}>
            <TooltipTrigger asChild>
              <HelpCircle className={cn("tips-icon", className)} />
            </TooltipTrigger>
            <TooltipContent>{comp}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={"px-3 py-1.5 cursor-pointer text-sm"}
        side={`top`}
      >
        {comp}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Tips;

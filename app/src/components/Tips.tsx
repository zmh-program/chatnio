import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { HelpCircle } from "lucide-react";
import React from "react";
import { cn } from "@/components/ui/lib/utils.ts";

type TipsProps = {
  content?: string;
  children?: React.ReactNode;
  className?: string;
};

function Tips({ content, children, className }: TipsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={cn("tips-icon", className)} />
        </TooltipTrigger>
        <TooltipContent>
          {content && <p>{content}</p>}
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default Tips;

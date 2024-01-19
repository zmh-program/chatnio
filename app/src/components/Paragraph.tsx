import React from "react";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/components/ui/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import Markdown from "@/components/Markdown.tsx";

export type ParagraphProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  configParagraph?: boolean;
  isCollapsed?: boolean;
  onCollapse?: () => void;
  defaultCollapsed?: boolean;
};

function Paragraph({
  title,
  children,
  className,
  configParagraph,
  isCollapsed,
  onCollapse,
  defaultCollapsed,
}: ParagraphProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed ?? false);

  React.useEffect(() => onCollapse && onCollapse(), [collapsed]);

  return (
    <div
      className={cn(
        `paragraph`,
        configParagraph && `config-paragraph`,
        isCollapsed && `collapsable`,
        collapsed && `collapsed`,
        className,
      )}
    >
      <div
        className={`paragraph-header`}
        onClick={() => setCollapsed(!collapsed)}
      >
        {title && <div className={`paragraph-title`}>{title}</div>}
        <div className={`grow`} />
        {isCollapsed && (
          <Button size={`icon`} variant={`ghost`} className={`w-8 h-8`}>
            <ChevronDown
              className={cn(
                `w-4 h-4 transition-transform duration-300`,
                collapsed && `transform rotate-180`,
              )}
            />
          </Button>
        )}
      </div>
      <div
        className={`paragraph-content`}
        style={
          {
            "--max-height": collapsed ? "0px" : "1000px",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}

function ParagraphItem({
  children,
  className,
  rowLayout,
}: {
  children: React.ReactNode;
  className?: string;
  rowLayout?: boolean;
}) {
  return (
    <div className={cn("paragraph-item", className, rowLayout && "row-layout")}>
      {children}
    </div>
  );
}

export function ParagraphDescription({ children }: { children: string }) {
  return (
    <div className={`paragraph-description`}>
      <Info size={16} />
      <Markdown children={children} />
    </div>
  );
}

export function ParagraphSpace() {
  return <div className={`paragraph-space`} />;
}

function ParagraphFooter({ children }: { children: React.ReactNode }) {
  return <div className={`paragraph-footer`}>{children}</div>;
}

export default Paragraph;
export { ParagraphItem, ParagraphFooter };

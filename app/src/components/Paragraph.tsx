import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/components/ui/lib/utils.ts";
import Markdown from "@/components/Markdown.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";

export type ParagraphProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  configParagraph?: boolean;
  isCollapsed?: boolean;
};

function Paragraph({
  title,
  children,
  className,
  configParagraph,
  isCollapsed,
}: ParagraphProps) {
  return (
    <Accordion type={`single`} collapsible={isCollapsed} defaultValue={"item"}>
      <AccordionItem
        value={`item`}
        className={cn(
          `paragraph`,
          configParagraph && `config-paragraph`,
          className,
        )}
      >
        <AccordionTrigger className={`paragraph-header`}>
          <div className={`paragraph-title`}>{title ?? ""}</div>
        </AccordionTrigger>
        <AccordionContent className={`paragraph-content mt-2`}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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

type ParagraphDescriptionProps = {
  children: string;
  border?: boolean;
};

export function ParagraphDescription({
  children,
  border,
}: ParagraphDescriptionProps) {
  return (
    <div
      className={cn(
        "paragraph-description",
        border && `px-4 py-4 border rounded-lg`,
      )}
    >
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

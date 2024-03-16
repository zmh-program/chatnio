import React, { useEffect } from "react";
import mermaid from "mermaid";
import { cn } from "@/components/ui/lib/utils.ts";
import { Check, Copy, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { copyClipboard } from "@/utils/dom.ts";

mermaid.initialize({
  theme: "dark",
  themeCSS: `
     .node rect {
        stroke: #fff;
      }
  `,
  fontFamily:
    'Andika,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
});

type MermaidProps = {
  children: string | React.ReactNode;
};

export function Mermaid({ children }: MermaidProps) {
  const chart = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  const createRenderTask = useDebouncedCallback(() => {
    if (!chart.current) return;

    // preflight check syntax is valid, if not, suppress the error message

    console.debug(`[mermaid] create render task`);
    mermaid
      .run({
        nodes: [chart.current],
        suppressErrors: true, // suppresses the error message
      })
      .catch((e) => {
        setError(true);
        console.warn(`[mermaid] render failed: ${e}`);
      });

    setLoading(false);
  }, 500);

  useEffect(() => {
    createRenderTask();
    setLoading(true);
  }, [children]);

  return (
    <div className={`whitespace-pre-wrap markdown-syntax`}>
      <div
        className={`markdown-syntax-header`}
        onClick={async () => {
          const text = children?.toString() || "";
          await copyClipboard(text);
          setCopied(true);
        }}
      >
        {copied ? (
          <Check className={`h-3 w-3`} />
        ) : (
          <Copy className={`h-3 w-3`} />
        )}
        <p>mermaid</p>
      </div>
      <div
        className={cn(
          "flex flex-row items-center justify-center text-primary select-none mb-4",
          !loading && "hidden",
        )}
      >
        <Loader2 className={`h-4 w-4 mr-2 animate-spin shrink-0`} />
        {error ? "Failed to render" : "Rendering..."}
      </div>
      <div className={cn("mermaid", loading && "mt-2")} ref={chart}>
        {children}
      </div>
    </div>
  );
}

export function MarkdownMermaid({ children }: { children: React.ReactNode }) {
  return <Mermaid children={children} />;
}

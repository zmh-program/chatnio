import { MarkdownFile } from "@/components/plugins/file.tsx";
import { MarkdownProgressbar } from "@/components/plugins/progress.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import { copyClipboard } from "@/utils/dom.ts";
import { Check, Copy } from "lucide-react";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark as style } from "react-syntax-highlighter/dist/esm/styles/hljs";
import React, { useMemo } from "react";
import { MarkdownMermaid } from "@/components/plugins/mermaid.tsx";

const LanguageMap: Record<string, string> = {
  html: "htmlbars",
  js: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  rs: "rust",
};

export type CodeProps = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  codeStyle?: string;
  loading?: boolean;
};

function Code({
  inline,
  className,
  children,
  loading,
  codeStyle,
  ...props
}: CodeProps) {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toLowerCase() : "unknown";
  if (language === "file") return <MarkdownFile children={children} />;
  if (language === "progress")
    return <MarkdownProgressbar children={children} />;
  if (language === "mermaid") return <MarkdownMermaid children={children} />;

  if (inline)
    return (
      <code className={cn("code-inline", className)} {...props}>
        {children}
      </code>
    );

  return (
    <div className={`markdown-syntax`}>
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
        <p>{language}</p>
      </div>
      <SyntaxHighlighter
        {...props}
        children={String(children).replace(/\n$/, "")}
        style={style}
        language={LanguageMap[language] || language}
        PreTag="div"
        wrapLongLines={true}
        wrapLines={true}
        className={cn("code-block", codeStyle)}
      />
    </div>
  );
}

export default function ({
  inline,
  className,
  children,
  codeStyle,
  loading,
  ...props
}: CodeProps) {
  return useMemo(() => {
    return (
      <Code
        inline={inline}
        className={className}
        children={children}
        codeStyle={codeStyle}
        loading={loading}
        {...props}
      />
    );
  }, [inline, className, children, codeStyle, loading, props]);
}

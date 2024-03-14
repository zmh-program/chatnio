import { parseFile } from "@/components/plugins/file.tsx";
import { parseProgressbar } from "@/components/plugins/progress.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import { copyClipboard } from "@/utils/dom.ts";
import { Copy } from "lucide-react";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark as style } from "react-syntax-highlighter/dist/esm/styles/hljs";
import React from "react";

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
};

export default function ({
  inline,
  className,
  children,
  codeStyle,
  ...props
}: CodeProps) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toLowerCase() : "unknown";
  if (language === "file") return parseFile(children);
  if (language === "progress") return parseProgressbar(children);

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
        }}
      >
        <Copy className={`h-3 w-3`} />
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

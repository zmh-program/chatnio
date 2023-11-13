import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark as style } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { parseFile } from "./plugins/file.tsx";
import "@/assets/markdown/all.less";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { openDialog as openQuotaDialog } from "@/store/quota.ts";
import { openDialog as openSubscriptionDialog } from "@/store/subscription.ts";
import { AppDispatch } from "@/store";
import { Copy } from "lucide-react";
import { copyClipboard } from "@/utils/dom.ts";
import { useToast } from "./ui/use-toast.ts";
import { useTranslation } from "react-i18next";
import { parseProgressbar } from "@/components/plugins/progress.tsx";

type MarkdownProps = {
  children: string;
  className?: string;
};

function doAction(dispatch: AppDispatch, url: string): boolean {
  if (url === "/subscribe") {
    dispatch(openSubscriptionDialog());
    return true;
  } else if (url === "/buy") {
    dispatch(openQuotaDialog());
    return true;
  }
  return false;
}

const LanguageMap: Record<string, string> = {
  html: "htmlbars",
  js: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  rs: "rust",
};

function Markdown({ children, className }: MarkdownProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    document.querySelectorAll(".file-instance").forEach((el) => {
      const parent = el.parentElement as HTMLElement;
      if (!parent.classList.contains("file-block"))
        parent.classList.add("file-block");
    });
  }, [children]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      className={`markdown-body ${className}`}
      children={children}
      components={{
        a({ href, children }) {
          const url: string = href?.toString() || "";

          return (
            <a
              href={url}
              target={`_blank`}
              rel={`noopener noreferrer`}
              onClick={(e) => {
                if (doAction(dispatch, url)) e.preventDefault();
              }}
            >
              {children}
            </a>
          );
        },
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          if (language === "file") return parseFile(children.toString());
          if (language === "progress")
            return parseProgressbar(children.toString());

          return !inline && match ? (
            <div className={`markdown-syntax`}>
              <div className={`markdown-syntax-header`}>
                <Copy
                  className={`h-3 w-3`}
                  onClick={async () => {
                    await copyClipboard(children.toString());
                    toast({
                      title: t("share.copied"),
                    });
                  }}
                />
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
                className={`code-block`}
              />
            </div>
          ) : (
            <code className={`code-inline ${className}`} {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );
}

export default Markdown;

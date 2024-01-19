import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark as style } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { parseFile } from "./plugins/file.tsx";
import "@/assets/markdown/all.less";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { openDialog as openQuotaDialog } from "@/store/quota.ts";
import { openDialog as openSubscriptionDialog } from "@/store/subscription.ts";
import { AppDispatch } from "@/store";
import {
  Codepen,
  Codesandbox,
  Copy,
  Github,
  Twitter,
  Youtube,
} from "lucide-react";
import { copyClipboard } from "@/utils/dom.ts";
import { useToast } from "./ui/use-toast.ts";
import { useTranslation } from "react-i18next";
import { parseProgressbar } from "@/components/plugins/progress.tsx";
import { cn } from "@/components/ui/lib/utils.ts";

type MarkdownProps = {
  children: string;
  className?: string;
  acceptHtml?: boolean;
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

function getSocialIcon(url: string) {
  try {
    const { hostname } = new URL(url);

    if (hostname.includes("github.com"))
      return <Github className="h-4 w-4 inline-block mr-0.5" />;
    if (hostname.includes("twitter.com"))
      return <Twitter className="h-4 w-4 inline-block mr-0.5" />;
    if (hostname.includes("youtube.com"))
      return <Youtube className="h-4 w-4 inline-block mr-0.5" />;
    if (hostname.includes("codepen.io"))
      return <Codepen className="h-4 w-4 inline-block mr-0.5" />;
    if (hostname.includes("codesandbox.io"))
      return <Codesandbox className="h-4 w-4 inline-block mr-0.5" />;
  } catch (e) {
    return;
  }
}

function MarkdownContent({ children, className, acceptHtml }: MarkdownProps) {
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

  const rehypePlugins = useMemo(() => {
    const plugins = [rehypeKatex];
    return acceptHtml ? [...plugins, rehypeRaw] : plugins;
  }, [acceptHtml]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]} // @ts-ignore
      rehypePlugins={rehypePlugins}
      className={cn("markdown-body", className)}
      children={children}
      skipHtml={!acceptHtml}
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
              {getSocialIcon(url)}
              {children}
            </a>
          );
        },
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1].toLowerCase() : "";
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

function Markdown(props: MarkdownProps) {
  // memoize the component
  const { children, className, acceptHtml } = props;
  return useMemo(
    () => (
      <MarkdownContent className={className} acceptHtml={acceptHtml}>
        {children}
      </MarkdownContent>
    ),
    [props.children, props.className, props.acceptHtml],
  );
}

export default Markdown;

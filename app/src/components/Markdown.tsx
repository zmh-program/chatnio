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
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openDialog as openQuotaDialog } from "@/store/quota.ts";
import { openDialog as openSubscriptionDialog } from "@/store/subscription.ts";
import { AppDispatch } from "@/store";
import {
  CalendarPlus,
  Check,
  Cloud,
  CloudCog,
  Cloudy,
  Codepen,
  Codesandbox,
  Copy,
  Eye,
  EyeOff,
  Github,
  Maximize,
  Package,
  Plus,
  RefreshCcwDot,
  Twitter,
  Wand2,
  Youtube,
} from "lucide-react";
import { copyClipboard } from "@/utils/dom.ts";
import { useTranslation } from "react-i18next";
import { parseProgressbar } from "@/components/plugins/progress.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { appLogo } from "@/conf/env.ts";
import { subscriptionDataSelector } from "@/store/globals.ts";
import { useMessageActions } from "@/store/chat.ts";
import { useTemporaryState } from "@/utils/hook.ts";
import Icon from "@/components/utils/Icon.tsx";
import { DialogClose } from "@radix-ui/react-dialog";

type MarkdownProps = {
  children: string;
  className?: string;
  acceptHtml?: boolean;
  codeStyle?: string;
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

function getVirtualIcon(command: string) {
  switch (command) {
    case "/VARIATION":
      return <Wand2 className="h-4 w-4 inline-block mr-2" />;
    case "/UPSCALE":
      return <Maximize className="h-4 w-4 inline-block mr-2" />;
    case "/REROLL":
      return <RefreshCcwDot className="h-4 w-4 inline-block mr-2" />;
  }
}

const commandI18nPrompt: Record<string, string> = {
  "/VARIATION": "chat.actions.variant",
  "/UPSCALE": "chat.actions.upscale",
  "/REROLL": "chat.actions.reroll",
};

function getI18nPrompt(command: string) {
  const { t } = useTranslation();

  const prompt = commandI18nPrompt[command];
  return prompt && t(prompt);
}

type VirtualPromptProps = {
  message: string;
  prefix: string;
  children: React.ReactNode;
};

function VirtualPrompt({ message, prefix, children }: VirtualPromptProps) {
  const [raw, setRaw] = useState<boolean>(false);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRaw(!raw);
  };

  const Comp = () => (
    <>
      {getVirtualIcon(prefix)}
      {children} {getI18nPrompt(prefix)}
    </>
  );

  return (
    <div
      className={`virtual-prompt flex flex-row items-center justify-center select-none`}
    >
      {raw ? message : <Comp />}

      {!raw ? (
        <Eye className={`h-4 w-4 ml-2 cursor-pointer`} onClick={toggle} />
      ) : (
        <EyeOff className={`h-4 w-4 ml-2 cursor-pointer`} onClick={toggle} />
      )}
    </div>
  );
}

function MarkdownContent({
  children,
  className,
  acceptHtml,
  codeStyle,
}: MarkdownProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { send: sendAction } = useMessageActions();

  const { state, triggerState } = useTemporaryState();
  const subscription = useSelector(subscriptionDataSelector);

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
      skipHtml={acceptHtml}
      components={{
        p({ children }) {
          // if the format is `user quota is not enough error (model: gpt-3.5-turbo-1106, minimum quota: 0.01, your quota: -77.77)`, return special component
          const match = (children ?? "")
            .toString()
            .match(
              /user quota is not enough error \(model: (.*), minimum quota: (.*), your quota: (.*)\)/,
            );
          if (match) {
            const [, model, minimum, quota] = match;
            const plan = subscription
              .flatMap((p) => p.items.map((i) => i.models.includes(model)))
              .includes(true);

            return (
              <div
                className={`flex flex-col items-center w-[40vw] max-w-[320px] py-2`}
              >
                <img
                  src={appLogo}
                  alt={""}
                  className={`w-16 h-16 m-6 inline-block`}
                />
                <div
                  className={`prompt-row flex flex-row w-full items-center justify-center px-4 py-2`}
                >
                  <Package className={`h-4 w-4 mr-1`} />
                  {t("model")}
                  <div className={`grow`} />
                  <p className={`value`}>{model}</p>
                </div>
                <div
                  className={`prompt-row flex flex-row w-full items-center justify-center px-4 py-2`}
                >
                  <Cloudy className={`h-4 w-4 mr-1`} />
                  {t("your-quota")}
                  <div className={`grow`} />
                  <p className={`value`}>
                    {quota}
                    <Cloud className={`h-4 w-4 ml-1`} />
                  </p>
                </div>
                <div
                  className={`prompt-row flex flex-row w-full items-center justify-center px-4 py-2`}
                >
                  <CloudCog className={`h-4 w-4 mr-1`} />
                  {t("min-quota")}
                  <div className={`grow`} />
                  <p className={`value`}>
                    {minimum}
                    <Cloud className={`h-4 w-4 ml-1`} />
                  </p>
                </div>
                <Button
                  className={`mt-4 w-full`}
                  onClick={() => dispatch(openQuotaDialog())}
                >
                  <Plus className={`h-4 w-4 mr-1`} />
                  {t("buy.dialog-title")}
                </Button>
                {plan && (
                  <Button
                    variant={`outline`}
                    className={`mt-2 w-full`}
                    onClick={() => dispatch(openSubscriptionDialog())}
                  >
                    <CalendarPlus className={`h-4 w-4 mr-1`} />
                    {t("sub.dialog-title")}
                  </Button>
                )}
              </div>
            );
          }

          return <p>{children}</p>;
        },
        a({ href, children }) {
          const url: string = href?.toString() || "";

          if (url.startsWith("https://chatnio.virtual")) {
            const message = url.slice(23).replace(/-/g, " ");
            const prefix = message.split(" ")[0];

            return (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant={`outline`}
                    className={`flex flex-row items-center virtual-action mx-1 my-0.5 min-w-[4rem]`}
                  >
                    {getVirtualIcon(prefix)}
                    {children}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("chat.send-message")}</DialogTitle>
                    <DialogDescription className={`pb-2`}>
                      {t("chat.send-message-desc")}
                    </DialogDescription>
                    <VirtualPrompt message={message} prefix={prefix}>
                      {children}
                    </VirtualPrompt>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={`outline`}>{t("cancel")}</Button>
                    </DialogClose>
                    <DialogClose
                      onClick={async () => await sendAction(message)}
                      asChild
                    >
                      <Button variant={`default`}>{t("confirm")}</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          }

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
          const language = match ? match[1].toLowerCase() : "unknown";
          if (language === "file") return parseFile(children.toString());
          if (language === "progress")
            return parseProgressbar(children.toString());

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
                  await copyClipboard(children.toString());
                  triggerState();
                }}
              >
                <Icon
                  icon={state ? <Check /> : <Copy />}
                  className={`h-3 w-3`}
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
                className={cn("code-block", codeStyle)}
              />
            </div>
          );
        },
      }}
    />
  );
}

function Markdown({
  children,
  acceptHtml,
  codeStyle,
  className,
}: MarkdownProps) {
  // memoize the component
  return useMemo(
    () => (
      <MarkdownContent
        children={children}
        acceptHtml={acceptHtml}
        codeStyle={codeStyle}
        className={className}
      />
    ),
    [children, acceptHtml, codeStyle, className],
  );
}

type CodeMarkdownProps = MarkdownProps & {
  filename: string;
};

export function CodeMarkdown({ filename, ...props }: CodeMarkdownProps) {
  const suffix = filename.includes(".") ? filename.split(".").pop() : "";
  const children = useMemo(() => {
    const content = props.children.toString();

    return `\`\`\`${suffix}\n${content}\n\`\`\``;
  }, [props.children]);

  return <Markdown {...props}>{children}</Markdown>;
}

export default Markdown;

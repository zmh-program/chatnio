import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark as style } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkFile from "./plugins/file.tsx";
import "../assets/markdown/all.less";
import {useEffect} from "react";
import {saveAsFile} from "../utils.ts";

type MarkdownProps = {
  children: string;
  className?: string;
};

function Markdown({ children, className }: MarkdownProps) {
  useEffect(() => {
    document.querySelectorAll(".file-instance").forEach((e) => {
      e.addEventListener("click", () => {
        const filename = e.getAttribute("file") as string;
        const data = e.getAttribute("content") as string;
        if (data) {
          saveAsFile(filename, data);
        }
      });
    });
  }, [children]);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm, remarkFile]}
      rehypePlugins={[rehypeKatex]}
      className={`markdown-body ${className}`}
      children={children}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              children={String(children).replace(/\n$/, "")}
              style={style}
              language={match[1]}
              PreTag="div"
              wrapLongLines={true}
              wrapLines={true}
              className={`code-block`}
              lang={match[1]}
            />
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

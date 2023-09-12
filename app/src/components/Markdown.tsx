import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark as style } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "../assets/markdown/all.less";

type MarkdownProps = {
  children: string;
  className?: string;
};

function Markdown({ children, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
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

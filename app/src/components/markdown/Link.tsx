import React from "react";
import { Codepen, Codesandbox, Github, Twitter, Youtube } from "lucide-react";
import { VirtualMessage } from "./VirtualMessage";

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

type LinkProps = {
  href?: string;
  children: React.ReactNode;
};

export default function ({ href, children }: LinkProps) {
  const url: string = href?.toString() || "";

  if (url.startsWith("https://chatnio.virtual")) {
    const message = url.slice(23);
    const prefix = message.split("-")[0];

    return (
      <VirtualMessage message={message} prefix={prefix}>
        {children}
      </VirtualMessage>
    );
  }

  return (
    <a href={url} target={`_blank`} rel={`noopener noreferrer`}>
      {getSocialIcon(url)}
      {children}
    </a>
  );
}

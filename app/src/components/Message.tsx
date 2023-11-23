import { Message } from "@/api/types.ts";
import Markdown from "@/components/Markdown.tsx";
import {
  CircleSlash,
  Cloud,
  CloudFog,
  Copy,
  File,
  Loader2,
  MoreVertical,
  MousePointerSquare,
  Power,
  RotateCcw,
} from "lucide-react";
import { filterMessage } from "@/utils/processor.ts";
import { copyClipboard, saveAsFile, useInputValue } from "@/utils/dom.ts";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Ref, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

type MessageProps = {
  message: Message;
  end?: boolean;
  onEvent?: (event: string) => void;
  ref?: Ref<HTMLElement>;
};

function MessageSegment(props: MessageProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { message } = props;

  return (
    <div className={`message ${message.role}`} ref={ref}>
      <MessageContent {...props} />
      {message.quota && message.quota !== 0 ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`message-quota ${
                  message.plan ? "subscription" : ""
                }`}
              >
                <Cloud className={`h-4 w-4 icon`} />
                <span className={`quota`}>
                  {(message.quota < 0 ? 0 : message.quota).toFixed(2)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className={`icon-tooltip`}>
              <CloudFog className={`h-4 w-4 mr-2`} />
              <p>{t("quota-description")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}

function MessageContent({ message, end, onEvent }: MessageProps) {
  const { t } = useTranslation();

  return (
    <div className={`content-wrapper`}>
      <div className={`message-content`}>
        {message.content.length ? (
          <Markdown children={message.content} />
        ) : message.end === true ? (
          <CircleSlash className={`h-5 w-5 m-1`} />
        ) : (
          <Loader2 className={`h-5 w-5 m-1 animate-spin`} />
        )}
      </div>
      {message.role === "assistant" && (
        <div className={`message-toolbar`}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical className={`h-4 w-4 m-0.5`} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={`end`}>
              {end && (
                <DropdownMenuItem
                  onClick={() =>
                    onEvent &&
                    onEvent(message.end !== false ? "restart" : "stop")
                  }
                >
                  {message.end !== false ? (
                    <>
                      <RotateCcw className={`h-4 w-4 mr-1.5`} />
                      {t("message.restart")}
                    </>
                  ) : (
                    <>
                      <Power className={`h-4 w-4 mr-1.5`} />
                      {t("message.stop")}
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => copyClipboard(filterMessage(message.content))}
              >
                <Copy className={`h-4 w-4 mr-1.5`} />
                {t("message.copy")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  useInputValue("input", filterMessage(message.content))
                }
              >
                <MousePointerSquare className={`h-4 w-4 mr-1.5`} />
                {t("message.use")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  saveAsFile(
                    `message-${message.role}.txt`,
                    filterMessage(message.content),
                  )
                }
              >
                <File className={`h-4 w-4 mr-1.5`} />
                {t("message.save")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

export default MessageSegment;

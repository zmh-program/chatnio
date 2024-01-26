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
  PencilLine,
  Power,
  RotateCcw,
  Trash,
} from "lucide-react";
import { filterMessage } from "@/utils/processor.ts";
import { copyClipboard, saveAsFile, useInputValue } from "@/utils/dom.ts";
import { useTranslation } from "react-i18next";
import { Ref, useMemo, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import Tips from "@/components/Tips.tsx";

type MessageProps = {
  index: number;
  message: Message;
  end?: boolean;
  onEvent?: (event: string, index?: number, message?: string) => void;
  ref?: Ref<HTMLElement>;
};

function MessageSegment(props: MessageProps) {
  const ref = useRef(null);
  const { message } = props;

  return (
    <div className={`message ${message.role}`} ref={ref}>
      <MessageContent {...props} />
      <MessageQuota message={message} />
    </div>
  );
}

type MessageQuotaProps = {
  message: Message;
};

function MessageQuota({ message }: MessageQuotaProps) {
  const trigger = useMemo(
    () =>
      message.quota && (
        <div className={cn("message-quota", message.plan && "subscription")}>
          <Cloud className={`h-4 w-4 icon`} />
          <span className={`quota`}>
            {(message.quota < 0 ? 0 : message.quota).toFixed(2)}
          </span>
        </div>
      ),
    [message],
  );

  return (
    message.quota &&
    message.quota !== 0 && (
      <Tips classNamePopup={`icon-tooltip justify-center`} trigger={trigger}>
        <CloudFog className={`h-4 w-4 mr-2`} />
        <p>{message.quota.toFixed(6)}</p>
      </Tips>
    )
  );
}

function MessageContent({ message, end, index, onEvent }: MessageProps) {
  const { t } = useTranslation();
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "content-wrapper",
        isAssistant ? "flex-row" : "flex-row-reverse",
      )}
    >
      <div className={`message-content`}>
        {message.content.length ? (
          <Markdown children={message.content} />
        ) : message.end === true ? (
          <CircleSlash className={`h-5 w-5 m-1`} />
        ) : (
          <Loader2 className={`h-5 w-5 m-1 animate-spin`} />
        )}
      </div>
      <div className={`message-toolbar`}>
        <DropdownMenu>
          <DropdownMenuTrigger className={`outline-none`}>
            <MoreVertical className={`h-4 w-4 m-0.5`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align={`end`}>
            {isAssistant && end && (
              <DropdownMenuItem
                onClick={() =>
                  onEvent && onEvent(message.end !== false ? "restart" : "stop")
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
            <DropdownMenuItem>
              <PencilLine className={`h-4 w-4 mr-1.5`} />
              {t("message.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash className={`h-4 w-4 mr-1.5`} />
              {t("message.remove")}
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
    </div>
  );
}

export default MessageSegment;

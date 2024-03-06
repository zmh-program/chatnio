import { getRoleIcon, Message } from "@/api/types.tsx";
import Markdown from "@/components/Markdown.tsx";
import {
  CalendarCheck2,
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
import { Ref, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import Tips from "@/components/Tips.tsx";
import EditorProvider from "@/components/EditorProvider.tsx";
import Avatar from "@/components/Avatar.tsx";
import { useSelector } from "react-redux";
import { selectUsername } from "@/store/auth.ts";
import { appLogo } from "@/conf/env.ts";
import Icon from "@/components/utils/Icon.tsx";
import { useMobile } from "@/utils/device.ts";

type MessageProps = {
  index: number;
  message: Message;
  end?: boolean;
  onEvent?: (event: string, index?: number, message?: string) => void;
  ref?: Ref<HTMLElement>;
  sharing?: boolean;
};

function MessageSegment(props: MessageProps) {
  const ref = useRef(null);
  const mobile = useMobile();
  const { message } = props;

  return (
    <div className={`message ${message.role}`} ref={ref}>
      <MessageContent {...props} />
      {!mobile && <MessageQuota message={message} />}
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
      <Tips
        classNamePopup={cn(
          "icon-tooltip justify-center",
          message.plan && "gold",
        )}
        trigger={trigger}
      >
        {message.plan ? (
          <CalendarCheck2 className={`h-4 w-4 mr-2`} />
        ) : (
          <CloudFog className={`h-4 w-4 mr-2`} />
        )}
        <p>{message.quota.toFixed(6)}</p>
      </Tips>
    )
  );
}

function MessageContent({ message, end, index, onEvent }: MessageProps) {
  const { t } = useTranslation();
  const mobile = useMobile();
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";

  const username = useSelector(selectUsername);
  const icon = getRoleIcon(message.role);

  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [editedMessage, setEditedMessage] = useState<string | undefined>("");

  return (
    <div className={"content-wrapper"}>
      <EditorProvider
        submittable={true}
        onSubmit={(value) => onEvent && onEvent("edit", index, value)}
        open={open}
        setOpen={setOpen}
        value={editedMessage ?? ""}
        onChange={setEditedMessage}
      />
      <div className={`message-avatar-wrapper`}>
        <Tips
          classNamePopup={`flex flex-row items-center`}
          trigger={
            isUser ? (
              <Avatar className={`message-avatar`} username={username} />
            ) : (
              <img src={appLogo} alt={``} className={`message-avatar`} />
            )
          }
        >
          <Icon icon={icon} className={`h-4 w-4 mr-1`} />
          {message.role}
        </Tips>
      </div>
      <div className={`message-content`}>
        {message.content.length ? (
          <Markdown children={message.content} />
        ) : message.end === true ? (
          <CircleSlash className={`h-5 w-5 m-1`} />
        ) : (
          <Loader2 className={`h-5 w-5 m-1 animate-spin`} />
        )}
      </div>
      <div className={cn(`message-toolbar`, mobile && "w-full")}>
        <DropdownMenu open={dropdown} onOpenChange={setDropdown}>
          <DropdownMenuTrigger
            className={cn(`flex flex-row outline-none`, mobile && "my-1.5")}
          >
            {mobile && <MessageQuota message={message} />}
            {!mobile ? (
              <MoreVertical className={`h-4 w-4 m-0.5`} />
            ) : (
              <PencilLine className={cn(`h-6 w-6 p-1`, "ml-auto")} />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align={`end`}>
            {isAssistant && end && (
              <DropdownMenuItem
                onClick={() => {
                  onEvent &&
                    onEvent(message.end !== false ? "restart" : "stop");
                  setDropdown(false);
                }}
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
              onClick={() => {
                editedMessage?.length === 0 &&
                  setEditedMessage(message.content);
                setOpen(true);
              }}
            >
              <PencilLine className={`h-4 w-4 mr-1.5`} />
              {t("message.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEvent && onEvent("remove", index)}
            >
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

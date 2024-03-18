import { Message, UserRole } from "@/api/types.tsx";
import Markdown from "@/components/Markdown.tsx";
import {
  CalendarCheck2,
  CircleSlash,
  Cloud,
  CloudCog,
  Copy,
  File,
  Loader2,
  MousePointerSquare,
  PencilLine,
  Power,
  RotateCcw,
  Trash,
} from "lucide-react";
import { filterMessage } from "@/utils/processor.ts";
import {
  copyClipboard,
  isContainDom,
  saveAsFile,
  useInputValue,
} from "@/utils/dom.ts";
import { useTranslation } from "react-i18next";
import React, { Ref, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import EditorProvider from "@/components/EditorProvider.tsx";
import Avatar from "@/components/Avatar.tsx";
import { useSelector } from "react-redux";
import { selectUsername } from "@/store/auth.ts";
import { appLogo } from "@/conf/env.ts";

type MessageProps = {
  index: number;
  message: Message;
  end?: boolean;
  username?: string;
  onEvent?: (event: string, index?: number, message?: string) => void;
  ref?: Ref<HTMLElement>;
  sharing?: boolean;

  selected?: boolean;
  onFocus?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onFocusLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

function MessageSegment(props: MessageProps) {
  const ref = useRef(null);
  const { message } = props;

  return (
    <div
      className={`message ${message.role}`}
      ref={ref}
      onClick={props.onFocus}
      onMouseEnter={props.onFocus}
      onMouseLeave={(event) => {
        try {
          if (isContainDom(ref.current, event.relatedTarget as HTMLElement))
            return;
          props.onFocusLeave && props.onFocusLeave(event);
        } catch (e) {
          console.debug(`[message] cannot leave focus: ${e}`);
        }
      }}
    >
      <MessageContent {...props} />
      <MessageQuota message={message} />
    </div>
  );
}

type MessageQuotaProps = {
  message: Message;
};

function MessageQuota({ message }: MessageQuotaProps) {
  const [detail, setDetail] = useState(false);

  if (message.role === UserRole) return null;

  return (
    message.quota &&
    message.quota !== 0 && (
      <div
        className={cn("message-quota", message.plan && "subscription")}
        onClick={() => setDetail(!detail)}
      >
        {message.plan ? (
          <CalendarCheck2 className={`h-4 w-4 icon`} />
        ) : detail ? (
          <CloudCog className={`h-4 w-4 icon`} />
        ) : (
          <Cloud className={`h-4 w-4 icon`} />
        )}
        <span className={`quota`}>
          {(message.quota < 0 ? 0 : message.quota).toFixed(detail ? 6 : 2)}
        </span>
      </div>
    )
  );
}

type MessageMenuProps = {
  children?: React.ReactNode;
  message: Message;
  end?: boolean;
  index: number;
  onEvent?: (event: string, index?: number, message?: string) => void;
  editedMessage?: string;
  setEditedMessage: (message: string) => void;
  setOpen: (open: boolean) => void;
  align?: "start" | "end";
};

function MessageMenu({
  children,
  align,
  message,
  end,
  index,
  onEvent,
  editedMessage,
  setEditedMessage,
  setOpen,
}: MessageMenuProps) {
  const { t } = useTranslation();
  const isAssistant = message.role === "assistant";

  const [dropdown, setDropdown] = useState(false);

  return (
    <DropdownMenu open={dropdown} onOpenChange={setDropdown}>
      <DropdownMenuTrigger className={cn(`flex flex-row outline-none`)}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {isAssistant && end ? (
          <DropdownMenuItem
            onClick={() => {
              onEvent && onEvent(message.end !== false ? "restart" : "stop");
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
        ) : (
          message.end !== false && (
            <DropdownMenuItem
              onClick={() => {
                onEvent && onEvent("restart");
                setDropdown(false);
              }}
            >
              <RotateCcw className={`h-4 w-4 mr-1.5`} />
              {t("message.restart")}
            </DropdownMenuItem>
          )
        )}
        <DropdownMenuItem
          onClick={() => copyClipboard(filterMessage(message.content))}
        >
          <Copy className={`h-4 w-4 mr-1.5`} />
          {t("message.copy")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => useInputValue("input", filterMessage(message.content))}
        >
          <MousePointerSquare className={`h-4 w-4 mr-1.5`} />
          {t("message.use")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editedMessage?.length === 0 && setEditedMessage(message.content);
            setOpen(true);
          }}
        >
          <PencilLine className={`h-4 w-4 mr-1.5`} />
          {t("message.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEvent && onEvent("remove", index)}>
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
  );
}

function MessageContent({
  message,
  end,
  index,
  onEvent,
  selected,
  username,
}: MessageProps) {
  const isUser = message.role === "user";

  const user = useSelector(selectUsername);

  const [open, setOpen] = useState(false);
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
        {!selected ? (
          isUser ? (
            <Avatar
              className={`message-avatar animate-fade-in`}
              username={username ?? user}
            />
          ) : (
            <img
              src={appLogo}
              alt={``}
              className={`message-avatar animate-fade-in`}
            />
          )
        ) : (
          <MessageMenu
            message={message}
            end={end}
            index={index}
            onEvent={onEvent}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
            setOpen={setOpen}
            align={isUser ? "end" : "start"}
          >
            <div
              className={`message-avatar flex flex-row items-center justify-center cursor-pointer select-none opacity-0 animate-fade-in`}
            >
              <PencilLine className={`h-4 w-4`} />
            </div>
          </MessageMenu>
        )}
      </div>
      <div className={`message-content`}>
        {message.content.length ? (
          <Markdown
            loading={message.end === false}
            children={message.content}
            acceptHtml={false}
          />
        ) : message.end === true ? (
          <CircleSlash className={`h-5 w-5 m-1`} />
        ) : (
          <Loader2 className={`h-5 w-5 m-1 animate-spin`} />
        )}
      </div>
    </div>
  );
}

export default MessageSegment;

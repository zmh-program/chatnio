import React from "react";
import { setMemory } from "@/utils/memory.ts";
import { useTranslation } from "react-i18next";
import { FlexibleTextarea } from "@/components/ui/textarea.tsx";
import { useSelector } from "react-redux";
import { senderSelector } from "@/store/settings.ts";
import { blobEvent } from "@/events/blob.ts";
import { cn } from "@/components/ui/lib/utils.ts";
import { isEnter, withCtrl, withShift } from "@/utils/base.ts";

type ChatInputProps = {
  className?: string;
  target?: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onValueChange: (value: string) => void;
  onEnterPressed: () => void;
};

function ChatInput({
  className,
  target,
  value,
  onValueChange,
  onEnterPressed,
}: ChatInputProps) {
  const { t } = useTranslation();
  const sender = useSelector(senderSelector);

  // sender: Ctrl + Enter if false, Enter if true

  return (
    <FlexibleTextarea
      id={`input`}
      className={cn("input-box no-scrollbar", className)}
      ref={target}
      value={value}
      rows={3}
      maxRows={10}
      onChange={(e) => {
        onValueChange(e.target.value);
        setMemory("history", e.target.value);
      }}
      placeholder={sender ? t("chat.placeholder-enter") : t("chat.placeholder")}
      onKeyDown={async (e) => {
        if (isEnter(e)) {
          if (sender) {
            // on Enter, clear the input
            // on Ctrl + Enter or Shift + Enter, keep the input

            if (!withCtrl(e) && !withShift(e)) {
              e.preventDefault();
              onEnterPressed();
            } else {
              // add Enter to the input
              e.preventDefault();

              if (!target || !target.current) return;
              const input = target.current as HTMLTextAreaElement;
              const value = input.value;
              const selectionStart = input.selectionStart;
              const selectionEnd = input.selectionEnd;
              input.value =
                value.slice(0, selectionStart) +
                "\n" +
                value.slice(selectionEnd);
              input.selectionStart = input.selectionEnd = selectionStart + 1;
              onValueChange(input.value);
            }
          } else {
            // on Enter, keep the input & on Ctrl + Enter, send the input
            if (withCtrl(e)) {
              e.preventDefault();
              onEnterPressed();
            }
          }
        }
      }}
      // on transfer file
      onPaste={(e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === "file") {
            const file = item.getAsFile();
            file && blobEvent.emit(file);
          }
        }
      }}
    />
  );
}

export default ChatInput;

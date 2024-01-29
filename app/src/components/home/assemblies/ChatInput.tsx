import React from "react";
import { setMemory } from "@/utils/memory.ts";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useSelector } from "react-redux";
import { senderSelector } from "@/store/settings.ts";
import { blobEvent } from "@/events/blob.ts";

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
    <Textarea
      id={`input`}
      className={`input-box ${className || ""}`}
      ref={target}
      value={value}
      rows={3}
      onChange={(e) => {
        onValueChange(e.target.value);
        setMemory("history", e.target.value);
      }}
      placeholder={sender ? t("chat.placeholder-enter") : t("chat.placeholder")}
      onKeyDown={async (e) => {
        if (e.key === "Enter") {
          if (sender || e.ctrlKey) {
            // condition sender: Ctrl + Enter if false, Enter if true
            // condition e.ctrlKey: Ctrl + Enter if true, Enter if false

            e.preventDefault();
            onEnterPressed();
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

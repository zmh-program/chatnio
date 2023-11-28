import React from "react";
import { setMemory } from "@/utils/memory.ts";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useSelector } from "react-redux";
import { senderSelector } from "@/store/settings.ts";

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
  const [pressed, setPressed] = React.useState(false);
  const sender = useSelector(senderSelector);

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
      placeholder={t("chat.placeholder")}
      onKeyDown={async (e) => {
        if (e.key === "Control") {
          setPressed(true);
        } else if (e.key === "Enter" && !e.shiftKey) {
          if (sender || pressed) {
            e.preventDefault();
            onEnterPressed();
          }
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Control") {
          setTimeout(() => setPressed(false), 250);
        }
      }}
    />
  );
}

export default ChatInput;

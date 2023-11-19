import React from "react";
import { setMemory } from "@/utils/memory.ts";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea.tsx";

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
  const [stamp, setStamp] = React.useState(0);

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
          setStamp(Date.now());
        } else if (e.key === "Enter" && !e.shiftKey) {
          if (stamp > 0 && Date.now() - stamp < 200) {
            e.preventDefault();
            onEnterPressed();
          }
        }
      }}
    />
  );
}

export default ChatInput;

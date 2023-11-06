import { Input } from "@/components/ui/input.tsx";
import React from "react";
import { setMemory } from "@/utils/memory.ts";
import { useTranslation } from "react-i18next";

type ChatInputProps = {
  className?: string;
  target?: React.RefObject<HTMLInputElement>;
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

  return (
    <Input
      id={`input`}
      className={`input-box ${className || ""}`}
      ref={target}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange(e.target.value);
        setMemory("history", e.target.value);
      }}
      placeholder={t("chat.placeholder")}
      onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onEnterPressed();
      }}
    />
  );
}

export default ChatInput;

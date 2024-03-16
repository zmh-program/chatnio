import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useConversationActions,
  useMessageActions,
  useWorking,
} from "@/store/chat.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  Eye,
  EyeOff,
  Loader2,
  Maximize,
  RefreshCcwDot,
  Wand2,
} from "lucide-react";

function getVirtualIcon(command: string) {
  switch (command) {
    case "/VARIATION":
      return <Wand2 className="h-4 w-4 inline-block mr-2" />;
    case "/UPSCALE":
      return <Maximize className="h-4 w-4 inline-block mr-2" />;
    case "/REROLL":
      return <RefreshCcwDot className="h-4 w-4 inline-block mr-2" />;
  }
}

const commandI18nPrompt: Record<string, string> = {
  "/VARIATION": "chat.actions.variant",
  "/UPSCALE": "chat.actions.upscale",
  "/REROLL": "chat.actions.reroll",
};

function getI18nPrompt(command: string) {
  const { t } = useTranslation();

  const prompt = commandI18nPrompt[command];
  return prompt && t(prompt);
}

type VirtualPromptProps = {
  message: string;
  prefix: string;
  children: React.ReactNode;
};

function VirtualPrompt({ message, prefix, children }: VirtualPromptProps) {
  const [raw, setRaw] = useState<boolean>(false);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRaw(!raw);
  };

  const Comp = () => (
    <>
      {getVirtualIcon(prefix)}
      {children} {getI18nPrompt(prefix)}
    </>
  );

  return (
    <div
      className={`virtual-prompt flex flex-row items-center justify-center select-none`}
    >
      {raw ? message : <Comp />}

      {!raw ? (
        <Eye className={`h-4 w-4 ml-2 cursor-pointer`} onClick={toggle} />
      ) : (
        <EyeOff className={`h-4 w-4 ml-2 cursor-pointer`} onClick={toggle} />
      )}
    </div>
  );
}

type VirtualMessageProps = {
  message: string;
  prefix: string;
  children: React.ReactNode;
};

function parseMessage(message: string): { prompt: string; model: string } {
  const [prompt, ...rest] = message.split("::");
  const model = rest.join(" ");
  return { prompt: prompt.replace(/-/g, " "), model };
}

export function VirtualMessage({
  message,
  prefix,
  children,
}: VirtualMessageProps) {
  const { t } = useTranslation();
  const { selected } = useConversationActions();
  const { send: sendAction } = useMessageActions();
  const working = useWorking();

  const { prompt, model } = parseMessage(message);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={`outline`}
          className={`flex flex-row items-center virtual-action mx-1 my-0.5 min-w-[4rem]`}
        >
          {getVirtualIcon(prefix)}
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("chat.send-message")}</DialogTitle>
          <DialogDescription className={`pb-2`}>
            {t("chat.send-message-desc")}
          </DialogDescription>
          <VirtualPrompt message={prompt} prefix={prefix}>
            {children}
          </VirtualPrompt>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={`outline`}>{t("cancel")}</Button>
          </DialogClose>
          <DialogClose
            disabled={working}
            onClick={async () => {
              selected(model);
              await sendAction(prompt, model);
            }}
            asChild
          >
            <Button variant={`default`}>
              {working && <Loader2 className={`h-4 w-4 mr-1.5 animate-spin`} />}
              {t("confirm")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

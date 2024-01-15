import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog.tsx";
import { Maximize, Image, MenuSquare, PanelRight, XSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/assets/common/editor.less";
import { Textarea } from "./ui/textarea.tsx";
import Markdown from "./Markdown.tsx";
import { useEffect, useRef, useState } from "react";
import { Toggle } from "./ui/toggle.tsx";
import { mobile } from "@/utils/device.ts";
import { Button } from "./ui/button.tsx";
import { ChatAction } from "@/components/home/assemblies/ChatAction.tsx";
import { cn } from "@/components/ui/lib/utils.ts";

type RichEditorProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

function RichEditor({ value, onChange, maxLength }: RichEditorProps) {
  const { t } = useTranslation();
  const input = useRef(null);
  const [openPreview, setOpenPreview] = useState(!mobile);
  const [openInput, setOpenInput] = useState(true);

  const handler = () => {
    if (!input.current) return;
    const target = input.current as HTMLElement;
    const preview = target.parentElement?.querySelector(
      ".editor-preview",
    ) as HTMLElement | null;
    if (!preview) {
      setTimeout(handler, 100);
      return;
    }

    const listener = () => {
      preview.style.height = `${target.clientHeight}px`;
    };
    target.addEventListener("transitionstart", listener);
    setInterval(listener, 250);
    target.addEventListener("scroll", () => {
      preview.scrollTop = target.scrollTop;
    });

    preview.style.height = `${target.clientHeight}px`;

    if (openInput) target.focus();
  };
  useEffect(handler, [input]);

  return (
    <div className={`editor-container`}>
      <div className={`editor-toolbar`}>
        <Button
          variant={`outline`}
          className={`h-8 w-8 p-0`}
          onClick={() => value && onChange("")}
        >
          <XSquare className={`h-3.5 w-3.5`} />
        </Button>
        <div className={`grow`} />
        <Toggle
          variant={`outline`}
          className={`h-8 w-8 p-0`}
          pressed={openInput && !openPreview}
          onClick={() => {
            setOpenPreview(false);
            setOpenInput(true);
          }}
        >
          <MenuSquare className={`h-3.5 w-3.5`} />
        </Toggle>

        <Toggle
          variant={`outline`}
          className={`h-8 w-8 p-0`}
          pressed={openInput && openPreview}
          onClick={() => {
            setOpenPreview(true);
            setOpenInput(true);
          }}
        >
          <PanelRight className={`h-3.5 w-3.5`} />
        </Toggle>

        <Toggle
          variant={`outline`}
          className={`h-8 w-8 p-0`}
          pressed={!openInput && openPreview}
          onClick={() => {
            setOpenPreview(true);
            setOpenInput(false);
          }}
        >
          <Image className={`h-3.5 w-3.5`} />
        </Toggle>
      </div>
      <div className={`editor-wrapper`}>
        <div
          className={cn(
            "editor-object",
            openInput && "show-editor",
            openPreview && "show-preview",
          )}
        >
          {openInput && (
            <Textarea
              placeholder={t("chat.placeholder")}
              value={value}
              className={`editor-input`}
              id={`editor`}
              maxLength={maxLength}
              onChange={(e) => onChange(e.target.value)}
              ref={input}
            />
          )}
          {openPreview && (
            <Markdown className={`editor-preview`} children={value} />
          )}
        </div>
      </div>
    </div>
  );
}

function EditorProvider(props: RichEditorProps) {
  const { t } = useTranslation();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <ChatAction text={t("editor")}>
            <Maximize className={`h-4 w-4`} />
          </ChatAction>
        </DialogTrigger>
        <DialogContent className={`editor-dialog flex-dialog`}>
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
            <DialogDescription asChild>
              <RichEditor {...props} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditorProvider;

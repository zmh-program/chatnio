import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog.tsx";
import { Maximize, Image, MenuSquare, PanelRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../assets/editor.less";
import { Textarea } from "./ui/textarea.tsx";
import Markdown from "./Markdown.tsx";
import { useEffect, useRef, useState } from "react";
import { Toggle } from "./ui/toggle.tsx";
import { mobile } from "../utils.ts";

type RichEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  placeholder?: string;
  maxLength?: number;
};

function RichEditor({
  value,
  onChange,
  id,
  placeholder,
  maxLength,
}: RichEditorProps) {
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
          className={`editor-object ${openInput ? "show-editor" : ""} ${
            openPreview ? "show-preview" : ""
          }`}
        >
          {openInput && (
            <Textarea
              placeholder={placeholder}
              value={value}
              className={`editor-input`}
              id={id}
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
          <div className={`editor-action active ${props.className}`}>
            <Maximize className={`h-3.5 w-3.5`} />
          </div>
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

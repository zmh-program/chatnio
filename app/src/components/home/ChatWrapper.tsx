import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import FileProvider, { FileObject } from "../FileProvider.tsx";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated, selectInit } from "../../store/auth.ts";
import {
  selectMessages,
  selectModel,
  selectWeb,
  setWeb,
} from "../../store/chat.ts";
import { manager } from "../../conversation/manager.ts";
import { formatMessage } from "../../utils.ts";
import ChatInterface from "./ChatInterface.tsx";
import { Button } from "../ui/button.tsx";
import router from "../../router.tsx";
import {
  BookMarked,
  ChevronRight,
  FolderKanban,
  Globe,
  Users2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip.tsx";
import { Toggle } from "../ui/toggle.tsx";
import { Input } from "../ui/input.tsx";
import EditorProvider from "../EditorProvider.tsx";
import ModelSelector from "./ModelSelector.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.tsx";
import { toggleEvent } from "../../events/model.ts";
import {version} from "../../conf.ts";

function ChatSpace() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [prevent, setPrevent] = useState(0);
  toggleEvent.bind(setPrevent);

  const notPrevent = (): boolean => new Date().getTime() - prevent >= 1000;

  return (
    <div className={`chat-product`}>
      <Button variant={`outline`} onClick={() => notPrevent() && setOpen(true)}>
        <Users2 className={`h-4 w-4 mr-1.5`} />
        {t("contact.title")}
        <ChevronRight className={`h-4 w-4 ml-2`} />
      </Button>
      <Button
        variant={`outline`}
        onClick={() => notPrevent() && router.navigate("/generate")}
      >
        <FolderKanban className={`h-4 w-4 mr-1.5`} />
        {t("generate.title")}
        <ChevronRight className={`h-4 w-4 ml-2`} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("contact.title")}</DialogTitle>
            <DialogDescription asChild>
              <div className={`grid pt-4`}>
                <Button
                  className={`mx-auto`}
                  variant={`outline`}
                  onClick={() => window.open("https://docs.chatnio.net", "_blank")}
                >
                  <BookMarked className={`h-4 w-4 mr-1.5`} />
                  {t("docs.title")}
                </Button>
                <a
                  href={
                    "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=1oKfIbNVXmMNMVzW1NiFSTKDcT1qIEq5&authKey=uslxslIBZtLImf4BSxjDqfx4hiJA52YV7PFM38W%2BOArr%2BhE0jwVdQCRYs0%2FXKX7W&noverify=0&group_code=565902327"
                  }
                  target={"_blank"}
                  className={`inline-flex mx-auto mt-1 mb-2`}
                >
                  <img
                    src={`/source/qq.jpg`}
                    className={`contact-image`}
                    alt={`QQ`}
                  />
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChatWrapper() {
  const { t } = useTranslation();
  const [file, setFile] = useState<FileObject>({
    name: "",
    content: "",
  });
  const [clearEvent, setClearEvent] = useState<() => void>(() => {});
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const init = useSelector(selectInit);
  const auth = useSelector(selectAuthenticated);
  const model = useSelector(selectModel);
  const web = useSelector(selectWeb);
  const messages = useSelector(selectMessages);
  const target = useRef(null);
  manager.setDispatch(dispatch);

  function clearFile() {
    clearEvent?.();
  }

  async function processSend(
    data: string,
    auth: boolean,
    model: string,
    web: boolean,
  ): Promise<boolean> {
    const message: string = formatMessage(file, data);
    if (message.length > 0 && data.trim().length > 0) {
      if (await manager.send(t, auth, { message, web, model, type: "chat" })) {
        clearFile();
        return true;
      }
    }
    return false;
  }

  async function handleSend(auth: boolean, model: string, web: boolean) {
    // because of the function wrapper, we need to update the selector state using props.
    if (await processSend(input, auth, model, web)) {
      setInput("");
    }
  }

  window.addEventListener("load", () => {
    const el = document.getElementById("input");
    if (el) el.focus();
  });

  useEffect(() => {
    if (!init) return;
    const search = new URLSearchParams(window.location.search);
    const query = (search.get("q") || "").trim();
    if (query.length > 0) processSend(query, auth, model, web).then();
    window.history.replaceState({}, "", "/");
  }, [init]);

  return (
    <div className={`chat-container`}>
      <div className={`chat-wrapper`}>
        {messages.length > 0 ? <ChatInterface /> : <ChatSpace />}
        <div className={`chat-input`}>
          <div className={`input-wrapper`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    aria-label={t("chat.web-aria")}
                    defaultPressed={false}
                    onPressedChange={(state: boolean) =>
                      dispatch(setWeb(state))
                    }
                    variant={`outline`}
                  >
                    <Globe className={`h-4 w-4 web ${web ? "enable" : ""}`} />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p className={`tooltip`}>{t("chat.web")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className={`chat-box`}>
              {auth && (
                <FileProvider
                  id={`file`}
                  className={`file`}
                  onChange={setFile}
                  maxLength={4000 * 1.25}
                  setClearEvent={setClearEvent}
                />
              )}
              <Input
                id={`input`}
                className={`input-box`}
                ref={target}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInput(e.target.value)
                }
                placeholder={t("chat.placeholder")}
                onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") await handleSend(auth, model, web);
                }}
              />
              <EditorProvider
                value={input}
                onChange={setInput}
                className={`editor`}
                id={`editor`}
                placeholder={t("chat.placeholder")}
                maxLength={8000}
              />
            </div>
            <Button
              size={`icon`}
              variant="outline"
              className={`send-button`}
              onClick={() => handleSend(auth, model, web)}
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="m21.426 11.095-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"></path>
              </svg>
            </Button>
          </div>
          <div className={`input-options`}>
            <ModelSelector />
          </div>
          <div className={`version`}>
            chatnio v{version}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWrapper;

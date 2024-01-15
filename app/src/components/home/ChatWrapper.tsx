import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import FileAction from "@/components/FileProvider.tsx";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated, selectInit } from "@/store/auth.ts";
import {
  selectCurrent,
  selectMessages,
  selectModel,
  selectWeb,
} from "@/store/chat.ts";
import { manager } from "@/api/manager.ts";
import { formatMessage } from "@/utils/processor.ts";
import ChatInterface from "@/components/home/ChatInterface.tsx";
import EditorAction from "@/components/EditorProvider.tsx";
import ModelFinder from "./ModelFinder.tsx";
import { clearHistoryState, getQueryParam } from "@/utils/path.ts";
import { forgetMemory, popMemory } from "@/utils/memory.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { ToastAction } from "@/components/ui/toast.tsx";
import {
  alignSelector,
  contextSelector,
  historySelector,
} from "@/store/settings.ts";
import { FileArray } from "@/api/file.ts";
import {
  MarketAction,
  MaskAction,
  SettingsAction,
  WebAction,
} from "@/components/home/assemblies/ChatAction.tsx";
import ChatSpace from "@/components/home/ChatSpace.tsx";
import ActionButton from "@/components/home/assemblies/ActionButton.tsx";
import ChatInput from "@/components/home/assemblies/ChatInput.tsx";
import ScrollAction from "@/components/home/assemblies/ScrollAction.tsx";
import { connectionEvent } from "@/events/connection.ts";
import { chatEvent } from "@/events/chat.ts";
import { cn } from "@/components/ui/lib/utils.ts";

type InterfaceProps = {
  setWorking: (working: boolean) => void;
  setTarget: (instance: HTMLElement | null) => void;
};

function Interface(props: InterfaceProps) {
  const messages = useSelector(selectMessages);

  return messages.length > 0 ? <ChatInterface {...props} /> : <ChatSpace />;
}

function ChatWrapper() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileArray>([]);
  const [input, setInput] = useState("");
  const [working, setWorking] = useState(false);
  const [visible, setVisibility] = useState(false);
  const dispatch = useDispatch();
  const init = useSelector(selectInit);
  const current = useSelector(selectCurrent);
  const auth = useSelector(selectAuthenticated);
  const model = useSelector(selectModel);
  const web = useSelector(selectWeb);
  const history = useSelector(historySelector);
  const target = useRef(null);
  const context = useSelector(contextSelector);
  const align = useSelector(alignSelector);

  const [instance, setInstance] = useState<HTMLElement | null>(null);

  manager.setDispatch(dispatch);
  chatEvent.addEventListener(() => setWorking(false));

  function clearFile() {
    setFiles([]);
  }

  async function processSend(data: string): Promise<boolean> {
    const message: string = formatMessage(files, data);
    if (message.length > 0 && data.trim().length > 0) {
      if (
        await manager.send(t, auth, {
          type: "chat",
          message,
          web,
          model,
          context: history,
          ignore_context: !context,
        })
      ) {
        forgetMemory("history");
        clearFile();
        return true;
      }
    }
    return false;
  }

  async function handleSend() {
    // because of the function wrapper, we need to update the selector state using props.
    if (await processSend(input)) {
      setInput("");
    }
  }

  async function handleCancel() {
    connectionEvent.emit({
      id: current,
      event: "stop",
    });
  }

  useEffect(() => {
    window.addEventListener("load", () => {
      const el = document.getElementById("input");
      if (el) el.focus();
    });
  }, []);

  useEffect(() => {
    if (!init) return;
    const query = getQueryParam("q").trim();
    if (query.length > 0) processSend(query).then();
    clearHistoryState();
  }, [init]);

  useEffect(() => {
    const history: string = popMemory("history");
    if (history.length) {
      setInput(history);
      toast({
        title: t("chat.recall"),
        description: t("chat.recall-desc"),
        action: (
          <ToastAction
            altText={t("chat.recall-cancel")}
            onClick={() => {
              setInput("");
            }}
          >
            {t("chat.recall-cancel")}
          </ToastAction>
        ),
      });
    }
  }, []);

  return (
    <div className={`chat-container`}>
      <div className={`chat-wrapper`}>
        <Interface setTarget={setInstance} setWorking={setWorking} />
        <div className={`chat-input`}>
          <div className={`input-action`}>
            <ScrollAction
              visible={visible}
              setVisibility={setVisibility}
              target={instance}
            />
            <WebAction visible={!visible} />
            <FileAction value={files} onChange={setFiles} />
            <EditorAction value={input} onChange={setInput} />
            <MaskAction />
            <MarketAction />
            <SettingsAction />
          </div>
          <div className={`input-wrapper`}>
            <div className={`chat-box`}>
              <ChatInput
                className={cn(align && "align")}
                target={target}
                value={input}
                onValueChange={setInput}
                onEnterPressed={handleSend}
              />
            </div>
            <ActionButton
              working={working}
              onClick={() => (working ? handleCancel() : handleSend())}
            />
          </div>
          <div className={`input-options`}>
            <ModelFinder side={`bottom`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWrapper;

import "../assets/home.less";
import "../assets/chat.less";
import { Input } from "../components/ui/input.tsx";
import { Toggle } from "../components/ui/toggle.tsx";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  FolderKanban,
  Globe,
  LogIn,
  Plus,
  RotateCw,
} from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip.tsx";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { selectAuthenticated, selectInit } from "../store/auth.ts";
import { login, supportModels } from "../conf.ts";
import {
  deleteConversation,
  toggleConversation,
  updateConversationList,
} from "../conversation/history.ts";
import { shareConversation } from "../conversation/sharing.ts";
import React, { useEffect, useRef, useState } from "react";
import {
  filterMessage,
  extractMessage,
  formatMessage,
  mobile,
  useAnimation,
  useEffectAsync,
  copyClipboard,
} from "../utils.ts";
import { toast, useToast } from "../components/ui/use-toast.ts";
import { ConversationInstance, Message } from "../conversation/types.ts";
import {
  selectCurrent,
  selectModel,
  selectHistory,
  selectMessages,
  selectWeb,
  setModel,
  setWeb,
} from "../store/chat.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog.tsx";
import { manager } from "../conversation/manager.ts";
import { useTranslation } from "react-i18next";
import MessageSegment from "../components/Message.tsx";
import { setMenu } from "../store/menu.ts";
import FileProvider, { FileObject } from "../components/FileProvider.tsx";
import router from "../router.ts";
import SelectGroup from "../components/SelectGroup.tsx";
import EditorProvider from "../components/EditorProvider.tsx";
import ConversationSegment from "../components/home/ConversationSegment.tsx";
import {connectionEvent} from "../events/connection.ts";

function SideBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.menu.open);
  const auth = useSelector(selectAuthenticated);
  const current = useSelector(selectCurrent);
  const [operateConversation, setOperateConversation] = useState<{
    target: ConversationInstance | null;
    type: string;
  }>({ target: null, type: "" });
  const { toast } = useToast();
  const history: ConversationInstance[] = useSelector(selectHistory);
  const refresh = useRef(null);
  const [shared, setShared] = useState<string>("");
  useEffectAsync(async () => {
    await updateConversationList(dispatch);
  }, []);

  // @ts-ignore
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      {auth ? (
        <div className={`sidebar-content`}>
          <div className={`sidebar-action`}>
            <Button
              variant={`ghost`}
              size={`icon`}
              onClick={async () => {
                await toggleConversation(dispatch, -1);
                if (mobile) dispatch(setMenu(false));
              }}
            >
              <Plus className={`h-4 w-4`} />
            </Button>
            <div className={`grow`} />
            <Button
              className={`refresh-action`}
              variant={`ghost`}
              size={`icon`}
              id={`refresh`}
              ref={refresh}
              onClick={() => {
                const hook = useAnimation(refresh, "active", 500);
                updateConversationList(dispatch)
                  .catch(() =>
                    toast({
                      title: t("conversation.refresh-failed"),
                      description: t("conversation.refresh-failed-prompt"),
                    }),
                  )
                  .finally(hook);
              }}
            >
              <RotateCw className={`h-4 w-4`} />
            </Button>
          </div>
          <div className={`conversation-list`}>
            {history.length ? (
              history.map((conversation, i) => (
                <ConversationSegment
                  operate={setOperateConversation}
                  conversation={conversation}
                  current={current}
                  key={i}
                />
              ))
            ) : (
              <div className={`empty`}>{t("conversation.empty")}</div>
            )}
          </div>
          <AlertDialog
            open={
              operateConversation.type === "delete" &&
              !!operateConversation.target
            }
            onOpenChange={(open) => {
              if (!open) setOperateConversation({ target: null, type: "" });
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("conversation.remove-title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("conversation.remove-description")}
                  <strong className={`conversation-name`}>
                    {extractMessage(
                      filterMessage(operateConversation?.target?.name || ""),
                    )}
                  </strong>
                  {t("end")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("conversation.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (
                      await deleteConversation(
                        dispatch,
                        operateConversation?.target?.id || -1,
                      )
                    )
                      toast({
                        title: t("conversation.delete-success"),
                        description: t("conversation.delete-success-prompt"),
                      });
                    else
                      toast({
                        title: t("conversation.delete-failed"),
                        description: t("conversation.delete-failed-prompt"),
                      });
                    setOperateConversation({ target: null, type: "" });
                  }}
                >
                  {t("conversation.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={
              operateConversation.type === "share" &&
              !!operateConversation.target
            }
            onOpenChange={(open) => {
              if (!open) setOperateConversation({ target: null, type: "" });
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("share.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("share.description")}
                  <strong className={`conversation-name`}>
                    {extractMessage(
                      filterMessage(operateConversation?.target?.name || ""),
                    )}
                  </strong>
                  {t("end")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("conversation.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const resp = await shareConversation(
                      operateConversation?.target?.id || -1,
                    );
                    if (resp.status)
                      setShared(`${location.origin}/share/${resp.data}`);
                    else
                      toast({
                        title: t("share.failed"),
                        description: resp.message,
                      });

                    setOperateConversation({ target: null, type: "" });
                  }}
                >
                  {t("share.title")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={shared.length > 0}
            onOpenChange={(open) => {
              if (!open) {
                setShared("");
                setOperateConversation({ target: null, type: "" });
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("share.success")}</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className={`share-wrapper mt-4 mb-2`}>
                    <Input value={shared} />
                    <Button
                      variant={`default`}
                      size={`icon`}
                      onClick={async () => {
                        await copyClipboard(shared);
                        toast({
                          title: t("share.copied"),
                          description: t("share.copied-description"),
                        });
                      }}
                    >
                      <Copy className={`h-4 w-4`} />
                    </Button>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("close")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(shared, "_blank");
                  }}
                >
                  {t("share.view")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <Button className={`login-action`} variant={`default`} onClick={login}>
          <LogIn className={`h-3 w-3 mr-2`} /> {t("login")}
        </Button>
      )}
    </div>
  );
}

function ChatInterface() {
  const ref = useRef(null);
  const [scroll, setScroll] = useState(false);
  const messages: Message[] = useSelector(selectMessages);
  const current: number = useSelector(selectCurrent);

  function listenScrolling() {
    if (!ref.current) return;
    const el = ref.current as HTMLDivElement;
    const offset = el.scrollHeight - el.scrollTop - el.clientHeight;
    setScroll(offset > 100);
  }

  useEffect(
    function () {
      if (!ref.current) return;
      const el = ref.current as HTMLDivElement;
      el.scrollTop = el.scrollHeight;
      listenScrolling();
    },
    [messages],
  );

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current as HTMLDivElement;
    el.addEventListener("scroll", listenScrolling);
  }, [ref]);

  return (
    <>
      <div className={`chat-content`} ref={ref}>
        <div className={`scroll-action ${scroll ? "active" : ""}`}>
          <Button
            variant={`outline`}
            size={`icon`}
            onClick={() => {
              if (!ref.current) return;
              const el = ref.current as HTMLDivElement;
              el.scrollTo({
                top: el.scrollHeight,
                behavior: "smooth",
              });
            }}
          >
            <ChevronDown className={`h-4 w-4`} />
          </Button>
        </div>

        {
          messages.map((message, i) =>
            <MessageSegment
              message={message}
              end={i === messages.length - 1}
              onEvent={(e: string) => {
                connectionEvent.emit({
                  id: current,
                  event: e,
                });
              }}
              key={i}
            />
          )
        }
      </div>
    </>
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

  useEffect(() => {
    if (auth && model === "GPT-3.5") dispatch(setModel("GPT-3.5-16k"));
  }, [auth]);

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
        {messages.length > 0 ? (
          <ChatInterface />
        ) : (
          <div className={`chat-product`}>
            <Button
              variant={`outline`}
              onClick={() => router.navigate("/generate")}
            >
              <FolderKanban className={`h-4 w-4 mr-1.5`} />
              {t("generate.title")}
              <ChevronRight className={`h-4 w-4 ml-2`} />
            </Button>
          </div>
        )}
        <div className={`chat-input`}>
          <div className={`input-wrapper`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    aria-label={t("chat.web-aria")}
                    defaultPressed={true}
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
            <SelectGroup
              current={model}
              list={supportModels}
              onChange={(model: string) => {
                if (!auth && model !== "GPT-3.5") {
                  toast({
                    title: t("login-require"),
                  });
                  return;
                }
                dispatch(setModel(model));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className={`main`}>
      <SideBar />
      <ChatWrapper />
    </div>
  );
}

export default Home;

import "../assets/home.less";
import "../assets/chat.less";
import { Input } from "../components/ui/input.tsx";
import { Toggle } from "../components/ui/toggle.tsx";
import {
  ChevronDown,
  Globe,
  LogIn,
  MessageSquare,
  Plus,
  RotateCw,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import { Switch } from "../components/ui/switch.tsx";
import { Label } from "../components/ui/label.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip.tsx";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { selectAuthenticated } from "../store/auth.ts";
import { login } from "../conf.ts";
import {
  deleteConversation,
  toggleConversation,
  updateConversationList,
} from "../conversation/history.ts";
import React, {useEffect, useRef, useState} from "react";
import { useAnimation, useEffectAsync } from "../utils.ts";
import { useToast } from "../components/ui/use-toast.ts";
import { ConversationInstance, Message } from "../conversation/types.ts";
import {
  selectCurrent,
  selectGPT4,
  selectHistory,
  selectMessages,
  selectWeb,
  setGPT4,
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
  AlertDialogTrigger,
} from "../components/ui/alert-dialog.tsx";
import { manager } from "../conversation/manager.ts";
import { useTranslation } from "react-i18next";
import MessageSegment from "../components/Message.tsx";

function SideBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.menu.open);
  const auth = useSelector(selectAuthenticated);
  const current = useSelector(selectCurrent);
  const { toast } = useToast();
  const history: ConversationInstance[] = useSelector(selectHistory);
  const refresh = useRef(null);
  useEffectAsync(async () => {
    await updateConversationList(dispatch);
  }, []);

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      {auth ? (
        <div className={`sidebar-content`}>
          <div className={`sidebar-action`}>
            <Button
              variant={`ghost`}
              size={`icon`}
              onClick={() => toggleConversation(dispatch, -1)}
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
            {history.map((conversation, i) => (
              <div
                className={`conversation ${
                  current === conversation.id ? "active" : ""
                }`}
                key={i}
                onClick={() => toggleConversation(dispatch, conversation.id)}
              >
                <MessageSquare className={`h-4 w-4 mr-1`} />
                <div className={`title`}>{conversation.name}</div>
                <div className={`id`}>{conversation.id}</div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Trash2 className={`delete h-4 w-4`} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("conversation.remove-title")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("conversation.remove-description")}
                        <strong className={`conversation-name`}>
                          {conversation.name}
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
                          if (
                            await deleteConversation(dispatch, conversation.id)
                          )
                            toast({
                              title: t("conversation.delete-success"),
                              description: t(
                                "conversation.delete-success-prompt",
                              ),
                            });
                          else
                            toast({
                              title: t("conversation.delete-failed"),
                              description: t(
                                "conversation.delete-failed-prompt",
                              ),
                            });
                        }}
                      >
                        {t("conversation.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
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
  const [ scroll, setScroll ] = useState(false);
  const messages: Message[] = useSelector(selectMessages);

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
    el.addEventListener('scroll', listenScrolling);
  }, [ref]);

  return (
    <>
      <div className={`chat-content`} ref={ref}>
        <div className={`scroll-action ${scroll ? "active" : ""}`}>
          <Button variant={`outline`} size={`icon`} onClick={() => {
            if (!ref.current) return;
            const el = ref.current as HTMLDivElement;
            el.scrollTo({
              top: el.scrollHeight,
              behavior: 'smooth',
            });
          }}>
            <ChevronDown className={`h-4 w-4`} />
          </Button>
        </div>

        {
          messages.map((message, i) =>
            <MessageSegment message={message} key={i} />
          )
        }
      </div>
    </>
  );
}

function ChatWrapper() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const auth = useSelector(selectAuthenticated);
  const gpt4 = useSelector(selectGPT4);
  const web = useSelector(selectWeb);
  const target = useRef(null);
  manager.setDispatch(dispatch);

  async function handleSend(auth: boolean, gpt4: boolean, web: boolean) {
    // because of the function wrapper, we need to update the selector state using props.
    if (!target.current) return;
    const el = target.current as HTMLInputElement;
    const message: string = el.value.trim();
    if (message.length > 0) {
      if (await manager.send(t, auth, { message, web, gpt4 })) {
        el.value = "";
      }
    }
  }

  window.addEventListener("load", () => {
    const el = document.getElementById("input");
    if (el) el.focus();
  });

  return (
    <div className={`chat-container`}>
      <div className={`chat-wrapper`}>
        <ChatInterface />
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
                    <Globe className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p className={`tooltip`}>{t("chat.web")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              id={`input`}
              className={`input-box`}
              ref={target}
              placeholder={t("chat.placeholder")}
              onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") await handleSend(auth, gpt4, web);
              }}
            />
            <Button
              size={`icon`}
              variant="outline"
              className={`send-button`}
              onClick={() => handleSend(auth, gpt4, web)}
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                data-v-f9a7276b=""
              >
                <path d="m21.426 11.095-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"></path>
              </svg>
            </Button>
          </div>
          <div className={`input-options`}>
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-gpt4"
                onCheckedChange={(state: boolean) => dispatch(setGPT4(state))}
              />
              <Label htmlFor="enable-gpt4">GPT-4</Label>
            </div>
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

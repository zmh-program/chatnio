import "../assets/home.less";
import "../assets/chat.less";
import {Input} from "../components/ui/input.tsx";
import {Toggle} from "../components/ui/toggle.tsx";
import {Globe, LogIn, MessageSquare, RotateCw, Trash2} from "lucide-react";
import {Button} from "../components/ui/button.tsx";
import {Switch} from "../components/ui/switch.tsx";
import {Label} from "../components/ui/label.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip.tsx";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from "../store";
import {selectAuthenticated} from "../store/auth.ts";
import {login} from "../conf.ts";
import {deleteConversation, toggleConversation, updateConversationList} from "../conversation/history.ts";
import {useEffect, useRef} from "react";
import {useAnimation, useEffectAsync} from "../utils.ts";
import {useToast} from "../components/ui/use-toast.ts";
import {
  ConversationInstance,
  Message,
  selectCurrent,
  selectHistory,
  selectMessages,
  setGPT4,
  setWeb
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
import Markdown from "../components/Markdown.tsx";

function SideBar() {
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
      {
        auth ?
          <div className={`sidebar-content`}>
            <Button
              className={`refresh-action`} variant={`ghost`} size={`icon`} id={`refresh`}
              ref={refresh} onClick={() => {
              const hook = useAnimation(refresh, "active", 500);
              updateConversationList(dispatch)
                .catch(() => toast({
                  title: "Refresh failed",
                  description: "Failed to refresh conversations",
                }))
                .finally(hook);
            }}>
              <RotateCw className={`h-4 w-4`}/>
            </Button>
            <div className={`conversation-list`}>
              {
                history.map((conversation, i) => (
                  <div className={`conversation ${current === conversation.id ? "active" : ""}`} key={i}
                       onClick={() => toggleConversation(dispatch, conversation.id)}>
                    <MessageSquare className={`h-4 w-4 mr-1`} />
                    <div className={`title`}>{conversation.name}</div>
                    <div className={`id`}>{conversation.id}</div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Trash2 className={`delete h-4 w-4`} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the conversation <strong>{conversation.name}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={async () => {
                            if (await deleteConversation(dispatch, conversation.id)) toast({
                              title: "Conversation deleted",
                              description: `Conversation has been deleted.`,
                            })
                            else toast({
                              title: "Delete failed",
                              description: `Failed to delete conversation.`,
                            });
                          }}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              }
            </div>
          </div>
          : <Button className={`login-action`} variant={`default`} onClick={login}>
            <LogIn className={`h-3 w-3 mr-2`}/> login
          </Button>
      }
    </div>
  );
}

type ChatWrapperProps = {
  onSend?: (message: string) => void
}

function ChatInterface() {
  const ref = useRef(null);
  const messages: Message[] = useSelector(selectMessages);

  function hook() {
    if (!ref.current) return;
    const el = ref.current as HTMLDivElement;
    el.scrollTop = el.scrollHeight;
  }

  useEffect(hook, [messages]);
  return (
    <div className={`chat-content`} ref={ref}>
      {
        messages.map((message, i) => (
          <div className={`message ${message.role}`} key={i}>
            <div className={`message-content`}>
              <Markdown children={message.content} />
            </div>
          </div>
        ))
      }
    </div>
  )
}

function ChatWrapper({ onSend }: ChatWrapperProps) {
  const dispatch = useDispatch();
  const target = useRef(null);

  function handleSend() {
    if (!target.current) return;
    const el = target.current as HTMLInputElement;
    const message = el.value.trim();
    if (message.length > 0) {
      onSend?.(message);
      el.value = "";
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
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
                    <Toggle aria-label="Toggle chatgpt web feature"
                            defaultPressed={true} onPressedChange={(state: boolean) => dispatch(setWeb(state))}
                            variant={`outline`}>
                      <Globe className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className={`tooltip`}>Enable ChatGPT <strong>web</strong> feature</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input className={`input-box`} ref={target} placeholder={`Write something...`} />
              <Button size={`icon`} variant="outline" className={`send-button`} onClick={handleSend}>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" data-v-f9a7276b=""><path d="m21.426 11.095-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"></path></svg>
              </Button>
            </div>
            <div className={`input-options`}>
              <div className="flex items-center space-x-2">
                <Switch id="enable-gpt4" onCheckedChange={(state: boolean) => dispatch(setGPT4(state))} />
                <Label htmlFor="enable-gpt4">GPT-4</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

function Home() {
    return (
      <div className={`main`}>
        <SideBar />
        <ChatWrapper onSend={console.log} />
      </div>
    )
}

export default Home

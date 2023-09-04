import "../assets/home.less";
import {Input} from "../components/ui/input.tsx";
import {Toggle} from "../components/ui/toggle.tsx";
import {Globe, LogIn} from "lucide-react";
import {Button} from "../components/ui/button.tsx";
import {Switch} from "../components/ui/switch.tsx";
import {Label} from "../components/ui/label.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip.tsx";
import {useSelector} from "react-redux";
import type {RootState} from "../store";
import {selectAuthenticated} from "../store/auth.ts";
import {login} from "../conf.ts";

function SideBar() {
  const open = useSelector((state: RootState) => state.menu.open);
  const auth = useSelector(selectAuthenticated);

    return (
      <div className={`sidebar ${open ? "open" : ""}`}>
        {
          auth ?
          <div className={`sidebar-content`}></div>
          : <Button className={`login-action`} variant={`default`} onClick={login}>
              <LogIn className={`h-3 w-3 mr-2`} /> login
          </Button>
        }
      </div>
    )
}

type ChatWrapperProps = {
  onSend?: (message: string) => void
}

function ChatWrapper({ onSend }: ChatWrapperProps) {
  function handleSend() {
    const target = document.getElementById("input") as HTMLInputElement;
    const message = target.value.trim();
    if (message.length > 0) {
      onSend?.(message);
      target.value = "";
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
          <div className={`chat-content`}>
          </div>
          <div className={`chat-input`}>
            <div className={`input-wrapper`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle aria-label="Toggle chatgpt web feature" variant={`outline`}>
                      <Globe className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className={`tooltip`}>Enable ChatGPT <strong>web</strong> feature</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input className={`input-box`} id={`input`} placeholder={`Write something...`} />
              <Button size={`icon`} variant="outline" className={`send-button`} onClick={handleSend}>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" data-v-f9a7276b=""><path d="m21.426 11.095-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"></path></svg>
              </Button>
            </div>
            <div className={`input-options`}>
              <div className="flex items-center space-x-2">
                <Switch id="enable-gpt4" />
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

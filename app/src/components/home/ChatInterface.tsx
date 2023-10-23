import { useEffect, useRef, useState } from "react";
import { Message } from "../../conversation/types.ts";
import { useSelector } from "react-redux";
import { selectCurrent, selectMessages } from "../../store/chat.ts";
import { Button } from "../ui/button.tsx";
import { ChevronDown } from "lucide-react";
import MessageSegment from "../Message.tsx";
import { connectionEvent } from "../../events/connection.ts";

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

        {messages.map((message, i) => (
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
        ))}
      </div>
    </>
  );
}

export default ChatInterface;

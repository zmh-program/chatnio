import React, { useEffect } from "react";
import { Message } from "@/api/types.tsx";
import { useSelector } from "react-redux";
import {
  listenMessageEvent,
  selectCurrent,
  useMessages,
} from "@/store/chat.ts";
import MessageSegment from "@/components/Message.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

type ChatInterfaceProps = {
  scrollable: boolean;
  setTarget: (target: HTMLDivElement | null) => void;
};

function ChatInterface({ scrollable, setTarget }: ChatInterfaceProps) {
  const ref = React.useRef(null);
  const messages: Message[] = useMessages();
  const process = listenMessageEvent();
  const current: number = useSelector(selectCurrent);
  const [selected, setSelected] = React.useState(-1);

  useEffect(
    function () {
      if (!ref.current || !scrollable) return;
      const el = ref.current as HTMLDivElement;
      el.scrollTop = el.scrollHeight;
    },
    [messages],
  );

  useEffect(() => {
    setTarget(ref.current);
  }, [ref]);

  return (
    <ScrollArea className={`chat-content`} ref={ref}>
      <div className={`chat-messages-wrapper`}>
        {messages.map((message, i) => (
          <MessageSegment
            message={message}
            end={i === messages.length - 1}
            onEvent={(event: string, index?: number, message?: string) => {
              process({ id: current, event, index, message });
            }}
            key={i}
            index={i}
            selected={selected === i}
            onFocus={() => setSelected(i)}
            onFocusLeave={() => setSelected(-1)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

export default ChatInterface;

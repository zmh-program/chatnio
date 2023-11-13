import React, { useEffect } from "react";
import { Message } from "@/conversation/types.ts";
import { useSelector } from "react-redux";
import { selectCurrent, selectMessages } from "@/store/chat.ts";
import MessageSegment from "@/components/Message.tsx";
import { connectionEvent } from "@/events/connection.ts";
import { chatEvent } from "@/events/chat.ts";
import { addEventListeners } from "@/utils/dom.ts";

type ChatInterfaceProps = {
  setTarget: (target: HTMLDivElement | null) => void;
};

function ChatInterface({ setTarget }: ChatInterfaceProps) {
  const ref = React.useRef(null);
  const messages: Message[] = useSelector(selectMessages);
  const current: number = useSelector(selectCurrent);
  const [scrollable, setScrollable] = React.useState(true);

  useEffect(
    function () {
      if (!ref.current || !scrollable) return;
      const el = ref.current as HTMLDivElement;
      el.scrollTop = el.scrollHeight;
      chatEvent.emit();
    },
    [messages],
  );

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current as HTMLDivElement;

    const event = () =>
      setScrollable(el.scrollTop + el.clientHeight + 20 >= el.scrollHeight);
    return addEventListeners(
      el,
      ["scroll", "scrollend", "resize", "touchend"],
      event,
    );
  }, [ref]);

  useEffect(() => {
    setTarget(ref.current);
  }, [ref]);

  return (
    <>
      <div className={`chat-content`} ref={ref}>
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

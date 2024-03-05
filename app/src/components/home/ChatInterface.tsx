import React, { useEffect } from "react";
import { Message } from "@/api/types.tsx";
import { useSelector } from "react-redux";
import {
  listenMessageEvent,
  selectCurrent,
  useMessages,
} from "@/store/chat.ts";
import MessageSegment from "@/components/Message.tsx";
import { chatEvent } from "@/events/chat.ts";
import { addEventListeners } from "@/utils/dom.ts";

type ChatInterfaceProps = {
  setTarget: (target: HTMLDivElement | null) => void;
};

function ChatInterface({ setTarget }: ChatInterfaceProps) {
  const ref = React.useRef(null);
  const messages: Message[] = useMessages();
  const process = listenMessageEvent();
  const current: number = useSelector(selectCurrent);
  const [scrollable, setScrollable] = React.useState(true);
  const [position, setPosition] = React.useState(0);

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

    const event = () => {
      const offset = el.scrollTop - position;
      setPosition(el.scrollTop);
      if (offset < 0) setScrollable(false);
      else
        setScrollable(el.scrollTop + el.clientHeight + 20 >= el.scrollHeight);
    };
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
            onEvent={(event: string, index?: number, message?: string) => {
              process({ id: current, event, index, message });
            }}
            key={i}
            index={i}
          />
        ))}
      </div>
    </>
  );
}

export default ChatInterface;

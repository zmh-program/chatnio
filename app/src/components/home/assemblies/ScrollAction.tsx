import { ChevronsDown } from "lucide-react";
import { useEffect } from "react";
import { addEventListeners, scrollDown } from "@/utils/dom.ts";
import { ChatAction } from "@/components/home/assemblies/ChatAction.tsx";
import { useTranslation } from "react-i18next";
import { Message } from "@/api/types.tsx";
import { useMessages } from "@/store/chat.ts";

type ScrollActionProps = {
  visible: boolean;
  setVisibility: (visible: boolean) => void;
  target: HTMLElement | null;
};

function ScrollAction(
  this: any,
  { target, visible, setVisibility }: ScrollActionProps,
) {
  const { t } = useTranslation();
  const messages: Message[] = useMessages();

  const scrollableHandler = () => {
    if (!target) return;

    const position = target.scrollTop + target.clientHeight;
    const height = target.scrollHeight;
    const diff = Math.abs(position - height);
    setVisibility(diff > 50);
  };

  useEffect(() => {
    if (!target) return;
    return addEventListeners(
      target,
      ["scroll", "touchmove"],
      scrollableHandler,
    );
  }, [target]);

  useEffect(() => {
    if (!target) return;

    if (target.scrollHeight <= target.clientHeight) {
      setVisibility(false);
    }
  }, [messages]);

  return (
    visible && (
      <ChatAction text={t("scroll-down")} onClick={() => scrollDown(target)}>
        <ChevronsDown className={`h-4 w-4`} />
      </ChatAction>
    )
  );
}

export default ScrollAction;

import { ChevronsDown } from "lucide-react";
import { useEffect } from "react";
import { chatEvent } from "@/events/chat.ts";
import { scrollDown } from "@/utils/dom.ts";
import { ChatAction } from "@/components/home/assemblies/ChatAction.tsx";
import { useTranslation } from "react-i18next";

type ScrollActionProps = {
  visible: boolean;
  setVisibility: (visible: boolean) => void;
  target: HTMLElement | null;
};

function ScrollAction({ visible, target, setVisibility }: ScrollActionProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!target) return;
    target.addEventListener("scroll", listenScrollingAction);
  }, [target]);

  function listenScrollingAction() {
    if (!target) return;
    const offset = target.scrollHeight - target.scrollTop - target.clientHeight;
    setVisibility(offset > 100);
  }

  chatEvent.addEventListener(listenScrollingAction);

  return (
    visible && (
      <ChatAction text={t("scroll-down")} onClick={() => scrollDown(target)}>
        <ChevronsDown className={`h-4 w-4`} />
      </ChatAction>
    )
  );
}

export default ScrollAction;

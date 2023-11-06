import { Button } from "@/components/ui/button.tsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { chatEvent } from "@/events/chat.ts";

type ScrollActionProps = {
  target: HTMLElement | null;
};

function ScrollAction({ target }: ScrollActionProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!target) return;
    target.addEventListener("scroll", listenScrollingAction);
  }, [target]);

  function listenScrollingAction() {
    if (!target) return;
    const offset = target.scrollHeight - target.scrollTop - target.clientHeight;
    setEnabled(offset > 100);
  }

  chatEvent.addEventListener(listenScrollingAction);

  return (
    <div className={`scroll-action ${enabled ? "active" : ""}`}>
      <Button
        variant={`outline`}
        size={`icon`}
        onClick={() => {
          if (!target) return;
          target.scrollTo({
            top: target.scrollHeight,
            behavior: "smooth",
          });
        }}
      >
        <ChevronDown className={`h-4 w-4`} />
      </Button>
    </div>
  );
}

export default ScrollAction;

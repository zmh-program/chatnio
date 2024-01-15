import { openMarket, openMask, selectWeb, toggleWeb } from "@/store/chat.ts";
import { Blocks, Globe, Settings, Wand2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef } from "react";
import { openDialog } from "@/store/settings.ts";
import { cn } from "@/components/ui/lib/utils.ts";

type ChatActionProps = {
  className?: string;
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};
export const ChatAction = React.forwardRef<HTMLDivElement, ChatActionProps>(
  (props, ref) => {
    const { className, text, children, onClick } = props;
    const label = useRef(null);
    const [labelWidth, setLabelWidth] = React.useState(0);

    useEffect(() => {
      if (!label.current) return;

      const target = label.current as HTMLDivElement;
      const width = target.clientWidth || target.offsetWidth;
      setLabelWidth(width);
    }, [text, label]);

    return (
      <div
        className={`action chat-action ${className}`}
        onClick={onClick}
        ref={ref}
        style={{ "--width": `${labelWidth}px` } as React.CSSProperties}
      >
        {children}
        <div className="text" ref={label}>
          {text}
        </div>
      </div>
    );
  },
);

type WebActionProps = {
  visible: boolean;
};

export function WebAction({ visible }: WebActionProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const web = useSelector(selectWeb);

  return (
    visible && (
      <ChatAction
        className={cn(web && "active")}
        text={t("chat.web")}
        onClick={() => dispatch(toggleWeb())}
      >
        <Globe className={cn("h-4 w-4 web", web && "enable")} />
      </ChatAction>
    )
  );
}

export function SettingsAction() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <ChatAction
      text={t("settings.description")}
      onClick={() => dispatch(openDialog())}
    >
      <Settings className={`h-4 w-4`} />
    </ChatAction>
  );
}

export function MarketAction() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <ChatAction text={t("market.title")} onClick={() => dispatch(openMarket())}>
      <Blocks className={`h-4 w-4`} />
    </ChatAction>
  );
}

export function MaskAction() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <ChatAction text={t("mask.title")} onClick={() => dispatch(openMask())}>
      <Wand2 className={`h-4 w-4`} />
    </ChatAction>
  );
}

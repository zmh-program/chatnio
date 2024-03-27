import "@/assets/pages/sharing.less";
import { useParams } from "react-router-dom";
import { viewConversation, ViewData, ViewForm } from "@/api/sharing.ts";
import { saveImageAsFile } from "@/utils/dom.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { useRef, useState } from "react";
import {
  Clock,
  HelpCircle,
  Image,
  Loader2,
  Maximize,
  MessagesSquare,
  Minimize,
  Newspaper,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import MessageSegment from "@/components/Message.tsx";
import { Button } from "@/components/ui/button.tsx";
import router from "@/router.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { Message } from "@/api/types.tsx";
import Avatar from "@/components/Avatar.tsx";
import { toJpeg } from "html-to-image";
import { appLogo } from "@/conf/env.ts";
import { extractMessage } from "@/utils/processor.ts";
import { cn } from "@/components/ui/lib/utils.ts";
import { isMobile, useMobile } from "@/utils/device.ts";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useConversationActions } from "@/store/chat.ts";

type SharingFormProps = {
  refer?: string;
  data: ViewData | null;
};

function SharingForm({ data }: SharingFormProps) {
  if (data === null) return null;

  const { t } = useTranslation();
  const { toast } = useToast();
  const mobile = useMobile();
  const { mask: setMask, selected: setModel } = useConversationActions();
  const [maximized, setMaximized] = useState(isMobile());
  const container = useRef<HTMLDivElement>(null);
  const date = new Date(data.time);
  const time = `${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  const saveImage = async () => {
    toast({
      title: t("message.saving-image-prompt"),
      description: t("message.saving-image-prompt-desc"),
    });

    setTimeout(() => {
      if (!container.current) return;
      toJpeg(container.current)
        .then((blob) => {
          saveImageAsFile(`${extractMessage(data.name, 12)}.png`, blob);
          toast({
            title: t("message.saving-image-success"),
            description: t("message.saving-image-success-prompt"),
          });
        })
        .catch((reason) => {
          toast({
            title: t("message.saving-image-failed"),
            description: t("message.saving-image-failed-prompt", { reason }),
          });
        });
    }, 10);
  };

  return (
    <div className={cn("sharing-container", maximized && "maximized")}>
      <div className={`sharing-screenshot`}>
        <div className={`shot-body`} ref={container}>
          <div className={`shot-wrapper`}>
            <div className={`shot-header`}>
              <div className={`shot-column`}>
                <div className={`shot-row`}>
                  <Newspaper className={`shot-icon`} />
                  <p className={`shot-label`}>{t("message.sharing.title")}</p>
                  <div className={`grow`} />
                  <p className={`shot-value`}>
                    {mobile ? extractMessage(data.name, 10) : data.name}
                  </p>
                </div>
                <div className={`shot-row`}>
                  <Clock className={`shot-icon`} />
                  <p className={`shot-label`}>{t("message.sharing.time")}</p>
                  <div className={`grow`} />
                  <p className={`shot-value`}>{time}</p>
                </div>
                <div className={`shot-row`}>
                  <MessagesSquare className={`shot-icon`} />
                  <p className={`shot-label`}>{t("message.sharing.message")}</p>
                  <div className={`grow`} />
                  <p className={`shot-value`}>{data.messages.length}</p>
                </div>
              </div>
              <div className={`grow`} />
              <div className={`shot-column`}>
                <img className={`w-12 h-12 m-4`} src={appLogo} alt={""} />
                <div className={`grow`} />
                <div className={`shot-row shot-user`}>
                  <Avatar username={data.username} className={`shot-avatar`} />
                  <p className={`shot-value shot-username`}>{data.username}</p>
                </div>
              </div>
            </div>
            <div className={`shot-content`}>
              {data.messages.map((message, i) => (
                <MessageSegment
                  message={message}
                  key={i}
                  index={i}
                  username={data.username}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`header`}>
        <div className={`user`}>
          <Avatar username={data.username} />
          <span className={`sharing-username`}>{data.username}</span>
        </div>
        <div className={`name`}>{data.name}</div>
        <div className={`time`}>{time}</div>
      </div>
      <ScrollArea className={`body`}>
        <div className={`chat-messages-wrapper`}>
          {data.messages.map((message, i) => (
            <MessageSegment
              message={message}
              key={i}
              index={i}
              username={data.username}
            />
          ))}
        </div>
      </ScrollArea>
      <div className={`action`}>
        <Button
          variant={`outline`}
          size={`icon`}
          onClick={() => setMaximized(!maximized)}
        >
          {maximized ? (
            <Minimize className={`h-4 w-4`} />
          ) : (
            <Maximize className={`h-4 w-4`} />
          )}
        </Button>
        <Button variant={`outline`} onClick={saveImage}>
          <Image className={`h-4 w-4 mr-2`} />
          {t("message.save-image")}
        </Button>
        <Button
          variant={`outline`}
          onClick={async () => {
            const message: Message[] = data?.messages || [];
            setMask({
              avatar: "",
              name: data.name,
              context: message,
            });
            setModel(data?.model);

            console.debug(
              `[sharing] switch to conversation (name: ${data.name}, model: ${data.model})`,
            );
            await router.navigate("/");
          }}
        >
          <MessagesSquare className={`h-4 w-4 mr-2`} />
          {t("message.use")}
        </Button>
      </div>
    </div>
  );
}

function Sharing() {
  const { t } = useTranslation();
  const { hash } = useParams();
  const [setup, setSetup] = useState(false);
  const [data, setData] = useState<ViewForm | null>(null);

  const loading = data === null;

  useEffectAsync(async () => {
    if (!hash || setup) return;

    setSetup(true);

    const resp = await viewConversation(hash as string);
    setData(resp);
    if (!resp.status) console.debug(`[sharing] error: ${resp.message}`);
  }, []);

  return (
    <div
      className={cn(
        `sharing-page`,
        loading && "flex flex-row items-center justify-center",
      )}
    >
      {loading ? (
        <div className={`animate-spin select-none`}>
          <Loader2 className={`loader w-12 h-12`} />
        </div>
      ) : data.status ? (
        <SharingForm refer={hash} data={data.data} />
      ) : (
        <div className={`error-container`}>
          <HelpCircle className={`w-12 h-12 mb-2.5`} />
          <p className={`title`}>{t("share.not-found")}</p>
          <p className={`description`}>{t("share.not-found-description")}</p>
          <Button className={`mt-4`} onClick={() => router.navigate("/")}>
            {t("home")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Sharing;

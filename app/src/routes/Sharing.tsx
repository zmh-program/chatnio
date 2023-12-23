import "@/assets/pages/sharing.less";
import { useParams } from "react-router-dom";
import { viewConversation, ViewData, ViewForm } from "@/api/sharing.ts";
import { copyClipboard, saveAsFile } from "@/utils/dom.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { useState } from "react";
import { Copy, File, HelpCircle, Loader2, MessagesSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import MessageSegment from "@/components/Message.tsx";
import { Button } from "@/components/ui/button.tsx";
import router from "@/router.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { sharingEvent } from "@/events/sharing.ts";
import { Message } from "@/api/types.ts";
import Avatar from "@/components/Avatar.tsx";

type SharingFormProps = {
  refer?: string;
  data: ViewData | null;
};

function SharingForm({ refer, data }: SharingFormProps) {
  if (data === null) return null;
  const { t } = useTranslation();
  const date = new Date(data.time);
  const time = `${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  const value = JSON.stringify(data, null, 2);
  const { toast } = useToast();

  return (
    <div className={`sharing-container`}>
      <div className={`header`}>
        <div className={`user`}>
          <Avatar username={data.username} />
          <span>{data.username}</span>
        </div>
        <div className={`name`}>{data.name}</div>
        <div className={`time`}>{time}</div>
      </div>
      <div className={`body`}>
        {data.messages.map((message, i) => (
          <MessageSegment message={message} key={i} />
        ))}
      </div>
      <div className={`action`}>
        <Button
          variant={`outline`}
          onClick={async () => {
            await copyClipboard(value);
            toast({
              title: t("share.copied"),
            });
          }}
        >
          <Copy className={`h-4 w-4 mr-2`} />
          {t("message.copy")}
        </Button>
        <Button
          variant={`outline`}
          onClick={() => saveAsFile("conversation.json", value)}
        >
          <File className={`h-4 w-4 mr-2`} />
          {t("message.save")}
        </Button>
        <Button
          variant={`outline`}
          onClick={async () => {
            sharingEvent.emit({
              refer: refer as string,
              data: data?.messages as Message[],
            });
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

  useEffectAsync(async () => {
    if (!hash || setup) return;

    setSetup(true);

    const resp = await viewConversation(hash as string);
    setData(resp);
    if (!resp.status) console.debug(`[sharing] error: ${resp.message}`);
  }, []);

  return (
    <div className={`sharing-page`}>
      {data === null ? (
        <div className={`loading`}>
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

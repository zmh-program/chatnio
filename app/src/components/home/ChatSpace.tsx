import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { isSubscribedSelector } from "@/store/subscription.ts";
import { Button } from "@/components/ui/button.tsx";
import { ChevronRight, FolderKanban, Newspaper, Users2 } from "lucide-react";
import router from "@/router.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { getLanguage } from "@/i18n.ts";
import { selectAuthenticated } from "@/store/auth.ts";
import { appLogo } from "@/conf/env.ts";
import {
  infoArticleSelector,
  infoContactSelector,
  infoGenerationSelector,
} from "@/store/info.ts";
import Markdown from "@/components/Markdown.tsx";
import { hitGroup } from "@/utils/groups.ts";

function ChatSpace() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const contact = useSelector(infoContactSelector);

  const cn = getLanguage() === "cn";
  const auth = useSelector(selectAuthenticated);

  const generationGroup = useSelector(infoGenerationSelector);
  const generation = hitGroup(generationGroup);

  const articleGroup = useSelector(infoArticleSelector);
  const article = hitGroup(articleGroup);

  return (
    <div className={`chat-product`}>
      <img
        src={appLogo}
        className={`chat-logo h-20 w-20 translate-y-[-2rem]`}
        alt={``}
      />

      {contact.length > 0 && (
        <Button variant={`outline`} onClick={() => setOpen(true)}>
          <Users2 className={`h-4 w-4 mr-1.5`} />
          {t("contact.title")}
          <ChevronRight className={`h-4 w-4 ml-2`} />
        </Button>
      )}

      {article && (
        <Button variant={`outline`} onClick={() => router.navigate("/article")}>
          <Newspaper className={`h-4 w-4 mr-1.5`} />
          {t("article.title")}
          <ChevronRight className={`h-4 w-4 ml-2`} />
        </Button>
      )}

      {generation && (
        <Button
          variant={`outline`}
          onClick={() => router.navigate("/generate")}
        >
          <FolderKanban className={`h-4 w-4 mr-1.5`} />
          {t("generate.title")}
          <ChevronRight className={`h-4 w-4 ml-2`} />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`flex-dialog`}>
          <DialogHeader>
            <DialogTitle>{t("contact.title")}</DialogTitle>
            <DialogDescription asChild>
              <Markdown className={`pt-4`} acceptHtml={true}>
                {contact}
              </Markdown>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className={`space-footer`}>
        {cn && !auth && (
          <p>
            请您遵守
            <a
              href={`http://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm`}
              target={`_blank`}
            >
              《生成式人工智能服务管理暂行办法》
            </a>
            法规使用
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatSpace;

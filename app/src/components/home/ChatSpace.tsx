import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button.tsx";
import {
  ChevronRight,
  FolderKanban,
  Newspaper,
  Shield,
  Users2,
} from "lucide-react";
import router from "@/router.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { selectAdmin, selectAuthenticated } from "@/store/auth.ts";
import { appLogo } from "@/conf/env.ts";
import {
  infoArticleSelector,
  infoAuthFooterSelector,
  infoContactSelector,
  infoFooterSelector,
  infoGenerationSelector,
} from "@/store/info.ts";
import Markdown from "@/components/Markdown.tsx";
import { hitGroup } from "@/utils/groups.ts";

function Footer() {
  const auth = useSelector(selectAuthenticated);
  const footer = useSelector(infoFooterSelector);
  const auth_footer = useSelector(infoAuthFooterSelector);

  if (auth && auth_footer) {
    // hide footer
    return null;
  }

  return footer.length > 0 && <Markdown acceptHtml={true}>{footer}</Markdown>;
}

function ChatSpace() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const contact = useSelector(infoContactSelector);
  const admin = useSelector(selectAdmin);

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

      {admin && (
        <Button variant={`outline`} onClick={() => router.navigate("/admin")}>
          <Shield className={`h-4 w-4 mr-1.5`} />
          {t("admin.users")}
          <ChevronRight className={`h-4 w-4 ml-2`} />
        </Button>
      )}

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
        <Footer />
      </div>
    </div>
  );
}

export default ChatSpace;

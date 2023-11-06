import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { isSubscribedSelector } from "@/store/subscription.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  BookMarked,
  ChevronRight,
  FolderKanban,
  Link,
  Newspaper,
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

function ChatSpace() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const subscription = useSelector(isSubscribedSelector);
  return (
    <div className={`chat-product`}>
      <Button variant={`outline`} onClick={() => setOpen(true)}>
        <Users2 className={`h-4 w-4 mr-1.5`} />
        {t("contact.title")}
        <ChevronRight className={`h-4 w-4 ml-2`} />
      </Button>
      {subscription && (
        <Button variant={`outline`} onClick={() => router.navigate("/article")}>
          <Newspaper className={`h-4 w-4 mr-1.5`} />
          {t("article.title")}
          <ChevronRight className={`h-4 w-4 ml-2`} />
        </Button>
      )}
      <Button variant={`outline`} onClick={() => router.navigate("/generate")}>
        <FolderKanban className={`h-4 w-4 mr-1.5`} />
        {t("generate.title")}
        <ChevronRight className={`h-4 w-4 ml-2`} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("contact.title")}</DialogTitle>
            <DialogDescription asChild>
              <div className={`grid pt-4`}>
                <Button
                  className={`mx-auto`}
                  variant={`outline`}
                  onClick={() =>
                    window.open("https://docs.chatnio.net", "_blank")
                  }
                >
                  <BookMarked className={`h-4 w-4 mr-1.5`} />
                  {t("docs.title")}
                </Button>
                <a
                  href={
                    "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=1oKfIbNVXmMNMVzW1NiFSTKDcT1qIEq5&authKey=uslxslIBZtLImf4BSxjDqfx4hiJA52YV7PFM38W%2BOArr%2BhE0jwVdQCRYs0%2FXKX7W&noverify=0&group_code=565902327"
                  }
                  target={"_blank"}
                  className={`inline-flex mx-auto mt-1 mb-2`}
                >
                  <img
                    src={`/source/qq.jpg`}
                    className={`contact-image`}
                    alt={`QQ`}
                  />
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className={`space-footer`}>
        <p>
          <Link className={`h-3 w-3 mr-1`} />
          <a
            href={`https://docs.chatnio.net/ai-mo-xing-ji-ji-fei`}
            target={`_blank`}
          >
            模型定价表
          </a>
        </p>
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
      </div>
    </div>
  );
}

export default ChatSpace;

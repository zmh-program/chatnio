import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { announcementEvent } from "@/events/announcement.ts";
import { Bell, Check } from "lucide-react";
import Markdown from "@/components/Markdown.tsx";

function Announcement() {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState<string>("");

  useEffect(() => {
    announcementEvent.bind((data: string) => setAnnouncement(data));
  }, []);

  return (
    <AlertDialog
      open={announcement !== ""}
      onOpenChange={() => setAnnouncement("")}
    >
      <AlertDialogContent className={`flex-dialog`}>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={"flex flex-row items-center select-none"}
          >
            <Bell className="inline-block w-4 h-4 mr-2" />
            <p className={`translate-y-[-1px]`}>{t("announcement")}</p>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Markdown acceptHtml={true}>{announcement}</Markdown>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("close")}</AlertDialogCancel>
          <AlertDialogAction>
            <Check className="w-4 h-4 mr-1" />
            {t("i-know")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default Announcement;

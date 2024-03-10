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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AnnouncementEvent, announcementEvent } from "@/events/announcement.ts";
import { Bell, Check } from "lucide-react";
import Markdown from "@/components/Markdown.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/components/ui/lib/utils.ts";

function Announcement() {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    announcementEvent.bind((data: AnnouncementEvent) => {
      if (data.message.length === 0) return;

      setAnnouncement(data.message);
      data.firstReceived && setOpen(true);
    });
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={`outline`}
          size={`icon`}
          className={cn(!announcement.length && `hidden`)}
        >
          <Bell className={`h-4 w-4`} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={`announcement-dialog flex-dialog`}>
        <AlertDialogHeader notTextCentered>
          <AlertDialogTitle
            className={"flex flex-row items-center select-none"}
          >
            <Bell className="inline-block w-4 h-4 mr-2" />
            <p className={`translate-y-[-1px]`}>{t("announcement")}</p>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Markdown acceptHtml={true}>{announcement || t("empty")}</Markdown>
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

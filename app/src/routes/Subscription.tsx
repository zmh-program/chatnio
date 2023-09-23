import {
  dialogSelector,
  expiredSelector,
  isSubscribedSelector,
  refreshSubscription,
  refreshSubscriptionTask,
  setDialog,
} from "../store/subscription.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog.tsx";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/ui/use-toast.ts";
import React, { useEffect } from "react";
import "../assets/subscription.less";
import {
  Calendar,
  Compass,
  Globe,
  Image,
  ImagePlus,
  LifeBuoy,
  MessageSquare,
  MessagesSquare,
  Plus,
  ServerCrash,
  Webhook,
} from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { buySubscription } from "../conversation/addition.ts";

function calc_prize(month: number): number {
  if (month >= 12) {
    return 8 * month * 0.8;
  } else if (month >= 6) {
    return 8 * month * 0.9;
  }
  return 8 * month;
}

type UpgradeProps = {
  children: React.ReactNode;
};

async function callBuyAction(
  t: any,
  toast: any,
  month: number,
): Promise<boolean> {
  const res = await buySubscription(month);
  if (res.status) {
    toast({
      title: t("sub.success"),
      description: t("sub.success-prompt", {
        month,
      }),
    });
  } else {
    toast({
      title: t("sub.failed"),
      description: t("sub.failed-prompt"),
    });
    setTimeout(() => {
      window.open("https://deeptrain.lightxi.com/home/wallet");
    }, 2000);
  }
  return res.status;
}
function Upgrade({ children }: UpgradeProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(1);
  const dispatch = useDispatch();
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={`flex-dialog`}>
        <DialogHeader>
          <DialogTitle>{t("sub.select-time")}</DialogTitle>
        </DialogHeader>
        <div className="upgrade-wrapper">
          <Select onValueChange={(value: string) => setMonth(parseInt(value))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t(`sub.time.${month}`)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"1"}>{t(`sub.time.1`)}</SelectItem>
              <SelectItem value={"3"}>{t(`sub.time.3`)}</SelectItem>
              <SelectItem value={"6"}>
                {t(`sub.time.6`)}
                <Badge className={`ml-2 cent`}>
                  {t(`percent`, { cent: 9 })}
                </Badge>
              </SelectItem>
              <SelectItem value={"12"}>
                {t(`sub.time.12`)}
                <Badge className={`ml-2 cent`}>
                  {t(`percent`, { cent: 8 })}
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className={`price`}>
            {t("sub.price", { price: calc_prize(month).toFixed(2) })}
          </p>
        </div>
        <DialogFooter>
          <Button variant={`outline`} onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={async () => {
              const res = await callBuyAction(t, toast, month);
              if (res) {
                setOpen(false);
                await refreshSubscription(dispatch);
              }
            }}
          >
            <Plus className={`h-4 w-4 mr-1`} />
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Subscription() {
  const { t } = useTranslation();
  const open = useSelector(dialogSelector);
  const subscription = useSelector(isSubscribedSelector);
  const expired = useSelector(expiredSelector);
  const dispatch = useDispatch();
  useEffect(() => {
    refreshSubscriptionTask(dispatch);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(state: boolean) => dispatch(setDialog(state))}
    >
      <DialogContent className={`sub-dialog flex-dialog`}>
        <DialogHeader>
          <DialogTitle>{t("sub.dialog-title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`sub-wrapper`}>
              {subscription && (
                <div className={`date`}>
                  <Calendar className={`h-4 w-4 mr-1`} />
                  {t("sub.expired", { expired })}
                </div>
              )}
              <div className={`plan-wrapper`}>
                <div className={`plan`}>
                  <div className={`title`}>{t("sub.free")}</div>
                  <div className={`price`}>{t("sub.free-price")}</div>
                  <div className={`desc`}>
                    <div>
                      <MessageSquare className={`h-4 w-4 mr-1`} />
                      {t("sub.free-gpt3")}
                    </div>
                    <div>
                      <Image className={`h-4 w-4 mr-1`} />
                      {t("sub.free-dalle")}
                    </div>
                    <div>
                      <Globe className={`h-4 w-4 mr-1`} />
                      {t("sub.free-web")}
                    </div>
                    <div>
                      <MessagesSquare className={`h-4 w-4 mr-1`} />
                      {t("sub.free-conversation")}
                    </div>
                    <div>
                      <Webhook className={`h-4 w-4 mr-1`} />
                      {t("sub.free-api")}
                    </div>
                  </div>
                  <Button className={`action`} variant={`outline`} disabled>
                    {subscription ? t("sub.cannot-select") : t("sub.current")}
                  </Button>
                </div>
                <div className={`plan pro`}>
                  <div className={`title`}>{t("sub.pro")}</div>
                  <div className={`price`}>{t("sub.pro-price")}</div>
                  <div className={`desc`}>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-gpt4")}
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-dalle")}
                    </div>
                    <div>
                      <LifeBuoy className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-service")}
                    </div>
                    <div>
                      <ServerCrash className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-thread")}
                    </div>
                  </div>
                  <Upgrade>
                    <Button className={`action`} variant={`default`}>
                      {subscription ? t("sub.renew") : t("sub.upgrade")}
                    </Button>
                  </Upgrade>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default Subscription;

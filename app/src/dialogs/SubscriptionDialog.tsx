import {
  closeDialog,
  dialogSelector,
  enterpriseSelector,
  expiredSelector,
  isSubscribedSelector,
  refreshSubscription,
  setDialog,
  usageSelector,
} from "@/store/subscription.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast.ts";
import React from "react";
import "@/assets/pages/subscription.less";
import {
  openDialog as openQuotaDialog,
  dialogSelector as quotaDialogSelector,
} from "@/store/quota.ts";
import {
  BookText,
  Building2,
  Calendar,
  Compass,
  DatabaseZap,
  FolderGit2,
  Globe,
  Image,
  ImagePlus,
  LifeBuoy,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  Plus,
  ServerCog,
  ServerCrash,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { buySubscription } from "@/api/addition.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { selectAuthenticated } from "@/store/auth.ts";
import { DialogClose } from "@radix-ui/react-dialog";

function calc_prize(month: number): number {
  const base = 56 * month;
  if (month >= 36) {
    return base * 0.7;
  } else if (month >= 12) {
    return base * 0.8;
  } else if (month >= 6) {
    return base * 0.9;
  }

  return base;
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
      window.open("https://deeptrain.net/home/wallet");
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
              <SelectItem value={"36"}>
                {t(`sub.time.36`)}
                <Badge className={`ml-2 cent`}>
                  {t(`percent`, { cent: 7 })}
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className={`price`}>
            {t("sub.price", { price: calc_prize(month).toFixed(2) })}
          </p>
        </div>
        <DialogFooter className={`translate-y-1.5`}>
          <DialogClose asChild>
            <Button variant={`outline`}>{t("cancel")}</Button>
          </DialogClose>
          <Button
            className={`mb-1.5`}
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

function SubscriptionDialog() {
  const { t } = useTranslation();
  const open = useSelector(dialogSelector);
  const subscription = useSelector(isSubscribedSelector);
  const enterprise = useSelector(enterpriseSelector);
  const expired = useSelector(expiredSelector);
  const usage = useSelector(usageSelector);
  const auth = useSelector(selectAuthenticated);

  const quota = useSelector(quotaDialogSelector);

  const dispatch = useDispatch();
  useEffectAsync(async () => {
    if (!auth) return;
    const task = setInterval(() => refreshSubscription(dispatch), 10000);
    await refreshSubscription(dispatch);

    return () => clearInterval(task);
  }, [auth]);

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
              <p
                className={`link`}
                onClick={() =>
                  quota ? dispatch(closeDialog()) : dispatch(openQuotaDialog())
                }
              >
                {t("sub.quota-link")}
              </p>
              {subscription && (
                <div className={`sub-row`}>
                  <div className={`sub-column`}>
                    <Calendar className={`h-4 w-4 mr-1`} />
                    {t("sub.expired")}
                    <div className={`grow`} />
                    <div className={`sub-value`}>
                      <p>{expired}</p>
                    </div>
                  </div>
                  {!enterprise && (
                    <>
                      <div className={`sub-column`}>
                        <Image className={`h-4 w-4 mr-1`} />
                        Midjourney
                        <div className={`grow`} />
                        <div className={`sub-value`}>
                          <p>{usage?.midjourney || 0}</p> / <p> 10 </p>
                        </div>
                      </div>
                      <div className={`sub-column`}>
                        <Compass className={`h-4 w-4 mr-1`} />
                        GPT-4
                        <div className={`grow`} />
                        <div className={`sub-value`}>
                          <p>{usage?.gpt4 || 0}</p> / <p> 100 </p>
                        </div>
                      </div>
                      <div className={`sub-column`}>
                        <Newspaper className={`h-4 w-4 mr-1`} />
                        Claude 100k
                        <div className={`grow`} />
                        <div className={`sub-value`}>
                          <p>{usage?.claude100k || 0}</p> / <p> 100 </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className={`plan-wrapper`}>
                <div className={`plan`}>
                  <div className={`title`}>{t("sub.free")}</div>
                  <div className={`price`}>{t("sub.free-price")}</div>
                  <div className={`desc`}>
                    <div>
                      <Webhook className={`h-4 w-4 mr-1`} />
                      {t("sub.free-api")}
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
                      <MessageSquare className={`h-4 w-4 mr-1`} />
                      {t("sub.free-gpt3")}
                    </div>
                    <div>
                      <Image className={`h-4 w-4 mr-1`} />
                      {t("sub.free-dalle")}
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
                      <ServerCrash className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-thread")}
                    </div>
                    <div>
                      <LifeBuoy className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-service")}
                    </div>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-gpt4")}
                    </div>
                    <div>{t("sub.pro-gpt4-desc")}</div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-claude")}
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-mj")}
                    </div>
                  </div>
                  <Upgrade>
                    <Button
                      className={`action`}
                      variant={enterprise ? `outline` : `default`}
                      disabled={enterprise}
                    >
                      {subscription
                        ? enterprise
                          ? t("sub.cannot-select")
                          : t("sub.renew")
                        : t("sub.upgrade")}
                    </Button>
                  </Upgrade>
                </div>
                <div className={`plan enterprise`}>
                  <div className={`title`}>{t("sub.enterprise")}</div>
                  <div className={`price`}>{t("sub.contact-sale")}</div>
                  <div className={`desc`}>
                    <div>
                      <ServerCog className={`h-4 w-4 mr-1`} />
                      {t("sub.enterprise-sla")}
                    </div>
                    <div>
                      <DatabaseZap className={`h-4 w-4 mr-1`} />
                      {t("sub.enterprise-service")}
                    </div>
                    <div>
                      <Zap className={`h-4 w-4 mr-1`} />
                      {t("sub.enterprise-speed")}
                    </div>
                    <div>
                      <Building2 className={`h-4 w-4 mr-1`} />
                      {t("sub.enterprise-deploy")}
                    </div>
                    <div>
                      <FolderGit2 className={`h-4 w-4 mr-1`} />
                      {t("sub.enterprise-data")}
                    </div>
                    <div>
                      <ShieldCheck className={`h-4 w-4 mr-1`} />
                      {t("sub.enterprise-security")}
                    </div>
                  </div>
                  <Button
                    className={`action`}
                    variant={`outline`}
                    onClick={() => {
                      window.open(
                        "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=1oKfIbNVXmMNMVzW1NiFSTKDcT1qIEq5&authKey=uslxslIBZtLImf4BSxjDqfx4hiJA52YV7PFM38W%2BOArr%2BhE0jwVdQCRYs0%2FXKX7W&noverify=0&group_code=565902327",
                        "_blank",
                      );
                    }}
                  >
                    {enterprise ? t("sub.current") : t("sub.contact-sale")}
                  </Button>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionDialog;

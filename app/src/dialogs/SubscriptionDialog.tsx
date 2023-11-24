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
  Calendar,
  Compass,
  HelpCircle,
  Image,
  ImagePlus,
  LifeBuoy,
  Newspaper,
  Plus,
  ServerCrash,
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
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

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

type TipsProps = {
  content: string;
}

function Tips({ content }: TipsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={`tips-icon`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
                {/*<div className={`plan free`}>*/}
                {/*  <div className={`title`}>{t("sub.free")}</div>*/}
                {/*  <div className={`price-wrapper`}>*/}
                {/*    <div className={`price`}>{t("sub.free-price")}</div>*/}
                {/*  </div>*/}
                {/*  <div className={`desc`}>*/}
                {/*    <div><Webhook className={`h-4 w-4 mr-1`} />{t("sub.free-api")}</div>*/}
                {/*    <div><Globe className={`h-4 w-4 mr-1`} />{t("sub.free-web")}</div>*/}
                {/*    <div><MessagesSquare className={`h-4 w-4 mr-1`} />{t("sub.free-conversation")}</div>*/}
                {/*    <div><Share2 className={`h-4 w-4 mr-1`} />{t("sub.free-sharing")}</div>*/}
                {/*    <div><MessageSquare className={`h-4 w-4 mr-1`} />{t("sub.free-models")}</div>*/}
                {/*  </div>*/}
                {/*  <Button className={`action`} variant={`outline`} disabled>*/}
                {/*    {subscription ? t("sub.cannot-select") : t("sub.current")}*/}
                {/*  </Button>*/}
                {/*</div>*/}
                <div className={`plan basic`}>
                  <div className={`title`}>{t("sub.base")}</div>
                  <div className={`price-wrapper`}>
                    <div className={`price`}>{t("sub.plan-price", { money: 18 })}</div>
                    <p className={`annotate`}>({t("sub.include-tax")})</p>
                  </div>
                  <div className={`desc`}>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", {times: 25})}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", {times: 5})}
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", {times: 25})}
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
                <div className={`plan standard`}>
                  <div className={`title`}>{t("sub.standard")}</div>
                  <div className={`price-wrapper`}>
                    <div className={`price`}>{t("sub.plan-price", { money: 36 })}</div>
                    <p className={`annotate`}>({t("sub.include-tax")})</p>
                  </div>
                  <div className={`desc`}>
                    <div><LifeBuoy className={`h-4 w-4 mr-1`} />{t("sub.pro-service")}</div>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", {times: 50})}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", {times: 10})}
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", {times: 100})}
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
                <div className={`plan pro`}>
                  <div className={`title`}>{t("sub.pro")}</div>
                  <div className={`price-wrapper`}>
                    <div className={`price`}>{t("sub.plan-price", { money: 72 })}</div>
                    <p className={`annotate`}>({t("sub.include-tax")})</p>
                  </div>
                  <div className={`desc`}>
                    <div><ServerCrash className={`h-4 w-4 mr-1`} />{t("sub.pro-thread")}</div>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", {times: 100})}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", {times: 20})}
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", {times: 200})}
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
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionDialog;

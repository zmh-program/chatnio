import {
  closeDialog,
  dialogSelector,
  expiredSelector,
  isSubscribedSelector,
  levelSelector,
  refreshSubscription,
  setDialog,
  usageSelector,
} from "@/store/subscription.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "@/assets/pages/subscription.less";
import {
  openDialog as openQuotaDialog,
  dialogSelector as quotaDialogSelector,
} from "@/store/quota.ts";
import {
  BookText,
  Calendar,
  Compass,
  Image,
  ImagePlus,
  LifeBuoy,
  Newspaper,
  ServerCrash,
} from "lucide-react";
import { useEffectAsync } from "@/utils/hook.ts";
import { selectAuthenticated } from "@/store/auth.ts";
import SubscriptionUsage from "@/components/home/subscription/SubscriptionUsage.tsx";
import Tips from "@/components/Tips.tsx";
import { subscriptionPrize } from "@/conf.ts";
import { Upgrade } from "@/components/home/subscription/BuyDialog.tsx";

function SubscriptionDialog() {
  const { t } = useTranslation();
  const open = useSelector(dialogSelector);
  const subscription = useSelector(isSubscribedSelector);
  const level = useSelector(levelSelector);
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
                  <SubscriptionUsage
                    icon={<Calendar />}
                    name={t("sub.expired")}
                    usage={expired}
                  />
                  <SubscriptionUsage
                    icon={<Image />}
                    name={"Midjourney"}
                    usage={usage?.["midjourney"]}
                  />
                  <SubscriptionUsage
                    icon={<Compass />}
                    name={"GPT-4"}
                    usage={usage?.["gpt-4"]}
                  />
                  <SubscriptionUsage
                    icon={<Newspaper />}
                    name={"Claude 100k"}
                    usage={usage?.["claude-100k"]}
                  />
                </div>
              )}
              <div className={`plan-wrapper`}>
                <div className={`plan basic`}>
                  <div className={`title`}>{t("sub.base")}</div>
                  <div className={`price-wrapper`}>
                    <div className={`price`}>
                      {t("sub.plan-price", { money: subscriptionPrize[1] })}
                    </div>
                    <p className={`annotate`}>({t("sub.include-tax")})</p>
                  </div>
                  <div className={`desc`}>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", { times: 25 })}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", { times: 50 })}
                    </div>
                  </div>
                  <Upgrade base={1} level={level} />
                </div>
                <div className={`plan standard`}>
                  <div className={`title`}>{t("sub.standard")}</div>
                  <div className={`price-wrapper`}>
                    <div className={`price`}>
                      {t("sub.plan-price", { money: subscriptionPrize[2] })}
                    </div>
                    <p className={`annotate`}>({t("sub.include-tax")})</p>
                  </div>
                  <div className={`desc`}>
                    <div>
                      <LifeBuoy className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-service")}
                    </div>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", { times: 50 })}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", { times: 5 })}
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", { times: 100 })}
                    </div>
                  </div>
                  <Upgrade base={2} level={level} />
                </div>
                <div className={`plan pro`}>
                  <div className={`title`}>{t("sub.pro")}</div>
                  <div className={`price-wrapper`}>
                    <div className={`price`}>
                      {t("sub.plan-price", { money: subscriptionPrize[3] })}
                    </div>
                    <p className={`annotate`}>({t("sub.include-tax")})</p>
                  </div>
                  <div className={`desc`}>
                    <div>
                      <ServerCrash className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-thread")}
                    </div>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", { times: 100 })}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", { times: 10 })}
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", { times: 200 })}
                    </div>
                  </div>
                  <Upgrade base={3} level={level} />
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

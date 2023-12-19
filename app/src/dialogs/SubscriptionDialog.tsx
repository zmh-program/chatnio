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
  Award,
  BookText,
  Calendar,
  Compass,
  ImagePlus,
  LifeBuoy,
  ServerCrash,
} from "lucide-react";
import { useEffectAsync } from "@/utils/hook.ts";
import { selectAuthenticated } from "@/store/auth.ts";
import SubscriptionUsage from "@/components/home/subscription/SubscriptionUsage.tsx";
import Tips from "@/components/Tips.tsx";
import { subscriptionPrize, subscriptionUsage } from "@/conf.ts";
import { Upgrade } from "@/components/home/subscription/BuyDialog.tsx";
import { useDeeptrain } from "@/utils/env.ts";

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

                  {Object.entries(subscriptionUsage).map(
                    ([key, props], index) =>
                      usage?.[key] && (
                        <SubscriptionUsage
                          {...props}
                          usage={usage?.[key]}
                          key={index}
                        />
                      ),
                  )}
                </div>
              )}
              <div className={`plan-wrapper`}>
                <div className={`plan basic`}>
                  <div className={`title`}>{t("sub.base")}</div>
                  <div className={`price-wrapper`}>
                    <div className={`price`}>
                      {t("sub.plan-price", { money: subscriptionPrize[1] })}
                    </div>
                    {useDeeptrain && (
                      <p className={`annotate`}>({t("sub.include-tax")})</p>
                    )}
                  </div>
                  <div className={`desc`}>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", { times: 150 })}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", { times: 50 })}
                      <Tips content={t("sub.plan-midjourney-desc")} />
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", { times: 300 })}
                      <Tips content={t("sub.plan-claude-desc")} />
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
                    {useDeeptrain && (
                      <p className={`annotate`}>({t("sub.include-tax")})</p>
                    )}
                  </div>
                  <div className={`desc`}>
                    <div>
                      <LifeBuoy className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-service")}
                    </div>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", { times: 300 })}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", { times: 100 })}
                      <Tips content={t("sub.plan-midjourney-desc")} />
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", { times: 600 })}
                      <Tips content={t("sub.plan-claude-desc")} />
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
                    {useDeeptrain && (
                      <p className={`annotate`}>({t("sub.include-tax")})</p>
                    )}
                  </div>
                  <div className={`desc`}>
                    <div>
                      <ServerCrash className={`h-4 w-4 mr-1`} />
                      {t("sub.pro-thread")}
                    </div>
                    <div>
                      <Compass className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-gpt4", { times: 600 })}
                      <Tips content={t("sub.plan-gpt4-desc")} />
                    </div>
                    <div>
                      <ImagePlus className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-midjourney", { times: 200 })}
                      <Tips content={t("sub.plan-midjourney-desc")} />
                    </div>
                    <div>
                      <BookText className={`h-4 w-4 mr-1`} />
                      {t("sub.plan-claude", { times: 1200 })}
                      <Tips content={t("sub.plan-claude-desc")} />
                    </div>
                  </div>
                  <div className={`award`}>
                    <Award className={`h-3 w-3 mb-1`} />
                    <div className={`mb-1`}>
                      {t("sub.pro-award", {
                        content:
                          "Poe Pro ($20)\n x \nMidjourney Base Plan ($10)",
                      })}
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

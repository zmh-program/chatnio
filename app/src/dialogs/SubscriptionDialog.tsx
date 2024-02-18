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
import { Calendar, Info } from "lucide-react";
import { useEffectAsync } from "@/utils/hook.ts";
import { selectAuthenticated } from "@/store/auth.ts";
import SubscriptionUsage from "@/components/home/subscription/SubscriptionUsage.tsx";
import Tips from "@/components/Tips.tsx";
import { Upgrade } from "@/components/home/subscription/BuyDialog.tsx";
import { useDeeptrain } from "@/conf/env.ts";
import { useMemo } from "react";
import {
  getPlan,
  getPlanName,
  SubscriptionIcon,
} from "@/conf/subscription.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { subscriptionDataSelector } from "@/store/globals.ts";
import { infoRelayPlanSelector } from "@/store/info.ts";

type PlanItemProps = {
  level: number;
};

function PlanItem({ level }: PlanItemProps) {
  const { t } = useTranslation();
  const current = useSelector(levelSelector);
  const subscriptionData = useSelector(subscriptionDataSelector);

  const plan = useMemo(
    () => getPlan(subscriptionData, level),
    [subscriptionData, level],
  );
  const name = useMemo(() => getPlanName(level), [level]);

  return (
    <div className={cn("plan", name)}>
      <div className={`title`}>{t(`sub.${name}`)}</div>
      <div className={`price-wrapper`}>
        <div className={`price`}>
          {t("sub.plan-price", { money: plan.price })}
        </div>
        {useDeeptrain && <p className={`annotate`}>({t("sub.include-tax")})</p>}
      </div>
      <div className={`desc`}>
        {plan.items.map((item, index) => (
          <div key={index}>
            <SubscriptionIcon type={item.icon} className={`h-4 w-4 mr-1`} />
            {item.value !== -1
              ? t("sub.plan-usage", { name: item.name, times: item.value })
              : t("sub.plan-unlimited-usage", { name: item.name })}
            <Tips>
              <div className={`api-tip text-center`}>
                <p>{t("sub.plan-tip")}</p>
                <div
                  className={`flex flex-row gap-2 mt-2 flex-wrap justify-center items-center max-w-[40vw]`}
                >
                  {item.models.map((model, index) => (
                    <Badge key={index} className={`whitespace-nowrap`}>
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            </Tips>
          </div>
        ))}
      </div>
      <Upgrade level={level} current={current} />
    </div>
  );
}

function SubscriptionDialog() {
  const { t } = useTranslation();
  const open = useSelector(dialogSelector);
  const subscription = useSelector(isSubscribedSelector);
  const level = useSelector(levelSelector);
  const expired = useSelector(expiredSelector);
  const usage = useSelector(usageSelector);
  const auth = useSelector(selectAuthenticated);
  const quota = useSelector(quotaDialogSelector);

  const subscriptionData = useSelector(subscriptionDataSelector);

  const relayPlan = useSelector(infoRelayPlanSelector);

  const plan = useMemo(
    () => getPlan(subscriptionData, level),
    [subscriptionData, level],
  );

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
            {subscriptionData.length > 0 ? (
              <div className={`sub-wrapper`}>
                <p
                  className={`link`}
                  onClick={() =>
                    quota
                      ? dispatch(closeDialog())
                      : dispatch(openQuotaDialog())
                  }
                >
                  {t("sub.quota-link")}
                </p>
                {!relayPlan && (
                  <div
                    className={`sub-tip flex flex-row items-center px-4 mx-auto select-none break-all`}
                  >
                    <Info className={`shrink-0 h-4 w-4 mr-1.5`} />
                    {t("sub.plan-not-support-relay")}
                  </div>
                )}
                {subscription && (
                  <div className={`sub-row`}>
                    <SubscriptionUsage
                      icon={<Calendar />}
                      name={t("sub.expired")}
                      usage={expired}
                    />

                    {plan.items.map(
                      (item, index) =>
                        usage?.[item.id] && (
                          <SubscriptionUsage
                            name={item.name}
                            icon={item.icon}
                            usage={usage?.[item.id]}
                            key={index}
                          />
                        ),
                    )}
                  </div>
                )}
                <div className={`plan-wrapper`}>
                  {subscriptionData.map((item, index) => (
                    <PlanItem key={index} level={item.level} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={`sub-wrapper`}>
                <p
                  className={`link`}
                  onClick={() =>
                    quota
                      ? dispatch(closeDialog())
                      : dispatch(openQuotaDialog())
                  }
                >
                  {t("sub.quota-link")}
                </p>
                <div className={`plan-wrapper`}>
                  <div className={`plan justify-center items-center`}>
                    <p className={`w-max`}>{t("sub.disable")}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionDialog;

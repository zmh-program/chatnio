import React, { useMemo } from "react";
import { buySubscription } from "@/api/addition.ts";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast.ts";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button.tsx";
import { expiredSelector, refreshSubscription } from "@/store/subscription.ts";
import { Plus } from "lucide-react";
import { ToastAction } from "@/components/ui/toast.tsx";
import { deeptrainEndpoint, useDeeptrain } from "@/conf/env.ts";
import { AppDispatch } from "@/store";
import { openDialog, quotaSelector } from "@/store/quota.ts";
import { getPlanPrice } from "@/conf/subscription.tsx";
import { Plans } from "@/api/types.tsx";
import { subscriptionDataSelector } from "@/store/globals.ts";
import { openWindow } from "@/utils/device.ts";
import { DeeptrainOnly } from "@/conf/deeptrain.tsx";

function countPrice(data: Plans, base: number, month: number): number {
  const price = getPlanPrice(data, base) * month;
  if (month >= 36) {
    return price * 0.7;
  } else if (month >= 12) {
    return price * 0.8;
  } else if (month >= 6) {
    return price * 0.9;
  }

  return price;
}

function countUpgradePrice(
  data: Plans,
  level: number,
  target: number,
  days: number,
): number {
  const bias = getPlanPrice(data, target) - getPlanPrice(data, level);
  const v = (bias / 30) * days;
  return (v > 0 ? v + 1 : 0) + 1; // time count offset
}

type UpgradeProps = {
  level: number;
  current: number;
};

async function callBuyAction(
  t: any,
  toast: any,
  dispatch: AppDispatch,
  month: number,
  level: number,
  current: number,
): Promise<boolean> {
  const res = await buySubscription(month, level);
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
      description: useDeeptrain
        ? t("sub.failed-prompt")
        : t("sub.failed-quota-prompt", {
            quota: current.toFixed(2),
          }),
      action: (
        <ToastAction
          altText={t("buy.go")}
          onClick={() =>
            useDeeptrain
              ? (location.href = `${deeptrainEndpoint}/home/wallet`)
              : dispatch(openDialog())
          }
        >
          {t("buy.go")}
        </ToastAction>
      ),
    });

    useDeeptrain
      ? setTimeout(() => {
          openWindow(`${deeptrainEndpoint}/home/wallet`);
        }, 2000)
      : dispatch(openDialog());
  }
  return res.status;
}

async function callMigrateAction(
  t: any,
  toast: any,
  level: number,
): Promise<boolean> {
  const res = await buySubscription(1, level);
  if (res.status) {
    toast({
      title: t("sub.migrate-success"),
      description: t("sub.migrate-success-prompt"),
    });
  } else {
    toast({
      title: t("sub.migrate-failed"),
      description: t("sub.sub-migrate-failed-prompt", { reason: res.error }),
    });
  }
  return res.status;
}

export function Upgrade({ level, current }: UpgradeProps) {
  const { t } = useTranslation();
  const expired = useSelector(expiredSelector);
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(1);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const quota = useSelector(quotaSelector);

  const subscriptionData = useSelector(subscriptionDataSelector);

  const isCurrent = useMemo(() => current === level, [current, level]);
  const isUpgrade = useMemo(() => current < level, [current, level]);

  return current === 0 || current === level ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`action`} variant={`default`}>
          {isCurrent ? t("sub.renew") : t("sub.subscribe")}
        </Button>
      </DialogTrigger>
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
            {t("sub.price", {
              price: countPrice(subscriptionData, level, month).toFixed(2),
            })}

            <DeeptrainOnly>
              <span className={`tax`}>
                &nbsp; (
                {t("sub.price-tax", {
                  price: (
                    countPrice(subscriptionData, level, month) * 0.25
                  ).toFixed(1),
                })}
                )
              </span>
            </DeeptrainOnly>
          </p>
        </div>
        <DialogFooter className={`translate-y-1.5`}>
          <DialogClose asChild>
            <Button variant={`outline`}>{t("cancel")}</Button>
          </DialogClose>
          <Button
            className={`mb-1.5`}
            onClick={async () => {
              const res = await callBuyAction(
                t,
                toast,
                dispatch,
                month,
                level,
                quota,
              );
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
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`action`}
          variant={isUpgrade ? `default` : `outline`}
        >
          {isUpgrade ? t("sub.upgrade") : t("sub.downgrade")}
        </Button>
      </DialogTrigger>
      <DialogContent className={`flex-dialog`}>
        <DialogHeader>
          <DialogTitle>{t("sub.migrate-plan")}</DialogTitle>
        </DialogHeader>
        <div className={`upgrade-wrapper`}>
          {t("sub.migrate-plan-desc")}

          {isUpgrade && (
            <p className={`price`}>
              {t("sub.upgrade-price", {
                price: countUpgradePrice(
                  subscriptionData,
                  current,
                  level,
                  expired,
                ).toFixed(2),
              })}
            </p>
          )}
        </div>
        <DialogFooter className={`translate-y-1.5`}>
          <DialogClose asChild>
            <Button variant={`outline`}>{t("cancel")}</Button>
          </DialogClose>
          <Button
            className={`mb-1.5`}
            onClick={async () => {
              const res = await callMigrateAction(t, toast, level);
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

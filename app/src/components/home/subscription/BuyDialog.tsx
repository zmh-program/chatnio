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
import { subscriptionPrize } from "@/conf.ts";
import { ToastAction } from "@/components/ui/toast.tsx";

function countPrize(base: number, month: number): number {
  const prize = subscriptionPrize[base] * month;
  if (month >= 36) {
    return prize * 0.7;
  } else if (month >= 12) {
    return prize * 0.8;
  } else if (month >= 6) {
    return prize * 0.9;
  }

  return prize;
}

function countUpgradePrize(
  level: number,
  target: number,
  days: number,
): number {
  const bias = subscriptionPrize[target] - subscriptionPrize[level];
  return (bias / 30) * days;
}

type UpgradeProps = {
  base: number;
  level: number;
};

async function callBuyAction(
  t: any,
  toast: any,
  month: number,
  level: number,
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
      description: t("sub.failed-prompt"),
      action: (
        <ToastAction
          altText={t("buy.go")}
          onClick={() => (location.href = "https://deeptrain.net/home/wallet")}
        >
          {t("buy.go")}
        </ToastAction>
      ),
    });
    setTimeout(() => {
      window.open("https://deeptrain.net/home/wallet");
    }, 2000);
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
      description: t("sub.migrate-failed-prompt"),
    });
  }
  return res.status;
}

export function Upgrade({ base, level }: UpgradeProps) {
  const { t } = useTranslation();
  const expired = useSelector(expiredSelector);
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(1);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const isCurrent = useMemo(() => level === base, [level, base]);
  const isUpgrade = useMemo(() => level < base, [level, base]);

  return level === 0 || level === base ? (
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
            {t("sub.price", { price: countPrize(base, month).toFixed(2) })}
          </p>
        </div>
        <DialogFooter className={`translate-y-1.5`}>
          <DialogClose asChild>
            <Button variant={`outline`}>{t("cancel")}</Button>
          </DialogClose>
          <Button
            className={`mb-1.5`}
            onClick={async () => {
              const res = await callBuyAction(t, toast, month, base);
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
                price: countUpgradePrize(level, base, expired).toFixed(2),
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
              const res = await callMigrateAction(t, toast, base);
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

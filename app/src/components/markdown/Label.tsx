import { appLogo } from "@/conf/env.ts";
import {
  CalendarPlus,
  Cloud,
  CloudCog,
  Cloudy,
  Package,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { openDialog as openQuotaDialog } from "@/store/quota.ts";
import { openDialog as openSubscriptionDialog } from "@/store/subscription.ts";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { subscriptionDataSelector } from "@/store/globals.ts";
import { useTranslation } from "react-i18next";

type QuotaExceededFormProps = {
  model: string;
  minimum: string;
  quota: string;
  plan: boolean;
};

function QuotaExceededForm({
  model,
  minimum,
  quota,
  plan,
}: QuotaExceededFormProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <div className={`flex flex-col items-center min-w-[40vw] p-2`}>
      <img src={appLogo} alt={""} className={`w-16 h-16 m-6 inline-block`} />
      <div
        className={`prompt-row flex flex-row w-full items-center justify-center px-4 py-2`}
      >
        <Package className={`h-4 w-4 mr-1`} />
        {t("model")}
        <div className={`grow`} />
        <p className={`value`}>{model}</p>
      </div>
      <div
        className={`prompt-row flex flex-row w-full items-center justify-center px-4 py-2`}
      >
        <Cloudy className={`h-4 w-4 mr-1`} />
        {t("your-quota")}
        <div className={`grow`} />
        <p className={`value`}>
          {quota}
          <Cloud className={`h-4 w-4 ml-1`} />
        </p>
      </div>
      <div
        className={`prompt-row flex flex-row w-full items-center justify-center px-4 py-2`}
      >
        <CloudCog className={`h-4 w-4 mr-1`} />
        {t("min-quota")}
        <div className={`grow`} />
        <p className={`value`}>
          {minimum}
          <Cloud className={`h-4 w-4 ml-1`} />
        </p>
      </div>
      <Button
        className={`mt-4 w-full`}
        onClick={() => dispatch(openQuotaDialog())}
      >
        <Plus className={`h-4 w-4 mr-1`} />
        {t("buy.dialog-title")}
      </Button>
      {plan && (
        <Button
          variant={`outline`}
          className={`mt-2 w-full`}
          onClick={() => dispatch(openSubscriptionDialog())}
        >
          <CalendarPlus className={`h-4 w-4 mr-1`} />
          {t("sub.dialog-title")}
        </Button>
      )}
    </div>
  );
}

type LabelProps = {
  children: React.ReactNode;
};

export default function ({ children }: LabelProps) {
  const subscription = useSelector(subscriptionDataSelector);
  const content = (children ?? "").toString();

  if (content.startsWith("user quota")) {
    // if the format is `user quota is not enough error (model: gpt-3.5-turbo-1106, minimum quota: 0.01, your quota: -77.77)`, return special component

    const match = content.match(
      /user quota is not enough error \(model: (.*), minimum quota: (.*), your quota: (.*)\)/,
    );
    if (match) {
      const [, model, minimum, quota] = match;
      const plan = subscription
        .flatMap((p) => p.items.map((i) => i.models.includes(model)))
        .includes(true);

      return (
        <QuotaExceededForm
          model={model}
          minimum={minimum}
          quota={quota}
          plan={plan}
        />
      );
    }
  }

  return <p>{children}</p>;
}

import SelectGroup, { SelectItemProps } from "@/components/SelectGroup.tsx";
import { supportModels } from "@/conf";
import {
  openMarket,
  selectModel,
  selectModelList,
  setModel,
} from "@/store/chat.ts";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated } from "@/store/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { Model, Plans } from "@/api/types.ts";
import { modelEvent } from "@/events/model.ts";
import { levelSelector } from "@/store/subscription.ts";
import { teenagerSelector } from "@/store/package.ts";
import { ToastAction } from "@/components/ui/toast.tsx";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { goAuth } from "@/utils/app.ts";
import { includingModelFromPlan } from "@/conf/subscription.tsx";
import { subscriptionDataSelector } from "@/store/globals.ts";

function GetModel(name: string): Model {
  return supportModels.find((model) => model.id === name) as Model;
}

type ModelSelectorProps = {
  side?: "left" | "right" | "top" | "bottom";
};

function filterModel(data: Plans, model: Model, level: number) {
  if (includingModelFromPlan(data, level, model.id)) {
    return {
      name: model.id,
      value: model.name,
      badge: { variant: "gold", name: "plus" },
    } as SelectItemProps;
  }

  return {
    name: model.id,
    value: model.name,
    badge: model.free && { variant: "default", name: "free" },
  } as SelectItemProps;
}

function ModelFinder(props: ModelSelectorProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const model = useSelector(selectModel);
  const auth = useSelector(selectAuthenticated);
  const level = useSelector(levelSelector);
  const student = useSelector(teenagerSelector);
  const list = useSelector(selectModelList);

  const subscriptionData = useSelector(subscriptionDataSelector);

  const [sync, setSync] = useState<boolean>(false);

  modelEvent.bind((target: string) => {
    if (supportModels.find((m) => m.id === target)) {
      if (model === target) return;
      console.debug(`[chat] toggle model from event: ${target}`);
      dispatch(setModel(target));
    }
  });

  const models = useMemo(() => {
    const raw = list.length
      ? supportModels.filter((model) => list.includes(model.id))
      : supportModels.filter((model) => model.default);

    if (raw.length === 0)
      raw.push({
        name: "default",
        id: "default",
      } as Model);

    return [
      ...raw.map(
        (model: Model): SelectItemProps =>
          filterModel(subscriptionData, model, level),
      ),
      {
        icon: <Sparkles size={16} />,
        name: "market",
        value: t("market.model"),
      },
    ];
  }, [supportModels, subscriptionData, level, student, sync]);

  const current = useMemo((): SelectItemProps => {
    const raw = models.find((item) => item.name === model);
    return raw || models[0];
  }, [models, model]);

  useEffect(() => {
    setInterval(() => {
      if (supportModels.length === 0) return;
      setSync(!sync);
    }, 500);
  }, []);

  return (
    <SelectGroup
      current={current}
      list={models}
      maxElements={3}
      side={props.side}
      classNameMobile={`model-select-group`}
      onChange={(value: string) => {
        if (value === "market") {
          dispatch(openMarket());
          return;
        }
        const model = GetModel(value);
        console.debug(`[model] select model: ${model.name} (id: ${model.id})`);

        if (!auth && model.auth) {
          toast({
            title: t("login-require"),
            action: (
              <ToastAction altText={t("login")} onClick={goAuth}>
                {t("login")}
              </ToastAction>
            ),
          });
          return;
        }
        dispatch(setModel(value));
      }}
    />
  );
}

export default ModelFinder;

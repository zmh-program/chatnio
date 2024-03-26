import SelectGroup, { SelectItemProps } from "@/components/SelectGroup.tsx";
import {
  openMarket,
  selectModel,
  selectModelList,
  selectSupportModels,
  setModel,
} from "@/store/chat.ts";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated } from "@/store/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { Model, Plans } from "@/api/types.tsx";
import { modelEvent } from "@/events/model.ts";
import { levelSelector } from "@/store/subscription.ts";
import { teenagerSelector } from "@/store/package.ts";
import { ToastAction } from "@/components/ui/toast.tsx";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { goAuth } from "@/utils/app.ts";
import { includingModelFromPlan } from "@/conf/subscription.tsx";
import { subscriptionDataSelector } from "@/store/globals.ts";

function GetModel(models: Model[], name: string): Model {
  return models.find((model) => model.id === name) as Model;
}

type ModelSelectorProps = {
  side?: "left" | "right" | "top" | "bottom";
};

function formatModel(data: Plans, model: Model, level: number) {
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

  const supportModels = useSelector(selectSupportModels);
  const modelList = useSelector(selectModelList);
  const subscriptionData = useSelector(subscriptionDataSelector);

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

    return raw.map((model) => formatModel(subscriptionData, model, level));
  }, [supportModels, subscriptionData, level, student, modelList]);

  const current = useMemo((): SelectItemProps => {
    const raw = models.find((item) => item.name === model);
    return raw || models[0];
  }, [models, model, supportModels, modelList]);

  return (
    <SelectGroup
      current={current}
      list={models}
      maxElements={3}
      side={props.side}
      classNameMobile={`model-select-group`}
      selectGroupTop={{
        icon: <Sparkles size={16} />,
        name: "market",
        value: t("market.model"),
      }}
      onChange={(value: string) => {
        if (value === "market") {
          dispatch(openMarket());
          return;
        }
        const model = GetModel(supportModels, value);
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

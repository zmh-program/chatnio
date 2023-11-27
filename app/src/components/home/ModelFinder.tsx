import SelectGroup, { SelectItemProps } from "@/components/SelectGroup.tsx";
import { expensiveModels, login, supportModels } from "@/conf.ts";
import {
  getPlanModels,
  openMarket,
  selectModel,
  selectModelList,
  setModel,
} from "@/store/chat.ts";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated } from "@/store/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { Model } from "@/api/types.ts";
import { modelEvent } from "@/events/model.ts";
import { levelSelector } from "@/store/subscription.ts";
import { teenagerSelector } from "@/store/package.ts";
import { ToastAction } from "@/components/ui/toast.tsx";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";

function GetModel(name: string): Model {
  return supportModels.find((model) => model.id === name) as Model;
}

type ModelSelectorProps = {
  side?: "left" | "right" | "top" | "bottom";
};

function filterModel(model: Model, level: number) {
  if (getPlanModels(level).includes(model.id)) {
    return {
      name: model.id,
      value: model.name,
      badge: { variant: "gold", name: "plus" },
    } as SelectItemProps;
  } else if (expensiveModels.includes(model.id)) {
    return {
      name: model.id,
      value: model.name,
      badge: { variant: "gold", name: "expensive" },
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

  modelEvent.bind((target: string) => {
    if (supportModels.find((m) => m.id === target)) {
      if (model === target) return;
      console.debug(`[chat] toggle model from event: ${target}`);
      dispatch(setModel(target));
    }
  });

  const models = useMemo(() => {
    const raw = supportModels.filter((model) => list.includes(model.id));
    return [
      ...raw.map((model: Model): SelectItemProps => filterModel(model, level)),
      {
        icon: <Sparkles size={16} />,
        name: "market",
        value: t("market.model"),
      },
    ];
  }, [supportModels, level, student]);

  return (
    <SelectGroup
      current={models.find((item) => item.name === model) as SelectItemProps}
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
              <ToastAction altText={t("login")} onClick={login}>
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

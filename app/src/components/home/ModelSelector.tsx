import SelectGroup, { SelectItemProps } from "@/components/SelectGroup.tsx";
import { login, planModels, supportModels } from "@/conf.ts";
import { selectModel, setModel } from "@/store/chat.ts";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated } from "@/store/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { Model } from "@/conversation/types.ts";
import { modelEvent } from "@/events/model.ts";
import { isSubscribedSelector } from "@/store/subscription.ts";
import { teenagerSelector } from "@/store/package.ts";
import { ToastAction } from "@/components/ui/toast.tsx";

function GetModel(name: string): Model {
  return supportModels.find((model) => model.id === name) as Model;
}

type ModelSelectorProps = {
  side?: "left" | "right" | "top" | "bottom";
};

function ModelSelector(props: ModelSelectorProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const model = useSelector(selectModel);
  const auth = useSelector(selectAuthenticated);
  const subscription = useSelector(isSubscribedSelector);
  const student = useSelector(teenagerSelector);

  modelEvent.bind((target: string) => {
    if (supportModels.find((m) => m.id === target)) {
      if (model === target) return;
      console.debug(`[chat] toggle model from event: ${target}`);
      dispatch(setModel(target));
    }
  });

  const list = supportModels.map((model: Model): SelectItemProps => {
    if (subscription && planModels.includes(model.id)) {
      return {
        name: model.id,
        value: model.name,
        badge: { variant: "gold", name: "plus" },
      } as SelectItemProps;
    } else if (student && model.id === "claude-2-100k") {
      return {
        name: model.id,
        value: model.name,
        badge: { variant: "gold", name: "student" },
      } as SelectItemProps;
    }

    return {
      name: model.id,
      value: model.name,
      badge: model.free && { variant: "default", name: "free" },
    } as SelectItemProps;
  });

  return (
    <SelectGroup
      current={list.find((item) => item.name === model) as SelectItemProps}
      list={list}
      maxElements={6}
      side={props.side}
      classNameMobile={`model-select-group`}
      onChange={(value: string) => {
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

export default ModelSelector;

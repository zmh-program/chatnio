import SelectGroup, { SelectItemProps } from "../SelectGroup.tsx";
import { supportModels } from "../../conf.ts";
import { selectModel, setModel } from "../../store/chat.ts";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated } from "../../store/auth.ts";
import { useToast } from "../ui/use-toast.ts";
import { useEffect } from "react";
import { Model } from "../../conversation/types.ts";
import { modelEvent } from "../../events/model.ts";

function GetModel(name: string): Model {
  return supportModels.find((model) => model.id === name) as Model;
}

function ModelSelector() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const model = useSelector(selectModel);
  const auth = useSelector(selectAuthenticated);

  useEffect(() => {
    if (auth && model === "GPT-3.5") dispatch(setModel("GPT-3.5-16k"));
  }, [auth]);

  modelEvent.bind((target: string) => {
    if (supportModels.find((m) => m.id === target)) {
      if (model === target) return;
      console.debug(`[chat] toggle model from event: ${target}`);
      dispatch(setModel(target));
    }
  });

  const list = supportModels.map(
    (model: Model): SelectItemProps => ({
      name: model.id,
      value: model.name,
      badge: model.free ? "free" : undefined,
    }),
  );

  return (
    <SelectGroup
      current={list.find((item) => item.name === model) as SelectItemProps}
      list={list}
      maxElements={6}
      onChange={(value: string) => {
        const model = GetModel(value);
        console.debug(`[model] select model: ${model.name} (id: ${model.id})`);

        if (!auth && model.auth) {
          toast({
            title: t("login-require"),
          });
          return;
        }
        dispatch(setModel(value));
      }}
    />
  );
}

export default ModelSelector;

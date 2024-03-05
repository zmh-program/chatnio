import { useMemo, useState } from "react";
import { getUniqueList } from "@/utils/base.ts";
import { defaultChannelModels } from "@/admin/channel.ts";
import { getApiMarket, getApiModels } from "@/api/v1.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { Model } from "@/api/types.tsx";

export type onStateChange<T> = (state: boolean, data?: T) => void;

export const useAllModels = (onStateChange?: onStateChange<string[]>) => {
  const [allModels, setAllModels] = useState<string[]>([]);

  const update = async () => {
    onStateChange?.(false, allModels);
    const models = await getApiModels();
    onStateChange?.(true, models.data);

    setAllModels(models.data);
  };

  useEffectAsync(update, []);

  return {
    allModels,
    update,
  };
};

export const useChannelModels = (onStateChange?: onStateChange<string[]>) => {
  const { allModels, update } = useAllModels(onStateChange);

  const channelModels = useMemo(
    () => getUniqueList([...allModels, ...defaultChannelModels]),
    [allModels],
  );

  return {
    channelModels,
    allModels,
    update,
  };
};

export const useSupportModels = (onStateChange?: onStateChange<Model[]>) => {
  const [supportModels, setSupportModels] = useState<Model[]>([]);

  const update = async () => {
    onStateChange?.(false, supportModels);
    const market = await getApiMarket();
    onStateChange?.(true, market);

    setSupportModels(market);
  };

  useEffectAsync(update, []);

  return {
    supportModels,
    update,
  };
};

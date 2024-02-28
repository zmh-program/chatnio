import { useMemo, useState } from "react";
import { getUniqueList } from "@/utils/base.ts";
import { defaultChannelModels } from "@/admin/channel.ts";
import { getApiModels } from "@/api/v1.ts";
import { useEffectAsync } from "@/utils/hook.ts";

export const useSupportModels = () => {
  const [supportModels, setSupportModels] = useState<string[]>([]);

  const update = async () => {
    const models = await getApiModels();
    setSupportModels(models.data);
  };

  useEffectAsync(update, []);

  return {
    supportModels,
    update,
  };
};

export const useChannelModels = () => {
  const { supportModels, update } = useSupportModels();

  const channelModels = useMemo(
    () => getUniqueList([...supportModels, ...defaultChannelModels]),
    [supportModels],
  );

  return {
    channelModels,
    update,
  };
};

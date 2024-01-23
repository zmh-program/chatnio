import NavBar from "./NavBar.tsx";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import DialogManager from "@/dialogs";
import Broadcast from "@/components/Broadcast.tsx";
import { useEffectAsync } from "@/utils/hook.ts";
import { allModels, supportModels } from "@/conf";
import { channelModels } from "@/admin/channel.ts";
import {
  getApiCharge,
  getApiMarket,
  getApiModels,
  getApiPlans,
} from "@/api/v1.ts";
import { loadPreferenceModels } from "@/conf/storage.ts";
import { resetJsArray } from "@/utils/base.ts";
import { useDispatch } from "react-redux";
import { initChatModels } from "@/store/chat.ts";
import { Model } from "@/api/types.ts";
import { ChargeProps, nonBilling } from "@/admin/charge.ts";
import { dispatchSubscriptionData } from "@/store/globals.ts";
import { marketEvent } from "@/events/market.ts";

function AppProvider() {
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    marketEvent.emit(false);

    const market = await getApiMarket();
    const charge = await getApiCharge();

    market.forEach((item: Model) => {
      const obj = charge.find((i: ChargeProps) => i.models.includes(item.id));
      if (!obj) return;

      item.free = obj.type === nonBilling;
      item.auth = !item.free || !obj.anonymous;
    });

    resetJsArray(supportModels, loadPreferenceModels(market));
    resetJsArray(
      allModels,
      supportModels.map((model) => model.id),
    );
    initChatModels(dispatch);

    const models = await getApiModels();
    models.forEach((model: string) => {
      if (!allModels.includes(model)) allModels.push(model);
      if (!channelModels.includes(model)) channelModels.push(model);
    });

    dispatchSubscriptionData(dispatch, await getApiPlans());

    marketEvent.emit(true);
  }, [allModels]);

  return (
    <>
      <Broadcast />
      <NavBar />
      <ThemeProvider />
      <DialogManager />
    </>
  );
}

export default AppProvider;

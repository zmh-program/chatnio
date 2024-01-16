import NavBar from "./NavBar.tsx";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import DialogManager from "@/dialogs";
import Broadcast from "@/components/Broadcast.tsx";
import { useEffectAsync } from "@/utils/hook.ts";
import { allModels, subscriptionData, supportModels } from "@/conf";
import { channelModels } from "@/admin/channel.ts";
import {
  getApiCharge,
  getApiMarket,
  getApiModels,
  getApiPlans,
} from "@/api/v1.ts";
import { loadPreferenceModels } from "@/utils/storage.ts";
import { resetJsArray } from "@/utils/base.ts";
import { useDispatch } from "react-redux";
import { initChatModels } from "@/store/chat.ts";
import { Model, Plan } from "@/api/types.ts";
import { ChargeProps, nonBilling } from "@/admin/charge.ts";

function AppProvider() {
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    const market = await getApiMarket();
    const charge = await getApiCharge();

    market.forEach((item: Model) => {
      const obj = charge.find((i: ChargeProps) => i.models.includes(item.id));
      if (!obj) return;

      item.free = obj.type === nonBilling;
      item.auth = item.free && !obj.anonymous;
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

    const plans = await getApiPlans();
    resetJsArray(
      subscriptionData,
      plans.filter((plan: Plan) => plan.level !== 0),
    );
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

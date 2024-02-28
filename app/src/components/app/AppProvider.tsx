import NavBar from "./NavBar.tsx";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import DialogManager from "@/dialogs";
import Broadcast from "@/components/Broadcast.tsx";
import { useEffectAsync } from "@/utils/hook.ts";
import { supportModels } from "@/conf";
import { getApiCharge, getApiMarket, getApiPlans } from "@/api/v1.ts";
import { loadPreferenceModels } from "@/conf/storage.ts";
import { resetJsArray } from "@/utils/base.ts";
import { useDispatch } from "react-redux";
import { initChatModels, updateMasks } from "@/store/chat.ts";
import { Model } from "@/api/types.ts";
import { ChargeProps, nonBilling } from "@/admin/charge.ts";
import { dispatchSubscriptionData, setTheme } from "@/store/globals.ts";
import { infoEvent } from "@/events/info.ts";
import { setForm } from "@/store/info.ts";
import { themeEvent } from "@/events/theme.ts";

function AppProvider() {
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    infoEvent.bind((data) => dispatch(setForm(data)));
    themeEvent.bind((theme) => dispatch(setTheme(theme)));

    await updateMasks(dispatch);
  }, []);

  useEffectAsync(async () => {
    const market = await getApiMarket();
    const charge = await getApiCharge();

    market.forEach((item: Model) => {
      const instance = charge.find((i: ChargeProps) =>
        i.models.includes(item.id),
      );
      if (!instance) return;

      item.free = instance.type === nonBilling;
      item.auth = !item.free || !instance.anonymous;
      item.price = { ...instance };
    });

    resetJsArray(supportModels, loadPreferenceModels(market));
    initChatModels(dispatch);

    dispatchSubscriptionData(dispatch, await getApiPlans());
  }, []);

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

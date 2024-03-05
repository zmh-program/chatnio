import { createSlice } from "@reduxjs/toolkit";
import { Plans } from "@/api/types.tsx";
import { AppDispatch, RootState } from "@/store/index.ts";
import { getOfflinePlans, setOfflinePlans } from "@/conf/storage.ts";
import { getTheme, Theme } from "@/components/ThemeProvider.tsx";

type GlobalState = {
  theme: Theme;
  subscription: Plans;
};

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    theme: getTheme(),
    subscription: getOfflinePlans(),
  } as GlobalState,
  reducers: {
    setSubscription: (state, action) => {
      const plans = action.payload as Plans;
      state.subscription = plans;
      setOfflinePlans(plans);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { setSubscription, setTheme } = globalSlice.actions;

export default globalSlice.reducer;

export const subscriptionDataSelector = (state: RootState): Plans =>
  state.global.subscription;
export const themeSelector = (state: RootState): Theme => state.global.theme;

export const dispatchSubscriptionData = (
  dispatch: AppDispatch,
  subscription: Plans,
) => {
  dispatch(setSubscription(subscription));
};

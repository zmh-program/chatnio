import { createSlice } from "@reduxjs/toolkit";
import { Plans } from "@/api/types.ts";
import { AppDispatch, RootState } from "@/store/index.ts";
import { getOfflinePlans, setOfflinePlans } from "@/conf/storage.ts";

type GlobalState = {
  subscription: Plans;
};

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    subscription: getOfflinePlans(),
  } as GlobalState,
  reducers: {
    setSubscription: (state, action) => {
      const plans = action.payload as Plans;
      state.subscription = plans;
      setOfflinePlans(plans);
    },
  },
});

export const { setSubscription } = globalSlice.actions;

export default globalSlice.reducer;

export const subscriptionDataSelector = (state: RootState): Plans =>
  state.global.subscription;

export const dispatchSubscriptionData = (
  dispatch: AppDispatch,
  subscription: Plans,
) => {
  dispatch(setSubscription(subscription));
};

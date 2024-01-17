import { createSlice } from "@reduxjs/toolkit";
import { getSubscription } from "@/api/addition.ts";
import { AppDispatch } from "./index.ts";

export const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    dialog: false,
    is_subscribed: false,
    level: 0,
    enterprise: false,
    expired: 0,
    usage: {
      gpt4: 0,
    },
  },
  reducers: {
    toggleDialog: (state) => {
      if (!state.dialog) return;
      state.dialog = !state.dialog;
    },
    setDialog: (state, action) => {
      state.dialog = action.payload as boolean;
    },
    openDialog: (state) => {
      state.dialog = true;
    },
    closeDialog: (state) => {
      state.dialog = false;
    },
    updateSubscription: (state, action) => {
      state.is_subscribed = action.payload.is_subscribed;
      state.expired = action.payload.expired;
      state.usage = action.payload.usage;
      state.enterprise = action.payload.enterprise;
      state.level = action.payload.level;
    },
  },
});

export const {
  toggleDialog,
  setDialog,
  openDialog,
  closeDialog,
  updateSubscription,
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

export const dialogSelector = (state: any): boolean =>
  state.subscription.dialog;
export const isSubscribedSelector = (state: any): boolean =>
  state.subscription.is_subscribed;
export const levelSelector = (state: any): number => state.subscription.level;
export const expiredSelector = (state: any): number =>
  state.subscription.expired;
export const usageSelector = (state: any): any => state.subscription.usage;
export const enterpriseSelector = (state: any): boolean =>
  state.subscription.enterprise;

export const refreshSubscription = async (dispatch: AppDispatch) => {
  const response = await getSubscription();
  if (response.status) dispatch(updateSubscription(response));
};

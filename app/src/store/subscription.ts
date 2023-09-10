import { createSlice } from "@reduxjs/toolkit";
import {getSubscription} from "../conversation/addition.ts";

export const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    dialog: false,
    is_subscribed: false,
    expired: 0,
  },
  reducers: {
    toggleDialog: (state) => {
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

export const dialogSelector = (state: any): boolean => state.subscription.dialog;
export const isSubscribedSelector = (state: any): boolean => state.subscription.is_subscribed;
export const expiredSelector = (state: any): number => state.subscription.expired;

export const refreshSubscription = async (dispatch: any) => {
  const current = new Date().getTime(); //@ts-ignore
  if (window.hasOwnProperty("subscription") && current - window.subscription < 2500)
    return; //@ts-ignore
  window.subscription = current;

  const response = await getSubscription();
  if (response.status) dispatch(updateSubscription(response));
};

export const refreshSubscriptionTask = (dispatch: any) => {
  setInterval(() => refreshSubscription(dispatch), 20000);
  refreshSubscription(dispatch).then();
};

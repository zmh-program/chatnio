import { createSlice } from "@reduxjs/toolkit";
import {RootState} from "./index.ts";

export const quotaSlice = createSlice({
  name: "quota",
  initialState: {
    dialog: false,
    quota: 0.,
  },
  reducers: {
    toggleDialog: (state) => {
      state.dialog = !state.dialog;
    },
    setDialog: (state, action) => {
      state.dialog = action.payload as boolean;
    },
    closeDialog: (state) => {
      state.dialog = false;
    },
    setQuota: (state, action) => {
      state.quota = action.payload as number;
    },
    increaseQuota: (state, action) => {
      state.quota += action.payload as number;
    },
    decreaseQuota: (state, action) => {
      state.quota -= action.payload as number;
    },
  },
});

export const { toggleDialog, setDialog, closeDialog, setQuota, increaseQuota, decreaseQuota } = quotaSlice.actions;
export default quotaSlice.reducer;

export const dialogSelector = (state: RootState): boolean => state.quota.dialog;
export const quotaValueSelector = (state: RootState): number => state.quota.quota;
export const quotaSelector = (state: RootState): string => state.quota.quota.toFixed(2);


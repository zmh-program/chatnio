import { createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./index.ts";
import axios from "axios";

export const quotaSlice = createSlice({
  name: "quota",
  initialState: {
    dialog: false,
    quota: 0,
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

export const {
  toggleDialog,
  setDialog,
  openDialog,
  closeDialog,
  setQuota,
  increaseQuota,
  decreaseQuota,
} = quotaSlice.actions;
export default quotaSlice.reducer;

export const dialogSelector = (state: RootState): boolean => state.quota.dialog;
export const quotaValueSelector = (state: RootState): number =>
  state.quota.quota;
export const quotaSelector = (state: RootState): string =>
  state.quota.quota.toFixed(2);

export const refreshQuota = async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get("/quota");
    if (response.data.status) dispatch(setQuota(response.data.quota));
  } catch (e) {
    console.warn(e);
  }
};

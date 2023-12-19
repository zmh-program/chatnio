import { createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./index.ts";
import { getQuota } from "@/api/quota.ts";

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
export const quotaSelector = (state: RootState): number => state.quota.quota;

export const refreshQuota = async (dispatch: AppDispatch) => {
  const quota = await getQuota();
  dispatch(setQuota(quota));
};

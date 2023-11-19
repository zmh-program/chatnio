import { createSlice } from "@reduxjs/toolkit";
import { getPackage } from "@/api/addition.ts";
import { AppDispatch } from "./index.ts";

export const packageSlice = createSlice({
  name: "package",
  initialState: {
    dialog: false,
    cert: false,
    teenager: false,
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
    refreshState: (state, action) => {
      state.cert = action.payload.cert;
      state.teenager = action.payload.teenager;
    },
  },
});

export const {
  toggleDialog,
  setDialog,
  openDialog,
  closeDialog,
  refreshState,
} = packageSlice.actions;
export default packageSlice.reducer;

export const dialogSelector = (state: any): boolean => state.package.dialog;
export const certSelector = (state: any): boolean => state.package.cert;
export const teenagerSelector = (state: any): boolean => state.package.teenager;

export const refreshPackage = async (dispatch: AppDispatch) => {
  const response = await getPackage();
  if (response.status) dispatch(refreshState(response));
};

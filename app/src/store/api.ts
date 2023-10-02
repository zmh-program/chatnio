import { createSlice } from "@reduxjs/toolkit";
import { getKey } from "../conversation/addition.ts";
import { AppDispatch } from "./index.ts";

export const apiSlice = createSlice({
  name: "api",
  initialState: {
    dialog: false,
    key: "",
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
    setKey: (state, action) => {
      state.key = action.payload as string;
    },
  },
});

export const { toggleDialog, setDialog, openDialog, closeDialog, setKey } =
  apiSlice.actions;
export default apiSlice.reducer;

export const dialogSelector = (state: any): boolean => state.api.dialog;
export const keySelector = (state: any): string => state.api.key;

export const getPackage = async (dispatch: AppDispatch) => {
  const response = await getKey();
  if (response.status) dispatch(setKey(response.key));
};

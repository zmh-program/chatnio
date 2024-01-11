import { createSlice } from "@reduxjs/toolkit";
import { getKey, regenerateKey } from "@/api/addition.ts";
import { AppDispatch, RootState } from "./index.ts";

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

export const dialogSelector = (state: RootState): boolean => state.api.dialog;
export const keySelector = (state: RootState): string => state.api.key;

export const getApiKey = async (dispatch: AppDispatch, retries?: boolean) => {
  const response = await getKey();
  if (response.status) {
    if (response.key.length === 0 && retries !== false) {
      await getApiKey(dispatch, false);
      return;
    }
    dispatch(setKey(response.key));
  }
};

export const regenerateApiKey = async (dispatch: AppDispatch) => {
  const response = await regenerateKey();
  if (response.status) {
    dispatch(setKey(response.key));
  }

  return response;
};

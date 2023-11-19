import { createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./index.ts";
import {
  deleteSharing,
  listSharing,
  SharingPreviewForm,
} from "@/api/sharing.ts";

export const sharingSlice = createSlice({
  name: "sharing",
  initialState: {
    dialog: false,
    data: [] as SharingPreviewForm[],
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
    setData: (state, action) => {
      state.data = action.payload as SharingPreviewForm[];
    },
    removeData: (state, action) => {
      const hash = action.payload as string;
      state.data = state.data.filter((item) => item.hash !== hash);
    },
  },
});

export const {
  toggleDialog,
  setDialog,
  openDialog,
  closeDialog,
  setData,
  removeData,
} = sharingSlice.actions;
export default sharingSlice.reducer;

export const dialogSelector = (state: RootState): boolean =>
  state.sharing.dialog;
export const dataSelector = (state: RootState): SharingPreviewForm[] =>
  state.sharing.data;

export const syncData = async (dispatch: AppDispatch): Promise<string> => {
  const response = await listSharing();

  if (response.status) dispatch(setData(response.data));

  return response.status ? "" : response.message;
};

export const deleteData = async (
  dispatch: AppDispatch,
  hash: string,
): Promise<string> => {
  const response = await deleteSharing(hash);
  if (response.status) dispatch(removeData(hash));

  return response.status ? "" : response.message;
};

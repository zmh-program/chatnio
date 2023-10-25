import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./index.ts";

export const invitationSlice = createSlice({
  name: "invitation",
  initialState: {
    dialog: false,
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
  },
});

export const { toggleDialog, setDialog, openDialog, closeDialog } =
  invitationSlice.actions;
export default invitationSlice.reducer;

export const dialogSelector = (state: RootState): boolean =>
  state.invitation.dialog;

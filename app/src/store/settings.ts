import { createSlice } from "@reduxjs/toolkit";
import { getMemory, setMemory } from "@/utils/memory.ts";
import { RootState } from "@/store/index.ts";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    dialog: false,
    context: getMemory("context") !== "false",
    align: getMemory("align") !== "false",
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
    setContext: (state, action) => {
      state.context = action.payload as boolean;
      setMemory("context", String(action.payload));
    },
    setAlign: (state, action) => {
      state.align = action.payload as boolean;
      setMemory("align", String(action.payload));
    },
  },
});

export const {
  toggleDialog,
  setDialog,
  openDialog,
  closeDialog,
  setContext,
  setAlign,
} = settingsSlice.actions;
export default settingsSlice.reducer;

export const dialogSelector = (state: RootState): boolean =>
  state.settings.dialog;
export const contextSelector = (state: RootState): boolean =>
  state.settings.context;
export const alignSelector = (state: RootState): boolean =>
  state.settings.align;

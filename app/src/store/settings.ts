import { createSlice } from "@reduxjs/toolkit";
import {
  getBooleanMemory,
  getNumberMemory,
  setBooleanMemory,
  setNumberMemory,
} from "@/utils/memory.ts";
import { RootState } from "@/store/index.ts";

export const sendKeys = ["Ctrl + Enter", "Enter"];
export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    dialog: false,
    context: getBooleanMemory("context", true),
    align: getBooleanMemory("align", false),
    history: getNumberMemory("history_context", 8),
    sender: getBooleanMemory("sender", false),
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
      setBooleanMemory("context", action.payload);
    },
    setAlign: (state, action) => {
      state.align = action.payload as boolean;
      setBooleanMemory("align", action.payload);
    },
    setHistory: (state, action) => {
      state.history = action.payload as number;
      setNumberMemory("history_context", action.payload);
    },
    setSender: (state, action) => {
      state.sender = action.payload as boolean;
      setBooleanMemory("sender", action.payload);
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
  setHistory,
  setSender,
} = settingsSlice.actions;
export default settingsSlice.reducer;

export const dialogSelector = (state: RootState): boolean =>
  state.settings.dialog;
export const contextSelector = (state: RootState): boolean =>
  state.settings.context;
export const alignSelector = (state: RootState): boolean =>
  state.settings.align;
export const historySelector = (state: RootState): number =>
  state.settings.history;
export const senderSelector = (state: RootState): boolean =>
  state.settings.sender;

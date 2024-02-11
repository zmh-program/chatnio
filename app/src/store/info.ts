import { createSlice } from "@reduxjs/toolkit";
import { InfoForm } from "@/events/info.ts";
import { RootState } from "@/store/index.ts";
import {
  getBooleanMemory,
  getMemory,
  setBooleanMemory,
  setMemory,
} from "@/utils/memory.ts";

export const infoSlice = createSlice({
  name: "info",
  initialState: {
    mail: getBooleanMemory("mail", false),
    contact: getMemory("contact"),
  } as InfoForm,
  reducers: {
    setForm: (state, action) => {
      const form = action.payload as InfoForm;
      state.mail = form.mail ?? false;
      state.contact = form.contact ?? "";

      setBooleanMemory("mail", state.mail);
      setMemory("contact", state.contact);
    },
  },
});

export const { setForm } = infoSlice.actions;

export default infoSlice.reducer;

export const infoDataSelector = (state: RootState): InfoForm => state.info;
export const infoMailSelector = (state: RootState): boolean => state.info.mail;
export const infoContactSelector = (state: RootState): string =>
  state.info.contact;

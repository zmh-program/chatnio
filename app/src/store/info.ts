import { createSlice } from "@reduxjs/toolkit";
import { InfoForm } from "@/events/info.ts";
import { RootState } from "@/store/index.ts";

export const infoSlice = createSlice({
  name: "info",
  initialState: {
    mail: false,
  } as InfoForm,
  reducers: {
    setForm: (state, action) => {
      const form = action.payload as InfoForm;
      state.mail = form.mail ?? false;
    },
  },
});

export const { setForm } = infoSlice.actions;

export default infoSlice.reducer;

export const infoDataSelector = (state: RootState): InfoForm => state.info;
export const infoMailSelector = (state: RootState): boolean => state.info.mail;

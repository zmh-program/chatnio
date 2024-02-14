import { createSlice } from "@reduxjs/toolkit";
import { InfoForm } from "@/events/info.ts";
import { RootState } from "@/store/index.ts";
import {
  getArrayMemory,
  getBooleanMemory,
  getMemory,
  setArrayMemory,
  setBooleanMemory,
  setMemory,
} from "@/utils/memory.ts";

export const infoSlice = createSlice({
  name: "info",
  initialState: {
    mail: getBooleanMemory("mail", false),
    contact: getMemory("contact"),
    article: getArrayMemory("article"),
    generation: getArrayMemory("generation"),
    footer: getMemory("footer"),
    auth_footer: getBooleanMemory("auth_footer", false),
    relay_plan: getBooleanMemory("relay_plan", false),
  } as InfoForm,
  reducers: {
    setForm: (state, action) => {
      const form = action.payload as InfoForm;
      state.mail = form.mail ?? false;
      state.contact = form.contact ?? "";
      state.article = form.article ?? [];
      state.generation = form.generation ?? [];
      state.footer = form.footer ?? "";
      state.auth_footer = form.auth_footer ?? false;
      state.relay_plan = form.relay_plan ?? false;

      setBooleanMemory("mail", state.mail);
      setMemory("contact", state.contact);
      setArrayMemory("article", state.article);
      setArrayMemory("generation", state.generation);
      setMemory("footer", state.footer);
      setBooleanMemory("auth_footer", state.auth_footer);
      setBooleanMemory("relay_plan", state.relay_plan);
    },
  },
});

export const { setForm } = infoSlice.actions;

export default infoSlice.reducer;

export const infoDataSelector = (state: RootState): InfoForm => state.info;
export const infoMailSelector = (state: RootState): boolean => state.info.mail;
export const infoContactSelector = (state: RootState): string =>
  state.info.contact;
export const infoArticleSelector = (state: RootState): string[] =>
  state.info.article;
export const infoGenerationSelector = (state: RootState): string[] =>
  state.info.generation;
export const infoFooterSelector = (state: RootState): string =>
  state.info.footer;
export const infoAuthFooterSelector = (state: RootState): boolean =>
  state.info.auth_footer;
export const infoRelayPlanSelector = (state: RootState): boolean =>
  state.info.relay_plan;

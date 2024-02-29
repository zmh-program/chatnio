import { createSlice } from "@reduxjs/toolkit";
import { ConversationInstance, Model } from "@/api/types.ts";
import { Message } from "@/api/types.ts";
import { insertStart } from "@/utils/base.ts";
import { AppDispatch, RootState } from "./index.ts";
import {
  getArrayMemory,
  getBooleanMemory,
  getMemory,
  setArrayMemory,
  setMemory,
} from "@/utils/memory.ts";
import {
  getOfflineModels,
  loadPreferenceModels,
  setOfflineModels,
} from "@/conf/storage.ts";
import { CustomMask } from "@/masks/types.ts";
import { listMasks } from "@/api/mask.ts";

type initialStateType = {
  history: ConversationInstance[];
  messages: Message[];
  model: string;
  web: boolean;
  current: number;
  model_list: string[];
  market: boolean;
  mask: boolean;
  custom_masks: CustomMask[];
  support_models: Model[];
};

export function inModel(supportModels: Model[], model: string): boolean {
  return (
    model.length > 0 &&
    supportModels.filter((item: Model) => item.id === model).length > 0
  );
}

export function getModel(
  supportModels: Model[],
  model: string | undefined | null,
): string {
  if (supportModels.length === 0) return "";
  return model && inModel(supportModels, model) ? model : supportModels[0].id;
}

export function getModelList(
  supportModels: Model[],
  models: string[],
  select: string,
): string[] {
  const list = models.filter((item) => inModel(supportModels, item));
  const target = list.length
    ? list
    : supportModels.filter((item) => item.default).map((item) => item.id);
  const selection = getModel(supportModels, select);
  if (!target.includes(selection)) target.push(selection);
  return target;
}

const offline = loadPreferenceModels(getOfflineModels());
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    history: [],
    messages: [],
    web: getBooleanMemory("web", false),
    current: -1,
    model: getModel(offline, getMemory("model")),
    model_list: getModelList(
      offline,
      getArrayMemory("model_list"),
      getMemory("model"),
    ),
    market: false,
    mask: false,
    custom_masks: [],
    support_models: offline,
  } as initialStateType,
  reducers: {
    setHistory: (state, action) => {
      state.history = action.payload as ConversationInstance[];
    },
    removeHistory: (state, action) => {
      state.history = state.history.filter(
        (item) => item.id !== (action.payload as number),
      );
    },
    addHistory: (state, action) => {
      const name = action.payload.message as string;
      const id = state.history.length
        ? Math.max(...state.history.map((item) => item.id)) + 1
        : 1;

      state.history = insertStart(state.history, { id, name, message: [] });
      state.current = id;
      action.payload.hook(id);
    },
    setMessages: (state, action) => {
      state.messages = action.payload as Message[];
    },
    setModel: (state, action) => {
      setMemory("model", action.payload as string);
      state.model = action.payload as string;
    },
    setWeb: (state, action) => {
      setMemory("web", action.payload ? "true" : "false");
      state.web = action.payload as boolean;
    },
    toggleWeb: (state) => {
      const web = !state.web;
      setMemory("web", web ? "true" : "false");
      state.web = web;
    },
    setCurrent: (state, action) => {
      state.current = action.payload as number;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload as Message);
    },
    setMessage: (state, action) => {
      state.messages[state.messages.length - 1] = action.payload as Message;
    },
    setModelList: (state, action) => {
      const models = action.payload as string[];
      state.model_list = models.filter((item) =>
        inModel(state.support_models, item),
      );
      setArrayMemory("model_list", models);
    },
    addModelList: (state, action) => {
      const model = action.payload as string;
      if (
        inModel(state.support_models, model) &&
        !state.model_list.includes(model)
      ) {
        state.model_list.push(model);
        setArrayMemory("model_list", state.model_list);
      }
    },
    removeModelList: (state, action) => {
      const model = action.payload as string;
      if (
        inModel(state.support_models, model) &&
        state.model_list.includes(model)
      ) {
        state.model_list = state.model_list.filter((item) => item !== model);
        setArrayMemory("model_list", state.model_list);
      }
    },
    setMarket: (state, action) => {
      state.market = action.payload as boolean;
    },
    openMarket: (state) => {
      state.market = true;
    },
    closeMarket: (state) => {
      state.market = false;
    },
    setMask: (state, action) => {
      state.mask = action.payload as boolean;
    },
    openMask: (state) => {
      state.mask = true;
    },
    closeMask: (state) => {
      state.mask = false;
    },
    setCustomMasks: (state, action) => {
      state.custom_masks = action.payload as CustomMask[];
    },
    setSupportModels: (state, action) => {
      const models = action.payload as Model[];

      state.support_models = models;
      state.model = getModel(models, getMemory("model"));
      state.model_list = getModelList(
        models,
        getArrayMemory("model_list"),
        getMemory("model"),
      );

      setOfflineModels(models);
    },
  },
});

export const {
  setHistory,
  removeHistory,
  addHistory,
  setCurrent,
  setMessages,
  setModel,
  setWeb,
  toggleWeb,
  addMessage,
  setMessage,
  setModelList,
  addModelList,
  removeModelList,
  setMarket,
  openMarket,
  closeMarket,
  setMask,
  openMask,
  closeMask,
  setCustomMasks,
  setSupportModels,
} = chatSlice.actions;
export const selectHistory = (state: RootState): ConversationInstance[] =>
  state.chat.history;
export const selectMessages = (state: RootState): Message[] =>
  state.chat.messages;
export const selectModel = (state: RootState): string => state.chat.model;
export const selectWeb = (state: RootState): boolean => state.chat.web;
export const selectCurrent = (state: RootState): number => state.chat.current;
export const selectModelList = (state: RootState): string[] =>
  state.chat.model_list;
export const selectMarket = (state: RootState): boolean => state.chat.market;
export const selectMask = (state: RootState): boolean => state.chat.mask;
export const selectCustomMasks = (state: RootState): CustomMask[] =>
  state.chat.custom_masks;
export const selectSupportModels = (state: RootState): Model[] =>
  state.chat.support_models;

export const updateMasks = async (dispatch: AppDispatch) => {
  const resp = await listMasks();
  resp.data.length > 0 && dispatch(setCustomMasks(resp.data));

  return resp;
};

export const updateSupportModels = (dispatch: AppDispatch, models: Model[]) => {
  dispatch(setSupportModels(loadPreferenceModels(models)));
};

export default chatSlice.reducer;

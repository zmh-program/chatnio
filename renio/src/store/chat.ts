import {createSlice} from "@reduxjs/toolkit";
import {ConversationInstance} from "../conversation/types.ts";
import {Message} from "postcss";

type initialStateType = {
  history: ConversationInstance[];
  messages: Message[];
  gpt4: boolean;
  web: boolean;
  current: number;
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    history: [],
    messages: [],
    gpt4: false,
    web: true,
    current: -1,
  } as initialStateType,
  reducers: {
    setHistory: (state, action) => {
      state.history = action.payload as ConversationInstance[];
    },
    removeHistory: (state, action) => {
      state.history = state.history.filter((item) => item.id !== (action.payload as number));
    },
    setMessages: (state, action) => {
      state.messages = action.payload as Message[];
    },
    setGPT4: (state, action) => {
      state.gpt4 = action.payload as boolean;
    },
    setWeb: (state, action) => {
      state.web = action.payload as boolean;
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
  }
});

export const {setHistory, removeHistory, setCurrent, setMessages, setGPT4, setWeb, addMessage, setMessage} = chatSlice.actions;
export const selectHistory = (state: any) => state.chat.history;
export const selectMessages = (state: any) => state.chat.messages;
export const selectGPT4 = (state: any) => state.chat.gpt4;
export const selectWeb = (state: any) => state.chat.web;
export const selectCurrent = (state: any) => state.chat.current;

export default chatSlice.reducer;

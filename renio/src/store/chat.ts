import {createSlice} from "@reduxjs/toolkit";

type Message = {
  id: string;
  text: string;
  isBot: boolean;
}

type initialStateType = {
  messages: Message[];
  gpt4: boolean;
  web: boolean;
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    gpt4: false,
    web: false,
  } as initialStateType,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setGPT4: (state, action) => {
      state.gpt4 = action.payload;
    },
    setWeb: (state, action) => {
      state.web = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload as Message);
    },
    setMessage: (state, action) => {
      state.messages[state.messages.length - 1] = action.payload as Message;
    }
  }
});

export const {setMessages, addMessage, setMessage, setGPT4, setWeb} = chatSlice.actions;
export default chatSlice.reducer;
